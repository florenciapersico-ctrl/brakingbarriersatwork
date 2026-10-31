"""Pruebas de las reglas de Flor: corren sin internet ni credenciales."""
import importlib

import pytest


@pytest.fixture
def guard(monkeypatch):
    monkeypatch.setenv("BBAW_DRY_RUN", "0")
    from bbaw import config, guard as g
    importlib.reload(config)
    importlib.reload(g)
    return g


FLOR = "florenciapersico@breakingbarriers.site"


def test_mail_a_flor_solo_a_flor(guard):
    assert guard.check_email(kind=guard.Kind.TO_FLOR, to=[FLOR], bcc=[], body="hola", subject="x").allowed
    with pytest.raises(guard.Blocked):
        guard.check_email(kind=guard.Kind.TO_FLOR, to=[FLOR, "alumna@x.com"], bcc=[], body="hola", subject="x")


def test_feedback_sin_aprobacion_no_sale(guard):
    with pytest.raises(guard.Blocked, match="aprobación"):
        guard.check_email(kind=guard.Kind.FEEDBACK_APPROVED, to=["alumna@x.com"], bcc=[FLOR],
                          body="Hola Vir", subject="Tu feedback", approved=False)


def test_feedback_aprobado_sale_con_flor_en_cco(guard):
    d = guard.check_email(kind=guard.Kind.FEEDBACK_APPROVED, to=["alumna@x.com"], bcc=[FLOR],
                          body="Hola Vir, cómo estás?", subject="Tu feedback", approved=True)
    assert d.allowed and not d.dry_run


def test_no_existe_envio_automatico(guard):
    assert not hasattr(guard.Kind, "FEEDBACK_GREEN")


def test_falta_cco(guard):
    with pytest.raises(guard.Blocked, match="CCO"):
        guard.check_email(kind=guard.Kind.FEEDBACK_APPROVED, to=["alumna@x.com"], bcc=[],
                          body="Hola", subject="x", approved=True)


@pytest.mark.parametrize("body", ["¡Hola Vir!", "¿Cómo estás?", "Como te dijo Maribel", "pasame tu contraseña"])
def test_textos_prohibidos(guard, body):
    with pytest.raises(guard.Blocked):
        guard.check_email(kind=guard.Kind.FEEDBACK_APPROVED, to=["alumna@x.com"], bcc=[FLOR],
                          body=body, subject="x", approved=True)


def test_modo_prueba_no_manda(monkeypatch):
    monkeypatch.setenv("BBAW_DRY_RUN", "1")
    from bbaw import config, guard as g
    importlib.reload(config)
    importlib.reload(g)
    d = g.check_email(kind=g.Kind.FEEDBACK_APPROVED, to=["alumna@x.com"], bcc=[FLOR],
                      body="Hola", subject="x", approved=True)
    assert d.dry_run


def test_calendario_sin_notificar_por_defecto(guard):
    assert guard.check_calendar_change(notify_attendees=False, is_student_event=True) == "NONE"
    with pytest.raises(guard.Blocked):
        guard.check_calendar_change(notify_attendees=True, is_student_event=False)


def test_mis_notas_protegida(monkeypatch):
    from bbaw import guard as g, notion_api
    with pytest.raises(g.Blocked):
        notion_api.replace_section("pagina", "📝 MIS NOTAS", "nada")


def test_aprobacion_por_mail():
    from bbaw.jobs import send_approved as sa
    row = {"properties": {"Entrega": {"type": "title", "title": [{"plain_text": "Virginia Federici · audio OKR · 31/10"}]}}}
    assert sa._approved_by_name(row, {"vir"})  # "ok Vir" aprueba a Virginia
    assert sa._approved_by_name(row, {"virginia"})
    assert sa._approved_by_name(row, {"todas"})
    assert not sa._approved_by_name(row, {"gaby"})


def test_texto_a_html():
    from bbaw.jobs.send_approved import text_to_html
    html = text_to_html("Hola Vir\n\n- uno\n- dos\n\nFlor")
    assert "<ul><li>uno</li><li>dos</li></ul>" in html and html.startswith("<p>Hola Vir</p>")


def test_rutinas_bien_configuradas():
    from bbaw import knowledge, runner, tools
    cfg = runner.load()
    for key, job in cfg["rutinas"].items():
        for t in job.get("herramientas", []):
            assert t in tools.ALL, f"{key}: herramienta desconocida {t}"
        for ref in job.get("instrucciones", []):
            if not ref.startswith("git:"):
                assert "[no se encontró" not in knowledge.read(ref), f"{key}: falta {ref}"
        if job["tipo"] == "agente":
            assert "email_student_weekly_link" not in job["herramientas"] or key == "lunes_semana"


def test_circuito_de_feedback_sin_internet(monkeypatch):
    """Simula una entrega por mail y verifica que termina en Notion como 'Para revisar', sin enviarse."""
    from bbaw.jobs import feedback as fb
    created = {}
    monkeypatch.setattr(fb, "class_context", lambda s: "PRÓXIMA CLASE: lun 2/11")
    monkeypatch.setattr(fb, "previous_feedback", lambda s: "Sin devoluciones anteriores.")
    answers = iter([
        fb.Draft(es_entrega=True, tarea="audio OKR", asunto="Tu audio", devolucion="Hola Vir, cómo estás? ¡Genial!",
                 notas_para_flor="ok"),
        fb.Review(problemas=[fb.Problem(tipo="estilo", detalle="sacar ¡")], devolucion_corregida="Hola Vir, cómo estás?"),
    ])
    monkeypatch.setattr(fb.llm, "ask_json", lambda *a, **k: next(answers))
    monkeypatch.setattr(fb.n, "create_row", lambda ds, props, sections: created.update(props=props, sections=sections) or {"url": "u"})
    s = fb.Student(page_id="p", name="Virginia", email="vir@x.com", formato="1:1", folder_id=None, ficha={})
    d = fb.Delivery(student=s, source="Mail", link="L", key="k", received="hoy",
                    blocks=[{"type": "text", "text": "my audio"}], thread_id="t1", subject="Tarea")
    r = fb.build(d, "criterio")
    assert r["semaforo"] == "🟢 Verde" and r["final"] == "Hola Vir, cómo estás?"
    fb.save(d, r)
    assert created["props"]["Estado"] == {"select": {"name": "Para revisar"}}
    assert created["sections"][0][1] == created["sections"][2][1]  # original guardado para comparar
