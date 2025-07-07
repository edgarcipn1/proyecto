const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const CSV_PATH = path.join(__dirname, 'data', 'usuarios.csv');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint para obtener los datos del CSV
app.get('/usuarios', (req, res) => {
  const results = [];
  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => res.json(results));
});

// Endpoint para agregar nuevo usuario
app.post('/agregar', (req, res) => {
  const { name, id } = req.body;
  const date = new Date().toISOString();
  const nuevo = `\n${name},${id},0,0,${date}`;
  
  fs.appendFile(CSV_PATH, nuevo, (err) => {
    if (err) return res.status(500).send('Error al guardar');
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
