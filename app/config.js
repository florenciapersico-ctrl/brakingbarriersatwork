// Datos de tu proyecto de Supabase (Project Settings › API).
// La clave "publishable" / "anon" es pública a propósito: los permisos los cuida la base (RLS).
// NUNCA pongas acá la service_role / secret key ni tu clave de Anthropic.
window.ATW_CONFIG = {
  SUPABASE_URL: 'https://mcjjzpuvvorugqpjyxza.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_I6ulHDbrqfG0maZOEil_Yw_zUZYVy7n',
  // Ponelo en true cuando la función flor-ai esté publicada con tu clave de Anthropic.
  // Mientras esté en false, los coaches abren tus coaches de Claude (cada alumna con su cuenta).
  FLOR_AI_ACTIVA: false
};
