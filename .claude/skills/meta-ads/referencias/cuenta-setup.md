# Poner la cuenta en condiciones (una sola vez)

Orden exacto. Cada paso desbloquea el siguiente. Si algo ya está, saltealo.

## 1. Business Manager
`business.facebook.com` → Configuración del negocio.
Todo tiene que vivir acá, no en el perfil personal de Flor: si mañana se cae el perfil,
no se cae el negocio.

Adentro deben estar: la **página de Facebook**, la **cuenta de Instagram**
(`@ysi_speakenglish`), la **cuenta publicitaria** y el **dominio**.

## 2. Página de Facebook
Hace falta sí o sí: **todo anuncio se publica desde una página**, aunque solo salga en
Instagram. Si no existe, se crea en 5 minutos.
→ Anotá el **ID de la página** en `negocio.md`, se necesita para crear anuncios por API.

## 3. Cuenta publicitaria
Configuración del negocio → Cuentas publicitarias → Agregar.
- **Elegí bien la moneda y la zona horaria: no se pueden cambiar después.**
- Cargá el medio de pago.
- Anotá el **ID de la cuenta** (`act_XXXXXXXX`).

## 4. Verificación del dominio
Configuración del negocio → Seguridad de la marca → Dominios.
Sin esto, no podés elegir qué evento priorizar y las conversiones en iPhone se miden
peor. El dominio es el de la landing.

## 5. Píxel (conjunto de datos)
Administrador de eventos → Conectar orígenes de datos → Web.
Se pega el código en `BBatW_landing.html`, en el `<head>`.
Eventos mínimos: `PageView` en toda la landing y `Lead` cuando alguien se anota.

> Si hace falta, pedile al agente que edite `BBatW_landing.html` e inserte el píxel:
> es un cambio chico y lo puede hacer solo.

## 6. Conectar Meta Ads a Claude ⭐

Esto es lo que le da manos al agente: con esto conectado puede **crear campañas,
públicos y anuncios de verdad**, y leer las métricas.

**Windsor.ai** (crea y edita campañas — el importante):

Pedile al agente el link con:
`mcp__Windsor_ai__get_connector_authorization_url("facebook")`

Se abre, se acepta con la cuenta de Facebook que administra la publicidad, y listo.
Verificá después con `get_connectors`: tiene que aparecer `facebook`.

**Supermetrics** (reportes de performance, opcional):

Pedile al agente el link con:
`mcp__Supermetrics_Marketing_Analytics__data_source_discovery(ds_id="FA")`
→ devuelve el campo `login_link`.

> ⚠️ Estos links llevan un token de auto-login a la cuenta de Flor. **Nunca los pegues
> en un archivo del repo, en un chat compartido ni en un ticket.** Se generan en el
> momento, se usan y se descartan. Caducan solos.

Ya conectado: `instagram_public` → cuenta `ysi_speakenglish` (Instagram orgánico).

## 7. Público personalizado de la base actual
Si Flor tiene lista de emails de alumnas y de interesadas, subirla como público
personalizado. De ahí sale el **lookalike 1%**, que suele ser el mejor público que
vas a tener. Cuanto antes se suba, antes empieza a servir.

---

## Chequeo rápido de estado

| Pieza | Estado |
|---|---|
| Business Manager | `[ ]` |
| Página de Facebook + ID | `[ ]` |
| Cuenta publicitaria + moneda + pago | `[ ]` |
| Dominio verificado | `[ ]` |
| Píxel instalado + evento `Lead` | `[ ]` |
| Windsor conectado a Meta Ads | `[ ]` |
| Lista de emails subida | `[ ]` |
