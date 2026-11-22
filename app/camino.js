// Tu camino AT WORK (5 meses · 20 semanas), tus weekly reports y el onboarding.
// Sale de "Tu camino AT WORK · 5 meses", "Tu recorrido AT WORK" y el Weekly Report.
//
// Para editar:
//  - Cuando publiques una clase: borrá  pronto: true  de esa tarea.
//  - Para que el botón "Ver clase" abra la clase exacta: poné su link en  link: 'https://…'.
//    Si no tiene link, abre la plataforma (el link que cargás en Panel › Programa).
//  - Cada tarea tiene un id corto (ej. '1.2'): no lo cambies, así no se pierden las tildes.
(function () {
  const P = window.PROGRAMA;

  // Tipos: orientacion, evidencia, habito, comunidad, clase, practica, coach, material, envivo
  const T = (id, texto, tipo, donde, extra) => Object.assign({ id, texto, tipo, donde }, extra || {});

  P.recorrido = [
    { cuando: 'Tu punto de partida', etapa: 'Start Here', logro: 'Tu sistema de trabajo queda instalado y tienes tu Starting Point.' },
    { cuando: 'Módulo 1', etapa: 'Activate Your English', logro: 'Conviertes situaciones reales de tu trabajo en práctica con tus coaches.' },
    { cuando: 'Módulo 2', etapa: 'Communicate in Real Time', logro: 'El QUÉ: armas tu mensaje antes de hablar, aunque no lo tengas preparado.' },
    { cuando: 'Módulo 3', etapa: 'Polish Your English', logro: 'El CÓMO: detectas dónde se rompe tu inglés y lo corriges.' },
    { cuando: 'Módulo 4', etapa: 'Understand & Be Understood', logro: 'Entiendes más en reuniones y te entienden a la primera.' },
    { cuando: 'Módulo 5', etapa: 'Own Your Voice', logro: 'El QUIÉN: hablas aunque no sea perfecto.' }
  ];
  P.recorridoNota = 'Es un proceso: cada una avanza a su ritmo y puede llevarte más o menos tiempo. Lo importante no es terminar rápido, sino llevar cada módulo a tu trabajo. Si tu diagnóstico pide otro foco, Flor te lo indica en la respuesta a tu Weekly Report.';

  P.habitos = {
    titulo: 'Tu semana · todas las semanas, desde la semana 2',
    ciclo: 'Producir · Detectar · Corregir y refinar · Aplicar',
    tareas: [
      T('h1', 'Lunes: tu Weekly Report (es tu plan de la semana que empieza)', 'habito', 'Weekly report', { ir: '#weekly' }),
      T('h2', 'Hacer tu tarea de la semana (la de tu foco, arriba) y mandársela a Flor', 'material', 'Pedir feedback', { ir: '#feedback' }),
      T('h3', 'Practicarla con el coach que corresponde y hacer el segundo intento', 'practica', 'Mis coaches', { coaches: true }),
      T('h4', 'Aplicarlo en tu trabajo real', 'practica', 'Tu reunión real'),
      T('h5', 'Tu encuentro en vivo (clase o lab)', 'envivo', 'Tu calendario')
    ]
  };

  // Links de la academia (academy.breakingbarriers.site). Curso AT WORK + los dos onboardings.
  const AW = 'https://academy.breakingbarriers.site/courses/products/6863ca67-9163-40bd-98de-f0c450d87919/categories/';
  const M1 = (p) => AW + 'd4a20ab8-90e2-427a-814b-bd9c6c045091/posts/' + p;
  const M2 = (p) => AW + '686e786a-3975-437e-98a7-b60a7f115798/posts/' + p;
  const M3 = (p) => AW + '3aa37c22-88dd-460b-bbc6-bb5a22c0e9eb/posts/' + p;
  const ONB = {
    LAB: (p) => 'https://academy.breakingbarriers.site/courses/products/cfc2ef98-b6eb-4b49-a29c-1907b6682342/categories/0fd14824-786f-4dbe-b2d2-bb2c1824de22/posts/' + p,
    '1:1': (p) => 'https://academy.breakingbarriers.site/courses/products/600ef15e-1eaf-472a-82f9-f1f9c3138273/categories/1c10e04a-271d-428a-89c0-fe3b8cc1eac1/posts/' + p
  };
  P.onbLinks = {
    LAB: { curso: ONB.LAB('0e984e37-c6a0-401d-af56-1e9344c05200'), metodo: ONB.LAB('74dbb8dd-37e5-47e5-91c7-eb4c5d5a9b86') },
    '1:1': { curso: ONB['1:1']('e096e38e-8550-4c9b-a8b4-ce33e1be5e6c'), metodo: ONB['1:1']('cf00b0b4-6117-460e-8783-212393c40bf3') }
  };


  // Clarity Bank (pedido de Flor, 20/11): material de consulta para profundizar la gramática de cada clase.
  // Cada clase lleva  cb: [...]  con las lecciones del Clarity Bank que tratan el mismo tema.
  const CBG = (p) => 'https://academy.breakingbarriers.site/courses/products/7aa0f32b-5f93-48fa-b34e-41f0f3c58ef9/categories/0bf7abf7-cdcb-41ed-b3ee-8f80a7a5c1e4/posts/' + p; // Break the Grammar Barrier
  const CBT = (p) => 'https://academy.breakingbarriers.site/courses/products/7aa0f32b-5f93-48fa-b34e-41f0f3c58ef9/categories/daf19e03-1347-4333-8123-66cf09a6b8c4/posts/' + p; // Master Tenses
  const L = (t, u) => ({ t, u });
  const CB = {
    rs: L('Reported Speech', CBG('8cd2da4d-fcbc-4624-8450-f5151864fbba')),
    rsQ: L('Reported Speech: Questions', CBG('b9ee6a9f-341e-48f6-8652-72102eb9242d')),
    rsC: L('Reported Commands', CBG('d6269596-f359-4078-a9f5-f76d1e4d589d')),
    rsV: L('Reporting Verbs', CBG('c051fac0-3499-4f3c-8854-def7fcccfaeb')),
    cond: L('Conditionals', CBG('797ad75d-6977-4637-a1b0-0c1fc88afbda')),
    c0: L('2.1 Zero conditional', CBG('90573dec-a35d-4a10-8376-a5561fdbf721')),
    c1: L('2.2 First conditional', CBG('6da4afb8-b27e-4329-b9ca-f740c249d817')),
    c2: L('2.3 Second conditional', CBG('4e974442-08ee-46cd-b27b-bfd8111b5b91')),
    c3: L('2.4 Third conditional', CBG('8c89b6a1-329d-4bd5-8a46-66447a338b70')),
    cM: L('2.5 Mixed conditionals', CBG('be04b9c9-c4bf-4e40-b0e2-23c09fa142f2')),
    mod: L('Modal Verbs · introducción', CBG('ebb82853-e352-4b25-853b-612ecab62909')),
    m1: L('Can, could, be able to', CBG('9d6de9c6-684a-4c45-9d11-c2567f950d65')),
    m2: L('3.2 May, Might, Could', CBG('d02bec0f-a4fd-421b-9810-960a5d35098e')),
    m3: L('Should, ought to, had better, would rather', CBG('338cda25-570a-44d7-980d-32e202a3e79a')),
    m4: L('Must vs. have to', CBG('e345a27e-1a7e-41a4-b9a9-f9e8c55f0524')),
    m5: L('3.5 Modales perfectos', CBG('49a30bfe-189e-452d-aa6d-dc2f9bf717cc')),
    pas: L('Passive Voice', CBG('5ba38a80-c2a1-48da-bc7b-5394d9d93fef')),
    t1: L('Simple Present', CBT('7821316c-c38c-46c4-a8f0-9fdeb2808967')),
    t2: L('Present Continuous', CBT('5a9d51a9-68d0-4fb1-b3aa-3576e5faa1cf')),
    t3: L('Present Perfect', CBT('5f2f392b-4a90-43da-8fbf-501738de7b2b')),
    t4: L('Present Perfect Continuous', CBT('c3eaf553-be54-4b49-b573-400a5b28f718')),
    t5: L('Simple Past', CBT('f9a3bc22-b28a-460c-993b-16e11ab33141')),
    t6: L('Past Continuous', CBT('03b2d1f0-8a47-4032-a603-cd080bd46f88')),
    t7: L('Past Perfect', CBT('ddc3bd34-5152-45af-9016-666f62de9242')),
    t8: L('Future: will vs. going to', CBT('e913ea8d-cf2a-4e34-972a-ee034c3c8a76')),
    t9: L('Future Continuous', CBT('d9d8dc4e-a306-4d15-bcf8-b22a96c4ddcb')),
    t10: L('Future Perfect', CBT('ec2afcde-4c6e-4cce-a2e0-80fff487f22c')),
    t11: L('Future Perfect Continuous', CBT('4fb68751-d897-4b2e-b431-9d66a3e18225'))
  };
  const cb = (...k) => k.map((x) => CB[x]);
  const D = (k, d) => ({ ...CB[k], d }); // lección del Clarity Bank con su para qué

  P.camino = [
    { n: 1, titulo: 'Start Here, tu método y tus coaches', logro: 'Entiendes cómo funciona todo, hiciste tu primer ciclo completo y ya usas tus coaches.', semanas: [
      { s: [1], titulo: 'Tu punto de partida', tareas: [
        T('1.1', 'Ver el onboarding completo, con calma', 'orientacion', 'Start Here', { onb: 'curso' }),
        T('1.2', 'Firmar tu Acuerdo de Trabajo', 'orientacion', 'Drive · 01'),
        T('1.3', 'Grabar tu Starting Point', 'evidencia', 'Drive · 01'),
        T('1.4', 'Agendar tu primer encuentro conmigo', 'orientacion', 'Link de reserva', { reservar: true, privada: 'Avisarle a Flor que terminaste el onboarding (tu primera clase es en tu día y horario fijo)' }),
        T('1.5', 'Reservar 2 o 3 bloques de 30 minutos por semana', 'habito', 'Tu calendario'),
        T('1.6', 'Presentarte en la comunidad', 'comunidad', 'Comunidad', { comunidad: true })
      ] },
      { s: [2], titulo: 'Tu método', tareas: [
        T('2.1', 'Ver la clase «Tu método · The Delivery Method™»', 'clase', 'Start Here', { onb: 'metodo' }),
        T('2.2', 'Tu primer Producir: 1 o 2 minutos de una situación real', 'practica', 'Drive · 04', { ir: '#feedback' }),
        T('2.3', 'Completar tu primer Weekly Report después de tu primer 1:1 con Flor', 'habito', 'Weekly report', { ir: '#weekly' })
      ] },
      { s: [3], titulo: 'Activa tu inglés', tareas: [
        T('3.1', 'M1.1 · My Professional Context', 'clase', 'Módulo 1', { link: M1('c0502ce4-17fd-441f-b420-8315647966eb') }),
        T('3.2', 'M1.2 · Your AT WORK Practice System', 'clase', 'Módulo 1', { link: M1('ac970186-05f7-4e82-8e13-ef25ffcaa54f') }),
        T('3.3', 'M1.3 · Role Play Method + una práctica con tu caso', 'clase coach', 'Módulo 1 · Coaches', { sube: 'tarea', link: M1('76e86548-a7ac-478a-abf6-31b925d0b967'), coaches: true })
      ] },
      { s: [4], titulo: 'Tus coaches', tareas: [
        T('4.1', 'M1.4 · Narrative Flow + corregir un texto tuyo', 'clase coach', 'Módulo 1 · Coaches', { sube: 'tarea', link: M1('fdd0c13a-de41-491b-8235-b816ea5a587f'), coaches: true }),
        T('4.2', 'M1.5 · Color Method + subir el nivel de un mail', 'clase coach', 'Módulo 1 · Coaches', { sube: 'tarea', link: M1('f4c28b22-b2a7-4404-a5ed-b9e43f6e8b3b'), coaches: true }),
        T('cierre1', 'Cierre del Módulo 1: tus wins y lo que aprendiste', 'cierre', 'Comunidad', { comunidad: true, nota: 'Ya terminaste las clases del Módulo 1. Tómate 10 minutos y responde: ¿qué aprendiste?, ¿qué puedes hacer ahora que antes no podías?, ¿qué sientes que todavía necesita más práctica? Reconoce tus wins y compártelos en la comunidad y en tu Weekly Report.' })
      ] }
    ] },
    { n: 2, titulo: 'Ordena tu mensaje · el QUÉ', logro: 'Armas lo que quieres decir antes de hablar, aunque no lo tengas preparado.', semanas: [
      { s: [5], titulo: 'Decir las ideas simple', tareas: [
        T('5.1', 'M2 · Comunicarte cuando no tienes todo preparado', 'clase', 'Módulo 2', { link: M2('28977b19-1431-49a4-867c-0d5c35150345') }),
        T('5.2', 'M2 · Cómo organizar tus ideas de manera simple', 'clase', 'Módulo 2', { link: M2('21e6937e-113f-4225-9382-afc73c04ba87') }),
        T('5.3', 'M2 · Paraphrasing: qué hacer cuando no te sale una palabra', 'clase', 'Módulo 2', { link: M2('574ee9eb-8a99-4b6f-abad-31643b84382b') })
      ] },
      { s: [6], titulo: 'Tu mapa del mensaje', tareas: [
        T('6.1', 'M2 · The Message Map + úsalo en tu próximo update', 'clase practica', 'Módulo 2', { ws: 'https://docs.google.com/document/d/18gZ8LbHfuO8CJ_RCd2A32CA5ikQeamQM6qwRx-iUfb0/copy', link: M2('88302d24-8b19-4f36-b37b-2c2b97ecd28e') }),
        T('6.2', 'M2 · Manage the Interaction', 'clase', 'Módulo 2', { link: M2('7c133d1d-a777-4f96-9441-92b00c3db78e') }),
      ] },
      { s: [7], titulo: 'Tu situación de trabajo', tareas: [
        T('7.1', 'M2 · Talking About Numbers & Data', 'clase', 'Módulo 2', { link: M2('3b4e5f4e-1fde-4974-a59f-651260ae4a6d'), ws: 'https://docs.google.com/document/d/1S9b9mv_-zyozXJlcdZ2Xh463GCoWk2sJSrJ_32ZW1cQ/copy', wsExtra: true }),
        T('7.2', 'M2 · Presentaciones: parte 1', 'clase playbook', 'Módulo 2', { link: M2('ecdd7925-c11f-4276-9db3-e985ff8be613') }),
        T('7.3', 'M2 · Presentaciones: parte 2', 'clase playbook', 'Módulo 2', { link: M2('363344d6-a536-4ed7-97df-15565cbd16f3') })
      ] },
      { s: [8], titulo: 'Conectar y sostener la conversación', tareas: [
        T('8.2', 'M2 · Small Talk & Networking', 'clase playbook', 'Módulo 2', { link: M2('50ec7aca-66df-4039-ba90-c82a8a4185e5') }),
        // «Tus reuniones» (material del 19/11): reemplaza a «Presentarte» (inventario del 21/11).
        T('8.6', 'M2 · Tus reuniones · Parte 1', 'clase', 'Módulo 2', { sube: 'playbook', ws: 'https://docs.google.com/document/d/1D7l6lCgqSKAH3XLuVGqjqjTD6b84n3HXMRsCXSfINSY/copy', pronto: true }),
        T('8.7', 'M2 · Tus reuniones · Parte 2', 'clase', 'Módulo 2', { sube: 'playbook', ws: 'https://docs.google.com/document/d/1D7l6lCgqSKAH3XLuVGqjqjTD6b84n3HXMRsCXSfINSY/copy', pronto: true }),
        T('cierre2', 'Cierre del Módulo 2: tus wins y lo que aprendiste', 'cierre', 'Comunidad', { comunidad: true, nota: 'Ya terminaste las clases del Módulo 2. Tómate 10 minutos y responde: ¿qué aprendiste?, ¿qué puedes hacer ahora que antes no podías?, ¿qué sientes que todavía necesita más práctica? Reconoce tus wins y compártelos en la comunidad y en tu Weekly Report.' })
      ] }
    ] },
    { n: 3, titulo: 'Pule tu inglés · el CÓMO', logro: 'Detectas tú misma dónde se rompe tu inglés y lo corriges en el segundo intento.', semanas: [
      { s: [9], titulo: 'Tu sistema verbal', tareas: [
        T('9.1', 'M3 · Welcome to Polish Your English', 'clase', 'Módulo 3', { link: M3('4a72ce98-a576-41fc-9aa5-6d88bc5770b9') }),
        T('9.2', 'M3 · The Verb System · Parte 1: Cómo se construyen', 'clase worksheet', 'Módulo 3', { link: M3('a2555410-ddfe-4d41-a7fe-8a7124046bd4'), cb: cb('t1','t2','t3','t4','t5','t6','t7') }),
        T('9.5', 'M3 · The Verb System · Parte 2: Verbos irregulares', 'clase worksheet', 'Módulo 3', { link: M3('7b1a9231-6500-4722-9ef4-1de448ba745b'), cb: cb('t5') }),
        T('9.6', 'M3 · The Verb System · Parte 3: Cuándo uso cada uno', 'clase worksheet', 'Módulo 3', { link: M3('ea11f8ef-dbb7-40af-8c6a-2a10ffbc7d5e'), cb: cb('t3','t4','t5','t6','t7') }),
        T('9.3', 'M3 · The Verb System · Parte 4: Future tenses', 'clase worksheet', 'Módulo 3', { ws: 'https://docs.google.com/document/d/1gQYGlm4WF8a1okPnmerwafIquMWscG6epVaqrK5PqPg/copy', link: M3('57e5d9f7-65ce-4e2e-91f7-422defb9d68a'), cb: cb('t8','t9','t10','t11') }),
      ] },
      { s: [10], titulo: 'Los patrones de los verbos', tareas: [
        T('10.1', 'M3 · Verb Patterns: to or ing?', 'clase', 'Módulo 3', { ws: 'https://docs.google.com/document/d/1ZP1Rr79iFia9V7Y1wAPNWxC8lcPem-zN9C0VwVkYTkc/copy', link: M3('3cde7014-d479-45f6-be25-71a780ff177e') }),
        T('10.2', 'M3 · Stop translating the pattern!', 'clase', 'Módulo 3', { ws: 'https://docs.google.com/document/d/1nLLR53GqzMB0-KsAWoUgdB8QCmwGtw5DRM_NEZw-9aI/copy', link: M3('623a039a-73d3-4c9e-b97b-c71fbda69486') })
      ] },
      { s: [11], titulo: 'Precisión', tareas: [
        T('11.1', 'M3 · Nouns, Articles & Agreement', 'clase', 'Módulo 3', { ws: 'https://docs.google.com/document/d/1TrGrEx3bV0GZRVqZMezNVsfp6-6e4nYstNVZWR65G0w/copy', link: M3('99891d26-ef2b-469c-b27c-1a0a496c6edc') }),
        T('11.2', 'M3 · Relative Clauses: who, which, that', 'clase', 'Módulo 3', { ws: 'https://docs.google.com/document/d/1DcVbeZ6PLlRYQ-e8FptRTzG70bkG_LG6FgPBxPJelOQ/copy', link: M3('c4a14c4d-2aac-46aa-881d-314b173296bc') }),
        T('11.3', 'M3 · Modals: Say How Strong You Mean It', 'clase', 'Módulo 3', { link: M3('038f2779-dc42-4a35-bdce-3a2e94dcb655'), ws: 'https://docs.google.com/document/d/1MAWnadKruW95_8WlKmuf5kD3_u8_aTUuWT4UvOsLaRk/copy', cb: cb('mod','m1','m2','m3','m4','m5') })
      ] },
      { s: [12], titulo: 'Preguntar y reportar', tareas: [
        T('12.1', 'M3 · Questions & Indirect Questions', 'clase', 'Módulo 3', { link: M3('6eb79084-3227-4ab0-bfbb-03cb0d9cc256'), cb: cb('rsQ') }),
        T('12.2', 'M3 · Conditionals for Real Work Situations', 'clase', 'Módulo 3', { link: M3('e5e8c0cf-ba24-490e-a2e8-70f4aa642dc0'), ws: 'https://docs.google.com/document/d/1f_8BE47KEUNjGNMEbfBu5OVQ4RQ8XHFRrY1mnEH_sno/copy', entrega: 'Subir mi worksheet y mis 3 frases',cbIntro: 'Si te sientes perdida con algún condicional, mira la clase de cada uno:', cb: [D('cond', 'la introducción'), D('c0', 'procesos y reglas'), D('c1', 'planes, plazos y riesgos'), D('c2', 'escenarios y propuestas'), D('c3', 'lecciones aprendidas'), D('cM', 'lo que pasó y todavía se nota hoy')], cbMas: [D('m2', 'para el might de los riesgos'), D('m5', 'para el would have de las lecciones aprendidas')] }),
        T('12.3', 'M3 · Reported Speech & Reporting Information', 'clase', 'Módulo 3', { pronto: true, anticipo: true, ws: 'https://docs.google.com/document/d/113cL_En2vfJ3VGIiqYjv07Gpb-D1A_q67pOsKsCgK5E/copy', cb: cb('rs','rsQ','rsC','rsV') }),
        T('12.5', 'M3 · Passive Voice for Processes & Reporting', 'clase', 'Módulo 3', { pronto: true, anticipo: true, ws: 'https://docs.google.com/document/d/1r3h2FYyk6XES7uzAn7aEKNbb906VpJ1bI_hm5NRAUzM/copy', cb: cb('pas') }),
        T('12.6', 'M3 · Word Families & Nominalization', 'clase', 'Módulo 3', { ws: 'https://docs.google.com/document/d/1SJsK5I4OlpqXzuKgdTp5cHDWF3rKzivCpFGXXA0HAcw/copy', pronto: true }),
        T('12.4', 'M3 · The Accuracy Challenge: tu Error Radar', 'clase evidencia', 'Módulo 3', { ws: 'https://docs.google.com/document/d/1xNOfOW5rWNaNEAYP4KnsaICxxXnstpLvz3iiaGvaJLA/copy', pronto: true }),
        T('cierre3', 'Cierre del Módulo 3: tus wins y lo que aprendiste', 'cierre', 'Comunidad', { comunidad: true, nota: 'Ya terminaste las clases del Módulo 3. Tómate 10 minutos y responde: ¿qué aprendiste?, ¿qué puedes hacer ahora que antes no podías?, ¿qué sientes que todavía necesita más práctica? Reconoce tus wins y compártelos en la comunidad y en tu Weekly Report.' })
      ] }
    ] },
    { n: 4, titulo: 'Understand & Be Understood', logro: 'Entiendes más en reuniones y te entienden a la primera.', semanas: [
      { s: [13], titulo: 'Tu oído', tareas: [
        T('13.1', 'M4 · How English Really Sounds', 'clase', 'Módulo 4', { ws: 'https://docs.google.com/document/d/1B7A505LQ1lfcAzRtQDCOMb3qwQHoOfU0HNCfDMO1XaU/copy', pronto: true }),
        T('13.2', 'M4 · Train Your Ear in Meetings', 'clase', 'Módulo 4', { ws: 'https://docs.google.com/document/d/1UhGzY92DltHI687NShb2y1EJHl5sBxLp_hKPSrV4o94/copy', pronto: true })
      ] },
      { s: [14], titulo: 'Que te entiendan a la primera', tareas: [
        T('14.1', 'M4 · Pronunciation for Intelligibility · Parte 1', 'clase', 'Módulo 4', { ws: 'https://docs.google.com/document/d/1Q2vPfoPKRtG4NBlZ5HYdfYRVD1cHwnBG50bJj0GiBRw/copy', pronto: true }),
        T('14.2', 'M4 · Pronunciation for Intelligibility · Parte 2', 'clase', 'Módulo 4', { ws: 'https://docs.google.com/document/d/1Q2vPfoPKRtG4NBlZ5HYdfYRVD1cHwnBG50bJj0GiBRw/copy', pronto: true })
      ] },
      { s: [15, 16], titulo: 'Llevarlo a tus reuniones', tareas: [
        T('16.3', 'Escuchar una reunión real y anotar lo que no entendiste', 'practica', 'Tu trabajo'),
        T('16.4', 'Shadowing con frases de tu trabajo y la prueba del dictado', 'practica', 'Coaches', { coaches: true }),
        T('cierre4', 'Cierre del Módulo 4: tus wins y lo que aprendiste', 'cierre', 'Comunidad', { comunidad: true, nota: 'Ya terminaste las clases del Módulo 4. Tómate 10 minutos y responde: ¿qué aprendiste?, ¿qué puedes hacer ahora que antes no podías?, ¿qué sientes que todavía necesita más práctica? Reconoce tus wins y compártelos en la comunidad y en tu Weekly Report.' })
      ] }
    ] },
    { n: 5, titulo: 'Own Your Voice', logro: 'Hablas aunque no sea perfecto y tienes la evidencia de cuánto avanzaste.', semanas: [
      { s: [17], titulo: 'El QUIÉN', tareas: [
        T('15.1', 'M5 · ¿No me sale o no me animo?', 'clase playbook', 'Módulo 5', { ws: 'https://docs.google.com/document/d/1kARKEP-oREv9Edah2J8ikW7Ud0gxBnN8vf4GynlW3ek/copy', pronto: true }),
        T('15.2', 'M5 · Cuando me callo o me quedo en blanco', 'clase playbook', 'Módulo 5', { ws: 'https://docs.google.com/document/d/1gxpNWShjJv1zCpR6llaIcySPqqNWVET-nne4Qu-4Rw4/copy', pronto: true })
      ] },
      { s: [18], titulo: 'Hablar sin ser perfecta', tareas: [
        T('16.1', 'M5 · Hablar sin ser perfecta', 'clase playbook', 'Módulo 5', { ws: 'https://docs.google.com/document/d/19e0pua6nmU1yWBRgphsEydk1YT0TpDycNDldImet-GU/copy', pronto: true })
      ] },
      { s: [19, 20], titulo: 'Tu cierre: tu antes y después', tareas: [
        T('19.1', 'Grabar tu Starting Point de nuevo', 'evidencia', 'Drive · 01'),
        T('cierre5', 'Cierre del programa: tu antes y después', 'cierre', 'Comunidad', { comunidad: true, nota: 'Escucha tu primer Starting Point y el nuevo. ¿Qué cambió en cómo hablas y en cómo te sientes? ¿Qué puedes hacer hoy que hace cinco meses no podías? ¿Qué quieres seguir practicando? Reconoce tus wins y compártelos en la comunidad y en tu Weekly Report.' })
      ] }
    ] }
  ];

  // Clases que Flor puede asignar desde la ficha: salen del camino.
  P.modulos.forEach((m) => { m.clases = []; });
  const modDe = (d) => { const x = /Módulo (\d)/.exec(d); return x ? Math.min(+x[1], 5) : 0; };
  P.camino.forEach((mes) => mes.semanas.forEach((sem) => sem.tareas.forEach((t) => {
    if (/clase/.test(t.tipo) && !t.onb) P.modulos[modDe(t.donde)].clases.push(t.texto.replace(/ \+ .*/, ''));
  })));

  // Weekly report · PLANTILLA ÚNICA (1:1 y lab · desde 02-11). Solo cambia la pregunta 05.
  const comunes = [
    ['wins', '01 · My wins from last week', '¿Qué avances quiero reconocer y celebrar de la semana pasada?'],
    ['donde', '02 · Where I am in AT WORK', '¿En qué módulo y clase estoy actualmente? ¿Cómo me está resultando?'],
    ['foco', '03 · My focus this week', '¿Qué me comprometo a completar y entrenar esta semana?'],
    ['training1', '04 · My training schedule · Training 1', 'Reserva momentos concretos. Día / hora · Qué voy a entrenar · Material o situación real.'],
    ['training2', '04 · My training schedule · Training 2', 'Día / hora · Qué voy a entrenar · Material o situación real.']
  ];
  const necesito = ['necesito', '06 · What I need from Flor', '¿Hay algo que me esté frenando? ¿Necesito ayuda, feedback o claridad sobre algo?'];
  P.weeklyPorFormato = {
    '1:1': comunes.concat([
      ['situacion', '05 · Real situation I want to practice', '¿Qué situación real de mi trabajo quiero practicar esta semana? La trabajamos en mi sesión 1:1.'],
      necesito
    ]),
    LAB: comunes.concat([
      ['situacion', '05 · Real situation I want to practice', '¿Qué situación real de mi trabajo quiero practicar esta semana? Flor la usa para mi práctica, para los ejemplos del lab y para mi 1:1 del mes.'],
      necesito
    ])
  };
  P.weeklyIntro = 'Usa este momento para reconocer tus avances, definir tu foco y reservar cuándo vas a entrenar esta semana. Es tu plan de la semana que empieza, no un resumen.';
  P.weeklyLema = 'Define your focus · Book the time · Do the work';
  P.weekly = P.weeklyPorFormato.LAB; // por defecto

  // Onboarding · sale de las dos "Guía del Onboarding" (AT WORK Lab y AT WORK Private), versión del 04-11.
  const ROADMAP = 'https://drive.google.com/file/d/1vOdPY3VRO-7qfu-oiHEEYNfKVNdyEher/view';
  const COMUNIDAD = 'https://chat.whatsapp.com/EKffC7cix6oDfeCCvfKGYv';
  const WHATSAPP = 'https://wa.me/5491144101209';
  const faqComun = [
    ['¿Cómo sé qué tengo que hacer cada semana?', 'Sigues tu camino, con las tareas de cada semana, en orden. Y Flor lo ajusta a ti: si tu trabajo pide otro foco, te lo indica en la respuesta a tu Weekly Report. Nunca vas a tener que adivinar qué te toca. Y si tienes dudas, pregúntale a Flor AI: ella sabe dónde estás y te dice qué te toca esta semana.', '¿Qué me toca hacer esta semana?'],
    ['¿Es una clase grabada por semana?', 'No exactamente. Cada semana tiene sus tareas: a veces una clase, a veces dos, a veces una práctica. Lo importante no es cuántas clases ves, sino usar lo que aprendes en tu trabajo.'],
    ['¿Cuándo completo el Weekly Report?', 'Los lunes, en la sección Weekly report de esta app. El primero lo completas después de tu primer 1:1 con Flor.'],
    ['¿El Weekly Report es de lo que hice o de lo que voy a hacer?', 'De lo que vas a hacer: es tu plan para la semana que empieza. Arriba cuentas un win de la semana pasada; después, qué vas a practicar y qué días; y al final, lo que necesitas de Flor.'],
    ['¿Y si una semana no sé qué poner?', 'Manda la grabación de una reunión o de una práctica desde “Pedir feedback”. Con eso ya están. También puedes pedirle a Flor AI que te ayude a armarlo.', 'Ayúdame a armar mi Weekly Report de esta semana'],
    ['¿Tengo que grabar todas mis reuniones?', 'No. Con una reunión o una situación real por semana alcanza. Si es confidencial, cambia nombres y cifras, o grábate contando lo mismo con otros datos.'],
    ['No me llegó el mail de bienvenida o no puedo entrar a mi carpeta', 'Escríbele a Flor enseguida por WhatsApp y lo resuelven. Revisa también Spam y Promociones.'],
    ['¿Tengo que ver los módulos en orden?', 'Sigues el orden de tu camino. Si tu trabajo pide algo antes (por ejemplo, una presentación importante el mes que viene), Flor te dice qué clase adelantar. Si no sabes cuál sigue, pregúntale a Flor AI.', '¿Qué clase me toca ver ahora?'],
    ['¿Hay recesos?', 'Sí, dos fijos para todas: del 21 de diciembre al 6 de enero y del 20 al 31 de julio. Los feriados de Argentina se recuerdan en la comunidad.'],
    ['¿Cuándo uso los coaches de IA?', 'Desde el Módulo 1: ahí Flor te enseña a instalarlos, usarlos y sacarles provecho. Hasta entonces no tienes que hacer nada con ellos.'],
    ['¿Por qué las clases teóricas están en español?', 'Porque en ellas no te enseña inglés, te enseña cómo entrenarlo. En español te explica cómo entrenar. En inglés, entrenan.'],
    ['Me siento perdida o abrumada', 'Es normal: entender cómo funciona todo lleva unas dos semanas. Ve paso a paso. Y si algo no te cierra, escríbele a Flor: prefiere mil veces que preguntes a que te quedes trabada. Mientras tanto, Flor AI te ayuda a ver cuál es tu próximo paso.', 'Me siento un poco perdida, ¿por dónde sigo?']
  ];
  P.onboardingPorFormato = {
    LAB: {
      nombre: 'AT WORK Lab',
      nota: 'Si estás en un lab, así se leen los videos: cuando escuches «tu clase», para ti es tu lab semanal; cuando escuches «tu primera clase uno a uno», es tu 1:1 de arranque. Y además tienes un 1:1 con Flor por mes.',
      links: [
        ['Tu onboarding', 'Onboarding Lab · Start Here (8 videos cortos)', 'curso'],
        ['Tu camino', 'Tu camino, módulo a módulo', ROADMAP],
        ['Tu 1:1 de arranque', 'Agendar', 'https://calendar.app.google/kxnVBHB5XJam7JG69'],
        ['Tu lab', 'Sábados, 15:30 a 16:30 de Argentina (12:30 México y Costa Rica, 13:30 Colombia)', 'https://meet.google.com/gow-vnpg-xhx'],
        ['Tu 1:1 del mes (30 min)', 'Con el mismo link de agenda', 'https://calendar.app.google/kxnVBHB5XJam7JG69'],
        ['Comunidad', 'Unirme al grupo', COMUNIDAD],
        ['WhatsApp de Flor', 'Temas administrativos o privados', WHATSAPP]
      ],
      semana: [
        ['Lunes', 'Tu Weekly Report: tu plan de la semana que empieza.'],
        ['Durante la semana', '2 o 3 bloques de 30 minutos para ver la clase que te toca y practicar con tu caso real.'],
        ['Una vez por semana', 'Tu lab en vivo, siempre en el mismo horario y con el mismo grupo.'],
        ['Una vez por mes', 'Tu 1:1 de 30 minutos con Flor.'],
        ['Material real', 'Con una reunión o situación por semana alcanza.']
      ],
      arranque: ['Tu 1:1 de arranque', 'En ese encuentro no recorren la plataforma: definen tu objetivo para los cinco meses, hacen tu primera práctica real y dejan claro tu primer foco. Después de ese encuentro completas tu primer Weekly Report. Trae tu Starting Point hecho, tus dudas anotadas y una situación concreta de tu trabajo en inglés que te pone nerviosa (en vez de «quiero hablar fluido», algo como «me trabo cuando presento los resultados del mes»).'],
      checklist: [
        'Vi todos los videos del onboarding, en orden',
        'Descargué mi camino y lo tengo a mano',
        'Me uní a la comunidad y me presenté: nombre, de dónde soy, a qué me dedico y una situación de mi trabajo en inglés que quiero mejorar',
        'Firmé mi Acuerdo de Trabajo y lo guardé en mi carpeta personal',
        'Hice mi Starting Point (hoja + grabación espontánea, sin guion) y lo guardé en mi carpeta, con el nombre Starting Point - Audio inicial - Nombre y apellido',
        'Guardé algo real de mi trabajo en mi carpeta personal (ideal: una reunión grabada)',
        'Reservé 2 o 3 bloques de 30 minutos por semana en mi calendario',
        'Guardé mi lab en el calendario',
        'Agendé mi 1:1 de arranque y anoté mi situación de trabajo y mis dudas'
      ],
      faq: faqComun.concat([
        ['¿Qué pasa si no puedo ir a un lab?', 'Recibes la grabación, haces la práctica con tu propio caso y lo cuentas en tu Weekly Report. El lab no se recupera en otro horario ni en otro grupo.'],
        ['¿Cómo funciona mi 1:1 del mes?', 'Son 30 minutos por mes, solo con Flor, que agendas con el link. Si avisas con 24 horas, lo reprogramas dentro del mismo mes. Si no lo agendas en el mes, no se acumula. El de diciembre se agenda antes del 19.'],
        ['¿Puedo compartir cosas de mi trabajo en el lab?', 'Sí, pero cambia antes nombres, cifras y datos internos: en el lab hay otras profesionales. Lo que se comparte en el grupo queda en el grupo.'],
        ['¿Y si me voy de vacaciones o tengo una semana muy cargada?', 'Avísale a Flor antes. El programa sigue: recibes las grabaciones de los labs y avanzas a tu ritmo. Si te atrasas, retoman desde donde estás. Tus vacaciones no extienden los cinco meses.']
      ])
    },
    '1:1': {
      nombre: 'AT WORK Private',
      nota: '',
      links: [
        ['Tu onboarding', 'Onboarding Private · Start Here (8 videos cortos)', 'curso'],
        ['Tu camino', 'Tu camino, módulo a módulo', ROADMAP],
        ['Tu primera clase', 'En tu día y horario fijo (los que definiste con Flor)', ''],
        ['Comunidad', 'Unirme al grupo', COMUNIDAD],
        ['WhatsApp de Flor', 'Temas administrativos o privados', WHATSAPP]
      ],
      semana: [
        ['Lunes', 'Tu Weekly Report: tu plan de la semana que empieza.'],
        ['Durante la semana', '2 o 3 bloques de 30 minutos para ver la clase que te toca y practicar con tu caso real.'],
        ['Una vez por semana', 'Tu clase 1:1 con Flor, en tu horario fijo.'],
        ['Material real', 'Con una reunión o situación por semana alcanza.']
      ],
      arranque: ['Tu primera clase', 'Cuando termines el onboarding, avísale a Flor por WhatsApp y se ven en tu primera clase, en el día y horario que ya definieron juntas. No tienes que agendar nada. En esa clase no recorren la plataforma: definen tu objetivo para los cinco meses, hacen tu primera práctica real y dejan claro tu primer foco. Después de ese encuentro completas tu primer Weekly Report. Trae tu Starting Point hecho, tus dudas anotadas y una situación concreta de tu trabajo en inglés que te pone nerviosa (en vez de «quiero hablar fluido», algo como «me trabo cuando presento los resultados del mes»).'],
      checklist: [
        'Vi todos los videos del onboarding, en orden',
        'Descargué mi camino y lo tengo a mano',
        'Me uní a la comunidad y me presenté: nombre, de dónde soy, a qué me dedico y una situación de mi trabajo en inglés que quiero mejorar',
        'Firmé mi Acuerdo de Trabajo y lo guardé en mi carpeta personal',
        'Hice mi Starting Point (hoja + grabación espontánea, sin guion) y lo guardé en mi carpeta, con el nombre Starting Point - Audio inicial - Nombre y apellido',
        'Guardé algo real de mi trabajo en mi carpeta personal (ideal: una reunión grabada)',
        'Reservé 2 o 3 bloques de 30 minutos por semana en mi calendario',
        'Le avisé a Flor que terminé el onboarding, tengo agendado mi día y horario de clase y anoté mi situación de trabajo y mis dudas'
      ],
      faq: faqComun.concat([
        ['¿Qué pasa si tengo que faltar a una clase?', 'Avísale a Flor con al menos 24 horas y la recuperan dentro del mismo mes. Con menos de 24 horas, la clase se considera tomada.'],
        ['¿Y si me voy de vacaciones o tengo una semana muy cargada?', 'Avísale a Flor antes. El programa sigue: puedes avanzar con las clases grabadas y tu Weekly Report. Si te atrasas, retoman desde donde estás. Tus vacaciones no extienden los cinco meses.']
      ])
    }
  };
  // Tu carpeta de Drive (la crea la automatización con estas subcarpetas)
  P.carpetas = [
    ['01', 'Mi contexto profesional', 'Tu Acuerdo de Trabajo y tu Starting Point'],
    ['02', 'Material real de mi trabajo', 'Reuniones, mails, presentaciones'],
    ['03', 'Materiales de sesiones', 'Actividades de tus labs y de tu 1:1'],
    ['04', 'Mis prácticas', 'Tus prácticas y segundos intentos'],
    ['05', 'Mi progreso', 'Tus Weekly Reports']
  ];
  P.onboarding = P.onboardingPorFormato.LAB.checklist; // compatibilidad

  // "Checklist antes de continuar"
  P.compromisos = [
    ['No voy a medir mi progreso solo por cómo me siento con mi inglés.', 'Voy a mirar también qué hago diferente, qué puedo sostener mejor y qué situaciones empiezo a manejar de otra manera.'],
    ['Voy a hacer visible mi proceso.', 'Si algo me preocupa, necesito feedback, tengo una duda o quiero contarte qué pasó después de una situación que trabajamos, te lo voy a comunicar.'],
    ['Voy a reconocer mis wins, aunque sean pequeños.', 'No voy a esperar un gran resultado para recién ahí considerar que estoy avanzando.'],
    ['Voy a compartir mis wins durante el proceso.', 'No para "mostrar resultados", sino para registrar la evidencia antes de que mi cabeza la normalice y vuelva a mirar solamente lo que falta.'],
    ['Te voy a contar también qué me está ayudando.', 'Qué herramienta me sirvió, qué cambió, qué pude hacer distinto y qué necesitamos ajustar.'],
    ['Si tengo una semana mala, voy a retomar en lugar de desaparecer del proceso.', 'Sostener el proceso también cuenta como progreso.']
  ];

  P.tiposDoc = [['acuerdo', 'Acuerdo de Trabajo firmado · 01'], ['starting', 'Starting Point · 01'], ['material', 'Material real de mi trabajo · 02'], ['practica', 'Práctica o segundo intento · 04'], ['plan', 'Plan o rutina · 05'], ['otro', 'Otro documento']];
})();
