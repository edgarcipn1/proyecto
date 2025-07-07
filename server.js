const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const CSV_PATH = path.join(__dirname, 'data', 'usuarios.csv');
const CSV_PATH_QUIZ = path.join(__dirname, 'data', 'cuestionario.csv');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


// Endpoint para obtener los datos del CSV
app.get('/usuarios', (req, res) => {
  const results = [];
  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => res.json(results));
});

app.get('/cuestionario', (req, res) => {
  const results = [];
  fs.createReadStream(CSV_PATH_QUIZ)
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




app.post('/actualizar', (req, res) => {
  const { id, puntos, intentos } = req.body;
  const filePath = path.join(__dirname, 'data/usuarios.csv');
  const usuarios = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      if (data.id === id) {
        data.puntos = puntos;
        data.intentos = intentos;
      }
      usuarios.push(data);
    })
    .on('end', () => {
      const writer = createCsvWriter({
        path: filePath,
        header: [
          { id: 'id', title: 'id' },
          { id: 'name', title: 'name' },
          { id: 'puntos', title: 'puntos' },
          { id: 'intentos', title: 'intentos' },
        ],
      });

      writer.writeRecords(usuarios)
        .then(() => {
          res.json({ ok: true, updated: id });
        })
        .catch(err => {
          console.error("Error al escribir CSV:", err);
          res.status(500).json({ error: "No se pudo guardar el archivo" });
        });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
