(async () => {
  try {
    const base = 'http://localhost:4000';
    const username = 'auto_test_' + Date.now();
    console.log('Trying register', username);
    const r = await fetch(base + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'pass123', name: 'Auto Test' })
    });
    const text = await r.text();
    console.log('REGISTER', r.status, text);

    console.log('Trying login', username);
    const lr = await fetch(base + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'pass123' })
    });
    const ltxt = await lr.text();
    console.log('LOGIN', lr.status, ltxt);
  } catch (e) {
    console.error('TEST ERROR', e && e.message ? e.message : e);
  }
})();
