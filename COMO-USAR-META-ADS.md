# Cómo usar Claude para Meta Ads

Guía corta para Flor. El agente ya está armado y sabe todo sobre Breaking Barriers at
Work: la oferta, el público, la voz, los testimonios, las políticas de Meta.

## Cómo lo llamás

Escribí **`/meta-ads`** y lo que necesitás. O simplemente hablá de anuncios, pauta,
campañas o Meta y se activa solo.

```
/meta-ads escribime 3 anuncios para arrancar
/meta-ads ¿cómo va la campaña esta semana?
/meta-ads me rechazaron un anuncio, te paso el motivo
/meta-ads no entiendo la diferencia entre campaña y conjunto de anuncios
```

## Los tres modos de usarlo

**1. Que haga.** "Creá la campaña de leads con USD 15 por día." Si Meta Ads está
conectado, la crea de verdad — **siempre en pausa**, y no activa nada sin tu permiso
explícito.

**2. Que piense con vos.** "Tengo USD 300 para este mes, ¿en qué los pongo?" Te da una
recomendación con el motivo, no una lista de veinte opciones.

**3. Que te enseñe.** "Explicame qué es el píxel y para qué sirve." Te lo explica en
criollo y te ofrece hacerlo él.

## Lo que más te va a servir

- **Copy listo para pegar.** Ya hay 6 anuncios escritos en
  `.claude/skills/meta-ads/campanas/campana-01-primeros-anuncios.md`.
- **Filtro de políticas.** La razón #1 por la que se caen los anuncios de coaching es
  hablarle al dolor en segunda persona ("¿te bloqueás en inglés?"). El agente reescribe
  eso automáticamente. Está explicado en `referencias/politicas-meta.md`.
- **Diagnóstico.** Cuando algo no anda, te dice dónde se rompe el embudo en vez de
  cambiar todo a la vez.

## La rutina que te recomiendo

| Cuándo | Cuánto | Qué le pedís |
|---|---|---|
| Diario | 2 min | "¿Está todo corriendo? ¿Hay algo rechazado?" |
| Cada 3–4 días | 10 min | "Mostrame cómo va y decime qué apagamos." |
| Semanal | 20 min | "Reporte de la semana y qué hacemos con el presupuesto." |
| Mensual | 30 min | "¿Qué ángulo ganó? ¿Qué probamos el mes que viene?" |

**Prohibido mirar la cuenta diez veces por día.** No mejora nada y te desgasta.
Y no toques nada los primeros 3–4 días: editar una campaña joven la reinicia
y quema presupuesto.

## Lo que falta para poder lanzar

1. **Conectar Meta Ads** (5 minutos) — el link está en
   `.claude/skills/meta-ads/referencias/cuenta-setup.md`. Con esto el agente pasa de
   aconsejar a hacer.
2. **Contestar 5 datos una sola vez**: precio, fecha de la próxima cohorte, paso de
   venta (llamada / aplicación / checkout), países a los que querés llegar, y
   presupuesto diario. Pedile al agente que te los pregunte y él completa los archivos.
3. **Grabar 2 videos verticales** de vos a cámara, 20–30 segundos. Es el formato que
   más rinde para alto ticket: la gente compra a la persona. Los guiones ya están
   escritos en la campaña 01.

## Dónde vive todo

```
.claude/skills/meta-ads/
├── SKILL.md                       ← el cerebro del agente
├── referencias/
│   ├── negocio.md                 ← oferta, público, voz, testimonios
│   ├── politicas-meta.md          ← por qué se caen los anuncios y cómo evitarlo
│   ├── copy-playbook.md           ← 6 ángulos, ganchos, fórmula
│   ├── estructura-campanas.md     ← objetivos, públicos, presupuesto
│   ├── metricas.md                ← qué mirar y qué decidir
│   ├── cuenta-setup.md            ← checklist de configuración + links de conexión
│   └── glosario.md                ← todos los términos de Meta en criollo
└── campanas/
    ├── campana-01-primeros-anuncios.md   ← 6 anuncios listos + calendario
    └── bitacora.md                       ← registro de decisiones
```

Todo esto es editable. Si algo no suena a vos, cambialo o pedile al agente que lo
cambie: cuanto más afinado esté `negocio.md`, mejor sale todo lo demás.
