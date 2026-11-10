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
    { cuando: 'Semana 1', etapa: 'Onboarding', logro: 'Tu sistema de trabajo queda instalado y tienes tu Starting Point.' },
    { cuando: 'Semanas 2–4', etapa: 'Activate Your English', logro: 'Conviertes situaciones reales de tu trabajo en práctica y activas el inglés que ya tienes.' },
    { cuando: 'Semanas 5–10', etapa: 'Communicate in Real Time', logro: 'Organizas y sostienes mensajes claros en tiempo real, sin depender de un guion.' },
    { cuando: 'Semanas 11–16', etapa: 'Polish Your English', logro: 'Estabilizas los patrones que limitan tu claridad y precisión.' },
    { cuando: 'Semanas 17–19', etapa: 'Understand & Be Understood', logro: 'Entiendes mejor el inglés hablado y te haces entender con más facilidad.' },
    { cuando: 'Semana 20', etapa: 'Review final / integración', logro: 'Integras todo, comparas con tu Starting Point y defines tu siguiente nivel.' }
  ];
  P.recorridoNota = 'Tracks transversales: práctica con situaciones reales, pronunciación y listening, y precisión aparecen durante todo el recorrido cuando tu comunicación real lo necesita. Cada etapa marca el foco principal, no un límite.';

  P.habitos = {
    titulo: 'Tu semana · todas las semanas, desde la semana 2',
    ciclo: 'Producir · Detectar · Corregir y refinar · Aplicar',
    tareas: [
      T('h1', 'Lunes: tu Weekly Report (es tu plan de la semana que empieza)', 'habito', 'Weekly report', { ir: '#weekly' }),
      T('h2', 'Mandar una reunión o situación real', 'material', 'Pedir feedback', { ir: '#feedback' }),
      T('h3', 'Practicar con tu coach y hacer el segundo intento', 'practica', 'Coaches', { coaches: true }),
      T('h4', 'Aplicarlo en tu trabajo', 'practica', 'Tu reunión real'),
      T('h5', 'Tu encuentro en vivo (clase o lab)', 'envivo', 'Tu calendario')
    ]
  };

  P.camino = [
    { n: 1, titulo: 'Start Here, tu método y tus coaches', logro: 'Entiendes cómo funciona todo, hiciste tu primer ciclo completo y ya usas tus coaches.', semanas: [
      { s: [1], titulo: 'Tu punto de partida', tareas: [
        T('1.1', 'Ver el onboarding completo, con calma', 'orientacion', 'Start Here'),
        T('1.2', 'Firmar tu Acuerdo de Trabajo', 'orientacion', 'Mi proceso', { ir: '#proceso' }),
        T('1.3', 'Grabar tu Starting Point', 'evidencia', 'Pedir feedback', { ir: '#feedback' }),
        T('1.4', 'Agendar tu primer encuentro conmigo', 'orientacion', 'Link de reserva', { reservar: true }),
        T('1.5', 'Reservar 2 o 3 bloques de 30 minutos por semana', 'habito', 'Tu calendario'),
        T('1.6', 'Presentarte en la comunidad', 'comunidad', 'Comunidad', { comunidad: true })
      ] },
      { s: [2], titulo: 'Tu método', tareas: [
        T('2.1', 'Ver la clase «Tu método · The Delivery Method™»', 'clase', 'Onboarding'),
        T('2.2', 'Tu primer Producir: 1 o 2 minutos de una situación real', 'practica', 'Pedir feedback', { ir: '#feedback' }),
        T('2.3', 'Completar tu primer Weekly Report (juntas, en tu primer encuentro)', 'habito', 'Weekly report', { ir: '#weekly' })
      ] },
      { s: [3], titulo: 'Activa tu inglés', tareas: [
        T('3.1', 'M1.1 · My Professional Context', 'clase', 'Módulo 1'),
        T('3.2', 'M1.2 · Your AT WORK Practice System', 'clase', 'Módulo 1'),
        T('3.3', 'M1.3 · Role Play Method + una práctica con tu caso', 'clase coach', 'Módulo 1 · Coaches', { coaches: true })
      ] },
      { s: [4], titulo: 'Tus coaches', tareas: [
        T('4.1', 'M1.4 · Narrative Flow + corregir un texto tuyo', 'clase coach', 'Módulo 1 · Coaches', { coaches: true }),
        T('4.2', 'M1.5 · Color Method + subir el nivel de un mail', 'clase coach', 'Módulo 1 · Coaches', { coaches: true }),
        T('4.3', 'Cerrar tu primer ciclo: detectar, segundo intento y aplicar', 'evidencia', 'Weekly report', { ir: '#weekly' })
      ] }
    ] },
    { n: 2, titulo: 'Ordena tu mensaje · el QUÉ', logro: 'Armas lo que quieres decir antes de hablar, aunque no lo tengas preparado.', semanas: [
      { s: [5], titulo: 'Decir las ideas simple', tareas: [
        T('5.1', 'M2.00 · Comunicarte cuando no tienes todo preparado', 'clase', 'Módulo 2'),
        T('5.2', 'M2.02 · Cómo decir ideas simple', 'clase', 'Módulo 2'),
        T('5.3', 'M2.03 · Paraphrasing', 'clase', 'Módulo 2')
      ] },
      { s: [6], titulo: 'Tu mapa del mensaje', tareas: [
        T('6.1', 'M2.04 · The Message Map + úsalo en tu próximo update', 'clase practica', 'Módulo 2'),
        T('6.2', 'M2.05 · Manage the Interaction', 'clase', 'Módulo 2', { pronto: true })
      ] },
      { s: [7], titulo: 'Tu situación de trabajo', tareas: [
        T('7.1', 'M2.06 · Talking About Numbers & Data', 'clase', 'Módulo 2'),
        T('7.2', 'M2 · Presentaciones: que recuerden tu mensaje', 'clase playbook', 'Módulo 2', { pronto: true })
      ] },
      { s: [8], titulo: 'Presentarte y conectar', tareas: [
        T('8.1', 'M2 · Presentarte: a un equipo nuevo o en una entrevista', 'clase', 'Módulo 2', { pronto: true }),
        T('8.2', 'M2 · Small Talk & Networking', 'clase', 'Módulo 2', { pronto: true }),
        T('8.3', 'Comparar tu primer y tu último intento del mes y compartir tu win', 'evidencia', 'Comunidad', { comunidad: true })
      ] }
    ] },
    { n: 3, titulo: 'Pule tu inglés · el CÓMO', logro: 'Detectas tú misma dónde se rompe tu inglés y lo corriges en el segundo intento.', semanas: [
      { s: [9], titulo: 'Tu sistema verbal', tareas: [
        T('9.1', 'M3 · Welcome', 'clase', 'Módulo 3'),
        T('9.2', 'M3 · Verb System: Big Picture', 'clase worksheet', 'Módulo 3'),
        T('9.3', 'M3 · Verb System: Future', 'clase worksheet', 'Módulo 3'),
        T('9.4', 'Desde ahora, en tu Weekly escribes tú primero dónde se rompió', 'habito', 'Weekly report', { ir: '#weekly' })
      ] },
      { s: [10], titulo: 'Mitad del camino', tareas: [
        T('10.1', 'M3 · Verb Patterns', 'clase', 'Módulo 3'),
        T('10.2', 'M3 · Stop Translating', 'clase', 'Módulo 3'),
        T('10.3', 'Revisión de mitad de programa: comparar con tu Starting Point', 'evidencia', 'Encuentro en vivo')
      ] },
      { s: [11], titulo: 'Precisión', tareas: [
        T('11.1', 'M3 · Nouns, Articles & Agreement', 'clase', 'Módulo 3'),
        T('11.2', 'M3 · Relative Clauses', 'clase', 'Módulo 3'),
        T('11.3', 'M3 · Modals', 'clase', 'Módulo 3')
      ] },
      { s: [12], titulo: 'Preguntar y reportar', tareas: [
        T('12.1', 'M3 · Questions & Indirect Questions', 'clase', 'Módulo 3'),
        T('12.2', 'M3 · Conditionals', 'clase', 'Módulo 3', { pronto: true }),
        T('12.3', 'M3 · Reported Speech', 'clase', 'Módulo 3', { pronto: true }),
        T('12.4', 'M3 · The Accuracy Challenge: tu Error Radar', 'clase evidencia', 'Módulo 3', { pronto: true })
      ] }
    ] },
    { n: 4, titulo: 'Entiende, hazte entender y usa tu voz', logro: 'Entiendes más en reuniones, te entienden a la primera y hablas aunque no sea perfecto.', semanas: [
      { s: [13], titulo: 'Tu oído', tareas: [
        T('13.1', 'M4 · How English Really Sounds', 'clase', 'Módulo 4', { pronto: true }),
        T('13.2', 'M4 · Train Your Ear in Meetings', 'clase', 'Módulo 4', { pronto: true })
      ] },
      { s: [14], titulo: 'Que te entiendan a la primera', tareas: [
        T('14.1', 'M4 · Pronunciation for Intelligibility + tu coach Pronunciation', 'clase coach', 'Módulo 4 · Coaches', { pronto: true, coaches: true })
      ] },
      { s: [15], titulo: 'El QUIÉN', tareas: [
        T('15.1', 'M5 · ¿No me sale o no me animo?', 'clase playbook', 'Módulo 5', { pronto: true }),
        T('15.2', 'M5 · Cuando me callo o me quedo en blanco', 'clase playbook', 'Módulo 5', { pronto: true })
      ] },
      { s: [16], titulo: 'Hablar sin ser perfecta', tareas: [
        T('16.1', 'M5 · Hablar sin ser perfecta', 'clase playbook', 'Módulo 5', { pronto: true }),
        T('16.2', 'Llevar a tu trabajo una situación que antes evitabas', 'evidencia', 'Tu trabajo')
      ] }
    ] },
    { n: 5, titulo: 'Autonomía y cierre', logro: 'Haces sola todo el ciclo y tienes la evidencia de cuánto avanzaste.', semanas: [
      { s: [17, 18], titulo: 'Tu foco final, sola', tareas: [
        T('17.1', 'Hacer tú todo el ciclo con tu situación más difícil', 'practica', 'Coaches', { coaches: true }),
        T('17.2', 'Escribir tu rutina para seguir después del programa', 'orientacion', 'Mi proceso', { ir: '#proceso' })
      ] },
      { s: [19], titulo: 'Tu evidencia', tareas: [
        T('19.1', 'Grabar tu Starting Point final', 'evidencia', 'Pedir feedback', { ir: '#feedback' })
      ] },
      { s: [20], titulo: 'Cierre', tareas: [
        T('20.1', 'Comparar con tu Starting Point en tu último encuentro', 'evidencia', 'Encuentro en vivo'),
        T('20.2', 'Compartir tu win final en la comunidad', 'evidencia', 'Comunidad', { comunidad: true }),
        T('20.3', 'Definir tu próximo nivel', 'orientacion', 'Encuentro en vivo')
      ] }
    ] }
  ];

  // Clases que Flor puede asignar desde la ficha: salen del camino.
  P.modulos.forEach((m) => { m.clases = []; });
  const modDe = (d) => { const x = /Módulo (\d)/.exec(d); return x ? Math.min(+x[1], 4) : 0; };
  P.camino.forEach((mes) => mes.semanas.forEach((sem) => sem.tareas.forEach((t) => {
    if (/clase/.test(t.tipo)) P.modulos[modDe(t.donde)].clases.push(t.texto.replace(/ \+ .*/, ''));
  })));

  // Weekly report: uno para alumnas 1:1 y otro para alumnas de LAB.
  const comunes = [
    ['wins', '01 · My wins from last week', '¿Qué avances quiero reconocer y celebrar de la semana pasada?'],
    ['donde', '02 · Where I am in AT WORK', '¿En qué módulo y clase estoy actualmente? ¿Cómo me está resultando?'],
    ['foco', '03 · My focus this week', '¿Qué me comprometo a completar y entrenar esta semana?'],
    ['training1', '04 · My training schedule · Training 1', 'Día y hora · qué voy a entrenar · con qué material o situación real.'],
    ['training2', '04 · My training schedule · Training 2', 'Día y hora · qué voy a entrenar · con qué material o situación real.']
  ];
  P.weeklyPorFormato = {
    '1:1': comunes.concat([
      ['situacion', '05 · Real situation for our 1:1', '¿Qué situación real de mi trabajo quiero practicar o trabajar con Flor en nuestra próxima clase?'],
      ['necesito', '06 · What I need from Flor', '¿Hay algo que me esté frenando? ¿Necesito ayuda, feedback o claridad sobre algo?']
    ]),
    LAB: comunes.concat([
      ['situacion', '05 · Real situation for the lab', '¿Qué situación real de mi trabajo quiero llevar al lab de esta semana?'],
      ['necesito', '06 · What I need from Flor', '¿Hay algo que me esté frenando? ¿Necesito ayuda, feedback o claridad sobre algo?']
    ])
  };
  P.weeklyLema = 'Define your focus · Book the time · Do the work';
  P.weekly = P.weeklyPorFormato.LAB; // por defecto

  // Checklist de la semana 1 (Empieza acá)
  P.onboarding = [
    'Ver el onboarding completo, con calma',
    'Firmar tu Acuerdo de Trabajo',
    'Grabar tu Starting Point',
    'Agendar tu primer encuentro con Flor',
    'Reservar 2 o 3 bloques de 30 minutos por semana',
    'Presentarte en la comunidad',
    'Completar tu primer Weekly Report'
  ];

  // "Checklist antes de continuar"
  P.compromisos = [
    ['No voy a medir mi progreso solo por cómo me siento con mi inglés.', 'Voy a mirar también qué hago diferente, qué puedo sostener mejor y qué situaciones empiezo a manejar de otra manera.'],
    ['Voy a hacer visible mi proceso.', 'Si algo me preocupa, necesito feedback, tengo una duda o quiero contarte qué pasó después de una situación que trabajamos, te lo voy a comunicar.'],
    ['Voy a reconocer mis wins, aunque sean pequeños.', 'No voy a esperar un gran resultado para recién ahí considerar que estoy avanzando.'],
    ['Voy a compartir mis wins durante el proceso.', 'No para "mostrar resultados", sino para registrar la evidencia antes de que mi cabeza la normalice y vuelva a mirar solamente lo que falta.'],
    ['Te voy a contar también qué me está ayudando.', 'Qué herramienta me sirvió, qué cambió, qué pude hacer distinto y qué necesitamos ajustar.'],
    ['Si tengo una semana mala, voy a retomar en lugar de desaparecer del proceso.', 'Sostener el proceso también cuenta como progreso.']
  ];

  P.tiposDoc = [['acuerdo', 'Acuerdo de Trabajo firmado'], ['starting', 'Starting Point'], ['plan', 'Plan de acción'], ['otro', 'Otro documento']];
})();
