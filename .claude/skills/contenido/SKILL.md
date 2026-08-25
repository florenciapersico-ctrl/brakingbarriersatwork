---
name: contenido
description: Genera el calendario mensual de contenido de Instagram para Breaking Barriers at Work con el criterio de los Manuales de Contenido (Concientización, Diferenciación, Transformación y Deseo). Usalo cuando se hable de armar el mes de contenido, elegir qué publicar, escribir un post o carrusel o reel, recargar el banco de ideas, o generar los diseños en Canva. Se activa con "el mes de contenido", "qué publico", "armá septiembre", "banco de ideas", "Content OS".
---

# Contenido — Breaking Barriers at Work

La app vive en `contenido/`. Es una PWA que se instala en el celular y arma el mes
sola a partir de `contenido/banco.json`. Este archivo explica el criterio que hay
detrás, para no romperlo cuando se toca algo.

## De dónde sale el criterio

De los tres Manuales de Contenido en el Drive de Flor:
`HIGH LEVEL › CONTENIDO › dividido`

| Manual | Qué hace | Subtipos |
|---|---|---|
| Concientización | Le pone nombre al problema que ella siente y no sabe explicar | Verdadero Problema · Mito/Creencia · Receta Fallida · Te lo digo con amor · Hoja de Ruta |
| Diferenciación | Por qué esto no es otro curso de inglés y por qué Flor | Opinión Picante · Perspectiva Única · Historia de Marca · Vulnerabilidad · Valores · Detrás de Escena |
| Transformación y Deseo | El resultado, con nombre y contexto real | Transformación Completa · Mini · Avance · Logro Cotidiano · Testimonio · Caso de Estudio · Antes vs Después · Interna |

Son **bancos de ideas ya escritas**, no plantillas. La regla de oro:

> **La idea nunca se inventa. Se elige del banco y se usa textual.**
> Lo único que se genera es el puente y la llamada a la acción.

Si hace falta una idea que no está en el banco, el lugar donde se agrega es
`banco.json` — y antes conviene chequear si ya existe dicha de otra forma.

## Cómo arma el mes la app

- **Ritmo:** 4 piezas por semana — lunes, martes, jueves, viernes.
- **Rotación:** lunes Concientización · martes Diferenciación · jueves
  Transformación · viernes Concientización. El último viernes del mes pasa a
  Transformación con la llamada a la cohorte.
- **Mezcla resultante:** ~41 % Concientización, ~29 % Diferenciación, ~30 % Transformación.
- **Determinista:** el mismo mes genera siempre el mismo plan (semilla `año*100+mes`).
  Sin esto el calendario cambiaría cada vez que abre la app.
- **Sin repetir:** una idea usada no vuelve nunca. Se marca como usada cuando Flor
  toca "Publicado".
- **Sin subtipos pegados:** no se repite un subtipo hasta que pasaron otras dos
  piezas del mismo tipo.
- **Formato por subtipo:** carrusel solo para los subtipos que tienen varias frases
  (Hoja de Ruta, Caso de Estudio, Transformación Completa, Antes vs Después). Reel
  para lo que se dice mejor de lo que se lee. Post para las frases que se sostienen solas.
  Un carrusel de menos de 4 láminas se degrada a post automáticamente.

## La fórmula del copy

```
Gancho    ← primera frase de la idea, textual
Cuerpo    ← el resto de la idea, textual
Puente    ← conecta con el método (pool por tipo, en index.html)
CTA       ← una sola, rotando; los lead magnets entran cada 3 piezas
```

Nunca dos llamadas a la acción en la misma pieza.

## Lo que no se promete (respetalo siempre)

- No se promete ausencia de errores.
- No se promete fluidez nativa en 5 meses.
- No se promete un ascenso, un aumento ni un puesto.

Y la voz **no** es: motivacional genérica, empoderamiento abstracto, urgencia falsa,
emojis en catarata, mayúsculas gritando.

## Canva — el estado real

**Lo que funciona hoy:** el botón "Diseñar en Canva" copia el brief (paleta,
tipografías, tono, texto lámina por lámina) y abre Canva en el tamaño correcto.
El diseño lo arma ella con el brief pegado al lado.

**Lo que NO funciona:** `generate-design` con el brand kit. Probado el 25/08/2026:
toma bien la paleta y el handle, pero **trunca el titular a la mitad**, **se inventa
copy** ("Vos tenés el poder de transformar tu comunicación" — justo lo que la marca
prohíbe) y mete fotos de stock. No es publicable. No usar para producción.

**El camino que sí resuelve esto:** Brand Templates con autollenado.
1. Flor arma en Canva una plantilla por formato (placa, portada de carrusel, lámina).
2. Le pone campos de texto con nombre: `titulo`, `pie`, `cta`.
3. La publica como Brand Template.
4. Ahí `search-brand-templates` con `dataset:"non_empty"` la devuelve, y
   `create-design-from-brand-template` mete el texto **exacto** en el diseño de ella.
   Sin invención, sin truncado.
5. Los links resultantes van a `contenido/canva.json` como `{"2026-09-01": "https://..."}`.
   La app los levanta sola y muestra "Abrir en Canva" en vez de "Diseñar en Canva".

Mientras tanto Flor puede pegar el link de cualquier diseño a mano desde la ficha
de la pieza ("Guardar link de Canva").

## Tareas frecuentes

**"Armame octubre"** → no hace falta hacer nada: la app lo genera sola al pasar de
mes con la flecha. Solo revisá que queden ideas en el banco (pestaña Banco).

**"Esta idea no me cierra"** → botón en la ficha. Guarda un override permanente en
el celular para esa fecha.

**"Recargá el banco"** → las fuentes son los tres manuales del Drive y la
`BITACORA PARA CREAR CONTENIDO` (transcripts de clase reales, buenísimos para
Logro Cotidiano y Testimonio). Agregar ideas a `banco.json` respetando el subtipo,
y subir la versión del cache en `contenido/sw.js` para que el celular las vea.

**Después de tocar `banco.json`** → siempre subir `CACHE` en `sw.js`
(`contentos-v1` → `contentos-v2`), si no el celular sigue mostrando el banco viejo.

## Relación con Meta Ads

Las piezas de Concientización que mejor funcionan orgánicamente son las candidatas
naturales para pautar — ya están validadas. La skill `meta-ads` tiene la ruta de
impulsar un post existente, que es la que funciona en esta cuenta. Los ganchos y
los 6 ángulos de `referencias/copy-playbook.md` son primos hermanos de estos
subtipos: Verdadero Problema ≈ ángulo Visibility Gap, Mito/Creencia ≈ "No es tu
inglés", Caso de Estudio ≈ Contra-mecanismo.
