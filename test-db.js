import { supabase } from './lib/supabaseClient.js';

async function testConnection() {
  console.log('🔄 Conectando con Supabase...');
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Error de conexión:', error.message);
  } else {
    console.log('✅ Conexión exitosa. Datos de ingredients:');
    console.table(data);
  }
}

testConnection();
