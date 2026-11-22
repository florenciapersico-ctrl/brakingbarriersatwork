// Contenido fijo del programa AT WORK. Editalo acá cuando grabes clases nuevas:
// cada clase es un texto en la lista "clases" de su módulo. Lo que asignás a cada alumna
// (foco, tareas, clases) se carga desde el panel "Alumnas", no acá.
window.PROGRAMA = {
  modulos: [
    { n: 0, nombre: 'Start Here · Onboarding', desc: 'Tu punto de partida, cómo funciona tu semana y dónde está cada cosa. Hay un onboarding para Lab y otro para Private.',
      logro: 'Sé desde dónde parto, cómo es el recorrido y qué me toca hacer a mí.', clases: [] },
    { n: 1, nombre: 'Activate Your English', desc: 'Convertir tus situaciones reales de trabajo en práctica con Role Play, Narrative Flow y Color Method.',
      logro: 'Uso mis situaciones reales para entrenar y tengo las herramientas para hacerlo sola.', clases: [] },
    { n: 2, nombre: 'Communicate in Real Time', desc: 'Construir, ordenar, adaptar y sostener tu mensaje cuando la conversación se sale del guion. El QUÉ.',
      logro: 'Armo lo que quiero decir antes de hablar, aunque no lo tenga preparado.', clases: [] },
    { n: 3, nombre: 'Polish Your English', desc: 'Los patrones que de verdad interfieren con tu precisión. El CÓMO. Se prescribe según tu diagnóstico.',
      logro: 'Detecto yo misma dónde se rompe mi inglés y lo corrijo en el segundo intento.', clases: [] },
    { n: 4, nombre: 'Understand & Be Understood', desc: 'Entender el inglés hablado real y que se te entienda a la primera. Tu acento nunca fue el problema.',
      logro: 'Entiendo más en reuniones y me entienden a la primera.', clases: [] },
    { n: 5, nombre: 'Own Your Voice', desc: 'El QUIÉN: cuando no te animas, te quedas en blanco o esperas hablar perfecto.',
      logro: 'Hablo aunque no sea perfecto y llevo a mi trabajo lo que antes evitaba.', clases: [] }
  ],

  coaches: [
    { id: 'flor', nombre: 'Flor AI', color: 'var(--brand)',
      desc: 'Empieza aquí. Te dice dónde estás en tu proceso y qué te toca, te da feedback sobre una situación real de tu trabajo y te manda al coach justo.',
      frase: '¿Qué me toca esta semana?' },
    { id: 'roleplay', nombre: 'Role Play', color: 'var(--accent)',
      desc: 'Ensaya la reunión, presentación o llamada antes de que pase. Hace de la otra persona y no te corrige durante la escena.',
      frase: 'Mañana tengo una reunión con mi jefe, quiero practicarla' },
    { id: 'narrative', nombre: 'Narrative Flow', color: 'var(--olive)',
      desc: 'Te muestra tus errores de gramática en textos reales y te guía para que los corrijas tú, uno por uno.',
      frase: 'Revisa este mail que escribí: ' },
    { id: 'color', nombre: 'Color Method', color: 'var(--warn)',
      desc: 'Sube el nivel de tu vocabulario: verbos de impacto, expresiones de negocios y vocabulario de tu industria.',
      frase: 'Quiero que esto suene más profesional: ' }
  ],

  // Mientras Flor AI no esté activada en la app, los coaches abren estos links de Claude.
  enClaude: {
    practica: 'https://claude.ai/artifact/6mfNAGdhVfDv8ByMbFnhph',
    coaches: 'https://claude.ai/artifact/6dZ11vhhbVdbcbcaQyRzS8'
  },

  situaciones: [
    ['Tengo una reunión o presentación pronto', 'roleplay'],
    ['Escribí algo y no sé si está bien', 'narrative'],
    ['Está correcto pero suena básico', 'color'],
    ['Me piden que repita o me cuesta entender a nativos (llévalo también a Flor)', 'flor'],
    ['Algo me salió mal en el trabajo y no sé cómo seguir', 'flor'],
    ['No sé por dónde empezar', 'flor']
  ],

  weekly: [
    ['win', 'Tu win de la semana pasada', 'Algo que salió mejor que antes, aunque sea pequeño.'],
    ['modulo', '¿En qué parte del programa estás?', 'Ejemplo: Módulo 2, clase de organizar ideas.'],
    ['situacion', '¿Qué situación de tu trabajo quieres entrenar esta semana?', 'Una reunión, un mail, una presentación. Cuanto más real, mejor.'],
    ['ayuda', '¿Hay algo que te esté frenando o que necesites de Flor?', 'Si no tienes nada, cuéntale qué practicaste y qué le mandaste.'],
    ['dias', '¿Cuándo vas a practicar esta semana?', 'Ejemplo: lunes y miércoles 20 min, sábado el lab.']
  ],

  onboarding: [
    'Ver el módulo de onboarding completo',
    'Entrar a la plataforma y poner tu foto',
    'Unirte a la comunidad de WhatsApp',
    'Agendar el lab de los sábados en tu calendario',
    'Reservar tu primer 1:1 del mes',
    'Grabar tu audio de punto de partida (3–5 min)',
    'Mandarle a Flor material real de tu trabajo',
    'Completar tu primer weekly report'
  ],

  // Carpeta de Drive con todo listo para grabar de cada clase en grabación: prompter, presentación en Google Slides («PRESENTACIÓN · … · para grabar») y worksheet.
  // M3 (12.x): las carpetas reales están en «Módulo 3» (NO las de «🗑️ BORRAR»). Revisado 17/11.
  // Flor puede cambiar o agregar el link desde "Mi progreso" (se guarda aparte y gana sobre esto).
  grabar: {
    '8.6': 'https://drive.google.com/drive/folders/1GYqbHLqc49jppLsXQnrkJhZKHTWDCL77',
    '8.7': 'https://drive.google.com/drive/folders/1GYqbHLqc49jppLsXQnrkJhZKHTWDCL77',
    '14.2': 'https://drive.google.com/drive/folders/11if3ZWqzcgsMloOWOCa9FhUL4rhRYyow',
    '14.3': 'https://drive.google.com/drive/folders/1mR5R5mrY52PObhIlY7RVeIEI0GeF-743',
    '12.2': 'https://drive.google.com/drive/folders/1WLWELXatIAQwJIgF6FDQQ2jBgLU2NDdG',
    '12.3': 'https://drive.google.com/drive/folders/1pWUwLvRO6FJD0jWWVpB0M6Yab8LVuxh0',
    '12.4': 'https://drive.google.com/drive/folders/15FAOR8Hdk_P5CoWu9nfNf3l-_IfR9hNm',
    '12.5': 'https://drive.google.com/drive/folders/1qNeXyDZZqVLC3K3wqNMpfJ9GRPLfbm3k',
    '12.6': 'https://drive.google.com/drive/folders/1QLOCMhFq5qyneYtRFOMcOqNnwjryvJHc',
    '12.7': 'https://drive.google.com/drive/folders/1oxCTJC-W_4FGcgdjNaN-4N713qWSWVw4',
    '12.8': 'https://drive.google.com/drive/folders/1oxCTJC-W_4FGcgdjNaN-4N713qWSWVw4',
    '13.1': 'https://drive.google.com/drive/folders/1KkixW6PyUMHbLyWJWWlxSrVJxZ01OMTn',
    '13.2': 'https://drive.google.com/drive/folders/1VidSlgWCWfnz74_U0u1dJ_tTozGSttCm',
    '14.1': 'https://drive.google.com/drive/folders/11if3ZWqzcgsMloOWOCa9FhUL4rhRYyow',
    '15.1': 'https://drive.google.com/drive/folders/1YEo6mlLvlLRK_6-__xLvsDwWeyRLpeN3',
    '15.2': 'https://drive.google.com/drive/folders/17R11aoV5v9hoDOeeztP-xDT-5MwfJ-UP',
    '16.1': 'https://drive.google.com/drive/folders/1f-cjpbjjp6SgnHJ8S1QfBIAZZ4Khmqlb'
  },

  sugerencias: [
    ['Soy nueva, quiero hacer mi onboarding', 'Tu bienvenida: dónde está todo y tu primera práctica.'],
    ['¿Qué me toca esta semana?', 'Dónde estás en tu proceso y tu próximo paso.'],
    ['Delivery Method: ¿dónde estoy trabada?', 'Con el método de Flor vemos qué te frena y qué practicar.'],
    ['Revisa mi tarea y dame un primer feedback: ', 'Pega tu tarea o tu playbook y recibe un primer feedback.'],
    ['Me fue mal en una reunión', 'Lo miramos con el criterio de Flor y vemos cómo seguir.'],
    ['Ayúdame con mi weekly report', 'Lo ordenamos juntas antes del lunes.']
  ]
};
// Bancos de consulta por grabar (plan final de Flor, 22/11). Solo los ve Flor en su panel,
// en bloques aparte de AT WORK. «n» es el número de la subcarpeta en «PARA GRABAR · Plan final».
window.PROGRAMA.paraGrabar = 'https://drive.google.com/drive/folders/1oxCTJC-W_4FGcgdjNaN-4N713qWSWVw4';
// Auditoría con Flor (22/11): de los bancos, ahora solo se graba lo que responde a los errores reales de sus alumnas.
// Todo lo demás (Clarity Bank, Phonetastic y las 2 de vocabulario del M3) queda en «Después» en su panel.
window.PROGRAMA.grabarAhora = ['cb.14'];
window.PROGRAMA.bancos = [
  { banco: 'cb', titulo: 'Clarity Bank · banco de gramática', orden: 2,
    sinGrabar: 'Solo subir a la plataforma: 40 Mini tests por tema · 41 Worksheets que faltaban (Reported Questions, Reported Commands, Passive Voice, Present Perfect Continuous, Future Perfect) · 42 Tabla de tiempos verbales.',
    clases: [
      ['cb.08', '08', 'Passive Voice · Two objects', 'They sent me the report → I was sent the report / The report was sent to me'],
      ['cb.09', '09', 'Passive Voice · Impersonal Passive', 'It is said that… · Sales are expected to grow'],
      ['cb.10', '10', 'Passive Voice · The Causative', 'have / get something done'],
      ['cb.11', '11', 'Relative Clauses · Defining', 'who, which, that; cuándo omitir that'],
      ['cb.12', '12', 'Relative Clauses · Non-defining', 'la información extra entre comas; sin that'],
      ['cb.13', '13', 'Relative Clauses · Whose, where, when, why + preposiciones', 'the client whose… · the team with whom I work'],
      ['cb.14', '14', 'Los errores chiquitos que delatan el español', 'sujeto que falta, since/for, say/tell, used to / be used to, falsos amigos'],
      ['cb.15', '15', 'Conectores', 'however, although, whereas, therefore, despite'],
      ['cb.39', '39', 'Inversiones para sonar ejecutiva', '']
    ] },
  { banco: 'ph', titulo: 'Phonetastic · banco de pronunciación', orden: 3,
    sinGrabar: 'Sin grabar: 34 Minimal pairs (PDF con sonido) · 38 Tus recursos favoritos (PDF). El Módulo 5 «Sonar natural» reusa las clases 13.1, 13.2, 14.1 y 14.2 de AT WORK: no se graban dos veces.',
    clases: [
      ['ph.16', '16', '0.00 · Bienvenida a Phonetastic', 'reemplaza la vieja'],
      ['ph.17', '17', '1.09 · La e larga /ɜː/', 'work, word, first'],
      ['ph.18', '18', '1.10 · La schwa /ə/', ''],
      ['ph.22', '22', '1.11 · La U larga y la U corta', ''],
      ['ph.23', '23', '1.12 · La O corta /ɒ/', ''],
      ['ph.24', '24', '1.13 · Los diptongos', ''],
      ['ph.25', '25', '2.04 · ¿Sonora o sorda?', ''],
      ['ph.26', '26', '2.05 · La TH', ''],
      ['ph.27', '27', '2.06 · B y V', ''],
      ['ph.28', '28', '2.07 · SH y CH, J y Y', ''],
      ['ph.29', '29', '2.08 · Practica conmigo · consonantes', ''],
      ['ph.19', '19', '3.11 · La -S y la -ES', '3 sonidos'],
      ['ph.30', '30', '4.01 · Letras mudas · B, C, D y GH', ''],
      ['ph.31', '31', '4.02 · Letras mudas · H, K, L y N', ''],
      ['ph.32', '32', '4.03 · Letras mudas · P, T, U y W', ''],
      ['ph.33', '33', '5.01 · Acento en las palabras y ¿verbo o sustantivo?', ''],
      ['ph.35', '35', '6.01 · Shadowing con series y entrevistas', ''],
      ['ph.36', '36', '6.02 · Pronunciación con canciones', ''],
      ['ph.37', '37', '6.03 · Cómo ver series en inglés', '']
    ] }
];
