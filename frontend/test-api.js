fetch('http://localhost:5174/api/create-order', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({amount: 500})
}).then(r => r.text()).then(console.log);
