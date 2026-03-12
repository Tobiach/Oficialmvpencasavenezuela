import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      process.env[key.trim()] = value.join('=').trim();
    }
  });
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('--- Supabase Connection Test ---');
console.log('URL:', supabaseUrl ? 'Configured' : 'MISSING');
console.log('Key:', supabaseAnonKey ? 'Configured' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Environment variables are missing in process.env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Try to fetch from 'stores' table (created in Day 1)
    const { error } = await supabase.from('stores').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection failed:', error.message);
      if (error.message.includes('Failed to fetch')) {
        console.error('Tip: Check if the URL is correct and reachable.');
      }
      process.exit(1);
    }
    
    console.log('Success: Connection established correctly.');
    console.log('Stores table is reachable.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

testConnection();
