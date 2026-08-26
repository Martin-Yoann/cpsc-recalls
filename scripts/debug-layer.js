const http = require('http');
http.get('http://localhost:3000/_next/static/chunks/src_app_globals_162hn9o.css', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const baseIdx = d.indexOf('@layer base');
    const compIdx = d.indexOf('@layer components');
    const utilIdx = d.indexOf('@layer utilities');
    console.log('base @', baseIdx, '| components @', compIdx, '| utilities @', utilIdx);
    // find 'a{' with color:inherit
    const re = /a\{[^}]*color:\s*inherit[^}]*\}/g;
    let m, c = 0;
    while ((m = re.exec(d)) && c < 10) {
      console.log('a{color:inherit} @', m.index, '=> in base?', m.index > baseIdx && m.index < compIdx);
      c++;
    }
    const fi = d.indexOf('.footer-band a');
    console.log('.footer-band a @', fi, '=> in utilities?', fi > utilIdx);
    // Also print the base layer opening context
    console.log('=== base layer opening ===');
    console.log(d.slice(baseIdx, baseIdx + 120).replace(/\n/g, ' '));
  });
});
