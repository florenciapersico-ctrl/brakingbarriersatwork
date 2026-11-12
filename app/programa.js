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

  // Carpeta de Drive con todo listo para grabar (prompter, presentación, worksheet) de cada clase en grabación.
  // Flor puede cambiar o agregar el link desde "Mi progreso" (se guarda aparte y gana sobre esto).
  grabar: {
    '8.1': 'https://drive.google.com/drive/folders/1GYqbHLqc49jppLsXQnrkJhZKHTWDCL77',
    '8.2': 'https://drive.google.com/drive/folders/1kA8rZ1Bxp7Yoo71IjsxhgQoTh5qdd-W1',
    '12.2': 'https://drive.google.com/drive/folders/15LYmigofQcKaUos2Iy7lgyVwOvUv0y3-',
    '12.3': 'https://drive.google.com/drive/folders/1PbpMB2q1Zk11sIhsbtvmUCdj5Zq22jS_',
    '12.4': 'https://drive.google.com/drive/folders/1ptvkOrkOIng2sOK656xHRKzxR2xuCuig',
    '12.5': 'https://drive.google.com/drive/folders/1vk9RgIcrLSLB8DJwaHr_rN1mOTRDq4P-',
    '12.6': 'https://drive.google.com/drive/folders/1b9EU8QIH9Wmco9bMOREUj1844-LPk29X',
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
    ['Tengo una reunión pronto y me quiero preparar', 'Encontramos dónde te trabas y qué practicar.'],
    ['Me fue mal en una reunión', 'Lo miramos con el criterio de Flor y vemos cómo seguir.'],
    ['Ayúdame con mi weekly report', 'Lo ordenamos juntas antes del lunes.']
  ]
};
