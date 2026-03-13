Object.keys(process.env).forEach(key => {
  if (key.startsWith('VITE_')) {
    console.log(`${key}: DEFINED`);
  }
});
if (Object.keys(process.env).filter(k => k.startsWith('VITE_')).length === 0) {
  console.log('No VITE_ variables found in process.env');
}
