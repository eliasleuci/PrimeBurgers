import { createClient } from '@supabase/supabase-js';

// HARDCODED para depuración definitiva
const supabaseUrl = 'https://gxfdzjhxhuaenavxpzkj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZmR6amh4aHVhZW5hdnhwemtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDAzNTQsImV4cCI6MjA5MDU3NjM1NH0.TrxEwJAc2UBnY3ri_rdzPYHAgTOMwoqj1fgpAU5XFo0';

console.log('🚀 DEBUG: Usando credenciales HARDCODED');
console.log('🔗 URL:', supabaseUrl);
console.log('🔑 Key inicia con:', supabaseAnonKey.substring(0, 15));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
