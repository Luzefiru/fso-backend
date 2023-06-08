const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(express.static('build'));
app.use(cors());

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true,
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
];

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
  res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((note) => note.id === id);

  if (note) {
    res.json(note);
  } else {
    res.statusMessage = 'Note does not exist';
    res.status(404).end();
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const idToDelete = Number(req.params.id);
  notes = notes.filter((note) => note.id !== idToDelete);
  res.status(204).end();
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post('/api/notes', (req, res) => {
  // catcher for invalid request data, must have req.body.content
  if (!req.body.content) {
    return res.status(400).json({
      error: 'content missing',
    });
  }

  const note = {
    content: req.body.content,
    important: req.body.important || false,
    id: generateId(),
  };

  notes = notes.concat(note);

  res.json(note);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
