Object.keys(process.env).forEach(key => {
  if (key.includes('SUPABASE')) {
    console.log(`${key}: DEFINED`);
  }
});
if (Object.keys(process.env).filter(k => k.includes('SUPABASE')).length === 0) {
  console.log('No SUPABASE variables found in process.env');
}
