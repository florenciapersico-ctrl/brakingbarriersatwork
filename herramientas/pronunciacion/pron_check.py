#!/usr/bin/env python3
"""pron_check.py <audio> [--json out.json] [--words cached_words.json] [--min-conf 0.5]

Detecta errores de pronunciacion tipicos de hispanohablantes en ingles.

Pipeline (CPU):
 1. faster-whisper large-v3: palabras + timestamps + probabilidad.
 2. wav2vec2-lv-60-espeak-cv-ft: posteriores de fonemas (CTC) cada 20 ms.
 3. Pronunciacion esperada por palabra con espeak-ng (phonemizer) + reglas
    de contexto para homografos (live adj/verbo, read, etc.).
 4. Para cada palabra se generan "variantes de error" tipicas de hispanohablantes
    (live->/lIv/, -ed con silaba extra, v->b, th->t/d/s/f, I<->i:, e- epentetica,
    -s final omitida, schwa como vocal plena) y se compara la verosimilitud CTC de
    la variante contra la canonica, en una ventana que incluye las palabras
    vecinas como contexto (tolera timestamps imprecisos).
 5. Salida: mm:ss · palabra · esperado /…/ · se oyo /…/ · tipo · confianza
"""
import argparse, json, math, os, re, subprocess, sys, tempfile, time

import numpy as np
import torch
import torch.nn.functional as F

W2V = "facebook/wav2vec2-lv-60-espeak-cv-ft"
SR = 16000
FRAME = 0.02  # s por frame de wav2vec2

# ---------------------------------------------------------------- audio
def load_wav(path):
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-ac", "1",
                    "-ar", str(SR), tmp], check=True)
    import soundfile as sf
    wav, sr = sf.read(tmp, dtype="float32")
    os.unlink(tmp)
    return wav, tmp

# ---------------------------------------------------------------- 1. whisper
def whisper_words(path, model_name="large-v3"):
    from faster_whisper import WhisperModel
    m = WhisperModel(model_name, device="cpu", compute_type="int8",
                     cpu_threads=os.cpu_count() or 4)
    segs, _ = m.transcribe(path, language="en", word_timestamps=True,
                           condition_on_previous_text=False, beam_size=5)
    out = []
    for s in segs:
        for w in s.words:
            out.append(dict(w=w.word.strip(), s=float(w.start), e=float(w.end),
                            p=float(w.probability)))
    return out

# ---------------------------------------------------------------- 2. phone posteriors
class PhoneModel:
    def __init__(self):
        from transformers import AutoProcessor, AutoModelForCTC
        self.proc = AutoProcessor.from_pretrained(W2V)
        self.model = AutoModelForCTC.from_pretrained(W2V).eval()
        self.vocab = self.proc.tokenizer.get_vocab()
        self.inv = {i: t for t, i in self.vocab.items()}
        self.blank = self.vocab["<pad>"]

    @torch.inference_mode()
    def logprobs(self, wav, chunk=20.0, overlap=2.0):
        """log-posteriores (T, C) para todo el audio, en ventanas con solape."""
        n = len(wav); T = int(math.ceil(n / 320)) + 1
        out = None; filled = np.zeros(T, bool)
        step = chunk - overlap; start = 0.0
        while True:
            a = int(start * SR); b = min(n, int((start + chunk) * SR))
            x = self.proc(wav[a:b], sampling_rate=SR, return_tensors="pt").input_values
            lp = F.log_softmax(self.model(x).logits[0], -1).numpy()
            if out is None:
                out = np.zeros((T, lp.shape[1]), np.float32)
            f0 = int(round(start / FRAME))
            keep_from = 0 if start == 0 else int(overlap / 2 / FRAME)
            for i in range(keep_from, lp.shape[0]):
                if f0 + i < T:
                    out[f0 + i] = lp[i]; filled[f0 + i] = True
            if b >= n:
                break
            start += step
        last = np.where(filled)[0].max()
        return out[: last + 1]

    def greedy(self, lp):
        ids = lp.argmax(-1); res = []; prev = -1
        for i in ids:
            if i != prev and i != self.blank:
                res.append(self.inv[int(i)])
            prev = i
        return res

    def ctc_ll(self, lp, phones):
        """log P(phones | segmento) con CTC (normalizado por frames no aplica)."""
        ids = [self.vocab[p] for p in phones if p in self.vocab]
        if not ids or lp.shape[0] < len(ids):
            return -1e9
        t = torch.from_numpy(lp).unsqueeze(1)
        loss = F.ctc_loss(t, torch.tensor([ids]), torch.tensor([lp.shape[0]]),
                          torch.tensor([len(ids)]), blank=self.blank,
                          reduction="sum", zero_infinity=True)
        return -float(loss)

def force_align(lp, seqs, blank):
    """Viterbi CTC: alinea la concatenacion de seqs (lista de listas de ids) al audio.
    Devuelve [(f_ini, f_fin)] por cada sub-lista (None si vacia)."""
    toks, owner = [], []
    for k, s in enumerate(seqs):
        for t in s:
            toks.append(t); owner.append(k)
    S = 2 * len(toks) + 1
    lab = np.full(S, blank); lab[1::2] = toks
    T = lp.shape[0]
    NEG = -1e30
    dp = np.full(S, NEG); dp[0] = lp[0, blank]
    if S > 1: dp[1] = lp[0, lab[1]]
    bp = np.zeros((T, S), np.int8)
    skip_ok = np.zeros(S, bool)
    for s in range(2, S):
        skip_ok[s] = lab[s] != blank and lab[s] != lab[s - 2]
    for t in range(1, T):
        a = dp
        b = np.concatenate([[NEG], dp[:-1]])
        c = np.concatenate([[NEG, NEG], dp[:-2]]); c[~skip_ok] = NEG
        st = np.stack([a, b, c]); arg = st.argmax(0)
        dp = st.max(0) + lp[t, lab]
        bp[t] = arg
    s = S - 1 if dp[S - 1] >= dp[S - 2] else S - 2
    path = np.zeros(T, int)
    for t in range(T - 1, -1, -1):
        path[t] = s; s -= int(bp[t, s])
    spans = [None] * len(seqs)
    for t in range(T):
        st = path[t]
        if st % 2 == 1:
            k = owner[st // 2]
            spans[k] = (t, t) if spans[k] is None else (spans[k][0], t)
    return spans

# ---------------------------------------------------------------- 3. expected phones
_cache = {}
def g2p(word):
    """fonemas espeak (en-us) de una palabra aislada, como lista."""
    if word in _cache:
        return _cache[word]
    from phonemizer import phonemize
    from phonemizer.separator import Separator
    s = phonemize([word], language="en-us", backend="espeak",
                  separator=Separator(phone=" ", word=" | "), strip=True,
                  preserve_punctuation=False)[0]
    ph = [p for p in s.replace("|", " ").split() if p]
    _cache[word] = ph
    return ph

def fit_vocab(phones, vocab):
    out = []
    for p in phones:
        if p in vocab:
            out.append(p)
        elif p.endswith("ː") and p[:-1] in vocab:
            out.append(p[:-1])
        else:  # dividir en caracteres
            out.extend(c for c in p if c in vocab)
    return out

VERB_CTX = {"i", "you", "we", "they", "to", "don't", "didn't", "doesn't", "people",
            "who", "can", "will", "would", "could", "should", "still", "and", "lets",
            "let's", "must", "might", "where", "we'll", "i'll", "they'll"}

def expected(words, i):
    w = norm(words[i]["w"])
    raw = re.sub(r"[^A-Za-z0-9']", "", words[i]["w"])
    ph = g2p(raw.lower()) if raw else []
    prev = norm(words[i - 1]["w"]) if i > 0 else ""
    if w == "live":  # homografo: adjetivo/adverbio /laIv/ vs verbo /lIv/
        ph = ["l", "ɪ", "v"] if prev in VERB_CTX else ["l", "aɪ", "v"]
    if w == "lives" and prev not in VERB_CTX and prev not in {"he", "she", "it"}:
        ph = ["l", "aɪ", "v", "z"] if prev in {"the", "their", "our", "my", "your", "his", "her"} else ph
    return ph

FUNC = {"a", "an", "the", "we", "he", "she", "me", "be", "is", "it", "in", "if", "his", "him",
        "with", "will", "this", "its", "it's", "is", "been", "see", "these", "three", "need", "we've",
        "we'll", "we're", "still", "did", "will", "which", "if", "until", "it'll"}
_cmu = None
def in_dict(w):
    """True si la palabra esta en CMUdict (data/cmudict.dict junto al script)."""
    global _cmu
    if _cmu is None:
        p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "cmudict.dict")
        _cmu = set()
        if os.path.exists(p):
            for line in open(p, encoding="utf-8", errors="ignore"):
                _cmu.add(line.split(" ", 1)[0].split("(")[0])
        else:
            return True
    return w in _cmu

def norm(w):
    return re.sub(r"[^a-z']", "", w.lower())

# ---------------------------------------------------------------- 4. error variants
VOWELS = {"a", "e", "i", "o", "u", "ɪ", "ɛ", "æ", "ʌ", "ə", "ɚ", "ɑ", "ɔ", "ʊ", "iː", "uː",
          "ɑː", "ɔː", "ɜː", "ɜ", "aɪ", "eɪ", "oʊ", "aʊ", "ɔɪ", "ᵻ", "ɐ", "ɪɹ", "ɛɹ", "ʊɹ",
          "ɑːɹ", "ɔːɹ", "oːɹ", "aɪɚ", "aɪə", "iə", "əl"}
CONS = lambda p: p not in VOWELS

def variants(word, ph, is_adj_live):
    """[(tipo, fonemas_variante, prior_logodds, descripcion)]"""
    V = []
    w = word
    # live adjetivo pronunciado como verbo
    if w == "live" and is_adj_live:
        V.append(("vocal aɪ→ɪ (live adj. como verbo 'vivir')", ["l", "ɪ", "v"], 0.0))
        V.append(("vocal aɪ→i", ["l", "i", "v"], -0.5))
    # -ed con silaba extra
    if w.endswith("ed") and len(ph) >= 2 and ph[-1] in ("t", "d") and ph[-2] not in ("ᵻ", "ɪ", "ə", "ɛ"):
        base = ph[:-1]
        for vow, pr in (("ᵻ", 0.0), ("ɪ", 0.0), ("ɛ", 0.0), ("e", -0.3)):
            V.append(("-ed con sílaba extra (/ɪd/ en vez de /%s/)" % ph[-1], base + [vow, "d"], pr))
            V.append(("-ed con sílaba extra (/ɪd/ en vez de /%s/)" % ph[-1], base + [vow, "t"], pr - 0.3))
    # v -> b
    for k, p in enumerate(ph):
        if p == "v":
            for sub in ("b", "β"):
                V.append(("/v/→/b/", ph[:k] + [sub] + ph[k + 1:], -0.5))
    # th
    for k, p in enumerate(ph):
        if p == "θ":
            for sub in ("t", "s", "f"):
                V.append(("th sorda /θ/→/%s/" % sub, ph[:k] + [sub] + ph[k + 1:], -0.5))
        if p == "ð" and k == 0 and w not in {"the", "that", "this", "these", "those", "them", "they", "then", "than", "there", "their"}:
            # en palabras funcionales /d/ es habitual incluso en nativos: no se marca
            V.append(("th sonora /ð/→/d/", ph[:k] + ["d"] + ph[k + 1:], -1.0))
    # vocal corta/larga
    for k, p in enumerate(ph):
        if w in FUNC:
            continue
        if p == "ɪ" and len(ph) <= 6:  # solo palabras cortas (sílaba acentuada probable)
            V.append(("vocal corta /ɪ/→/i/ (ship→sheep)", ph[:k] + ["i"] + ph[k + 1:], -0.7))
            V.append(("vocal corta /ɪ/→/i/ (ship→sheep)", ph[:k] + ["iː"] + ph[k + 1:], -0.7))
        if p == "iː" and len(ph) <= 6:
            V.append(("vocal larga /iː/→/ɪ/ (sheep→ship)", ph[:k] + ["ɪ"] + ph[k + 1:], -0.7))
    # e- epentetica
    if len(ph) >= 2 and ph[0] == "s" and CONS(ph[1]):
        for e in ("ɛ", "e", "ə"):
            V.append(("e- epentética ('es-' antes de s+consonante)", [e] + ph, -0.3))
    # -s final omitida
    if len(ph) >= 3 and ph[-1] in ("s", "z") and CONS(ph[-2]) and w.endswith("s") and w not in FUNC:
        V.append(("-s final omitida", ph[:-1], -0.8))
    # schwa como vocal plena (solo una vocal de la ortografia)
    if "ə" in ph and len(ph) >= 4:
        letters = [c for c in w if c in "aeiou"]
        for k, p in enumerate(ph):
            if p == "ə":
                for full in set(letters) & {"a", "e", "o"}:
                    V.append(("schwa /ə/ como vocal plena /%s/" % full, ph[:k] + [full] + ph[k + 1:], -1.2))
    return V

# ---------------------------------------------------------------- main
def fmt_t(s):
    return "%d:%02d" % (int(s // 60), int(s % 60))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--json", help="guardar resultados en JSON")
    ap.add_argument("--words", help="usar/guardar cache de palabras de whisper")
    ap.add_argument("--min-conf", type=float, default=0.75)
    ap.add_argument("--all", action="store_true", help="mostrar todas las palabras evaluadas")
    a = ap.parse_args()
    t0 = time.time()

    import soundfile as sf
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a.audio, "-ac", "1", "-ar", str(SR), tmp], check=True)
    wav, _ = sf.read(tmp, dtype="float32")
    dur = len(wav) / SR

    if a.words and os.path.exists(a.words):
        words = json.load(open(a.words))
    else:
        words = whisper_words(tmp)
        if a.words:
            json.dump(words, open(a.words, "w"), indent=0)
    # quitar duplicados consecutivos (alucinacion tipica: "requests. requests.")
    dedup = []
    for w in words:
        if dedup and norm(dedup[-1]["w"]) == norm(w["w"]) and w["s"] - dedup[-1]["e"] < 0.3 and w["p"] < 0.3:
            continue
        dedup.append(w)
    words = [w for w in dedup if norm(w["w"])]
    t1 = time.time()

    pm = PhoneModel()
    lp = pm.logprobs(wav)
    t2 = time.time()
    os.unlink(tmp)

    def frames(s, e):
        return max(0, int(s / FRAME)), min(lp.shape[0], int(math.ceil(e / FRAME)) + 1)

    exp = [fit_vocab(expected(words, i), pm.vocab) for i in range(len(words))]
    # alineacion forzada por tramos (pausas > 0.5 s segun whisper) para refinar limites
    spans = [None] * len(words)
    groups, cur = [], [0]
    for i in range(1, len(words)):
        if words[i]["s"] - words[i - 1]["e"] > 0.5:
            groups.append(cur); cur = []
        cur.append(i)
    groups.append(cur)
    for g in groups:
        f0, f1 = frames(max(0, words[g[0]]["s"] - 0.6), words[g[-1]]["e"] + 0.6)
        sp = force_align(lp[f0:f1], [[pm.vocab[p] for p in exp[i]] for i in g], pm.blank)
        for i, s_ in zip(g, sp):
            if s_ is not None:
                spans[i] = (f0 + s_[0], f0 + s_[1] + 1)
    for i, w in enumerate(words):
        if spans[i] is None:
            spans[i] = frames(w["s"], w["e"])
    # decodificacion libre de fonemas (sin texto) y asignacion a palabras por frame
    ids = lp.argmax(-1); free = []; prev = -1
    for t, k in enumerate(ids):
        if k != prev and k != pm.blank:
            free.append((t, pm.inv[int(k)]))
        prev = k
    results = []
    for i, w in enumerate(words):
        word = norm(w["w"])
        ph = exp[i]
        if not ph or not word.isalpha() and "'" not in word:
            continue
        if not in_dict(word.replace("'", "'")):
            continue  # nombre propio / palabra no inglesa (p.ej. "Vigia"): sin referencia fiable
        adj_live = word == "live" and ph == ["l", "aɪ", "v"]
        V = variants(word, ph, adj_live)
        nxt = norm(words[i + 1]["w"]) if i + 1 < len(words) else ""
        if nxt[:1] in ("s", "z"):  # la -s se funde con la palabra siguiente
            V = [v for v in V if v[0] != "-s final omitida"]
        if not V:
            continue
        # ventana con contexto: palabra anterior + palabra + siguiente
        L = exp[i - 1] if i > 0 else []
        R = exp[i + 1] if i + 1 < len(words) else []
        f0 = max(0, (spans[i - 1][0] if i > 0 else spans[i][0]) - 5)
        f1 = min(lp.shape[0], (spans[i + 1][1] if i + 1 < len(words) else spans[i][1]) + 5)
        seg = lp[f0:f1]
        ll_c = pm.ctc_ll(seg, L + ph + R)
        best = {}
        for typ, vph, prior in V:
            ll = pm.ctc_ll(seg, L + vph + R) + prior
            if typ not in best or ll > best[typ][0]:
                best[typ] = (ll, vph)
        # se oyo: decodificacion greedy en la ventana estricta de la palabra
        a0, a1 = spans[i]
        heard = [p for t, p in free if a0 - 1 <= t < a1 + 1]
        t_word = a0 * FRAME
        for typ, (ll, vph) in best.items():
            diff = ll - ll_c
            conf = 1 / (1 + math.exp(-diff))  # P(variante | {canonica, variante})
            # la baja probabilidad de whisper refuerza (el ASR "duda" de la palabra)
            if w["p"] < 0.5 and conf > 0.5:
                conf = min(0.99, conf + 0.1 * (0.5 - w["p"]) * 2)
            r = dict(t=t_word, mmss=fmt_t(t_word), word=w["w"].strip(".,?!"), expected="".join(ph),
                     variant="".join(vph), heard="".join(heard), type=typ, conf=round(conf, 3),
                     llr=round(diff, 2), asr_p=round(w["p"], 2))
            results.append(r)

    # una fila por palabra: el tipo de error mas probable
    byw = {}
    for r in results:
        k = (r["t"], r["word"])
        if k not in byw or r["conf"] > byw[k]["conf"]:
            byw[k] = r
    rows = sorted(byw.values(), key=lambda r: r["t"])
    t3 = time.time()

    flagged = [r for r in rows if r["conf"] >= a.min_conf]
    for r in (rows if a.all else flagged):
        lvl = "alta" if r["conf"] >= 0.9 else "media" if r["conf"] >= 0.75 else "baja"
        print(f"{r['mmss']} · {r['word']} · esperado /{r['expected']}/ · se oyó /{r['heard']}/ "
              f"(mejor ajuste /{r['variant']}/) · {r['type']} · confianza {r['conf']:.2f} ({lvl})")
    print(f"\n# {len(flagged)} marcas | audio {dur:.1f}s | whisper {t1-t0:.1f}s, fonemas {t2-t1:.1f}s, "
          f"análisis {t3-t2:.1f}s | total {t3-t0:.1f}s ({(t3-t0)/dur*60:.0f}s por minuto)", file=sys.stderr)
    if a.json:
        json.dump(dict(rows=rows, words=words, timing=dict(total=t3 - t0, dur=dur)),
                  open(a.json, "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
