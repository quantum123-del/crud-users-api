const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnzdysqeqbbbbgxsghec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuemR5c3FlcWJiYmJneHNnaGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk4MTczOSwiZXhwIjoyMDkyNTU3NzM5fQ.qfsYusTEbBAY8wG2wJeGxl9kf-Y_JiJr-uwI0yK3q1E';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
    }
  }
});

module.exports = supabase;