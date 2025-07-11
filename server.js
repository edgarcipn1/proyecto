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


app.get('/usuarios', (req, res) => {
  const results = [];

  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
  const horaActual = ahora.getHours();


  fs.createReadStream(path.join(__dirname, 'data', 'usuarios.csv'))
    .pipe(csv())
    .on('data', (row) => {
      try {
        // Validar campos requeridos
        if (!row.id || !row.puntos || !row.fecha || !row.hora) {
          console.warn('Fila incompleta o vacía:', row);
          return;
        }

        const horaPartes = row.hora.split(':');
        const horaFila = parseInt(horaPartes[0], 10);

        if (row.fecha === hoy && horaFila === horaActual) {
          results.push({
            id: row.id,
            puntajeTotal: parseInt(row.puntos) || 0,
            fecha: row.fecha,
            hora: row.hora,
          });
        }
      } catch (e) {
        console.error('Error procesando fila:', row, e);
      }
    })
    .on('end', () => {
      const top10 = results
        .sort((a, b) => b.puntajeTotal - a.puntajeTotal)
        .slice(0, 10);

      res.json(top10);
    })
    .on('error', (err) => {
      console.error('Error al leer CSV:', err);
      res.status(500).send('Error leyendo CSV');
    });
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
  const { name, id, surname } = req.body;
  const date = new Date().toISOString();
  const nuevo = `\n${id},${name},${surname},0,0,${date}`;

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
      if (!data.id?.trim()) return;
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
          { id: 'date', title: 'date' }
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
