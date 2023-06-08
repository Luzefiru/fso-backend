const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(express.json(), cors(), express.static('build'));

app.use(
  morgan(
    function (tokens, req, res) {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        JSON.stringify(req.body),
      ].join(' ');
    },
    { skip: (req, res) => req.method !== 'POST' }
  )
);

let db = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/info', (req, res) => {
  const numOfPeople = db.length;
  const response = `<p>Phonebook has info for ${numOfPeople} people</p><p>${new Date()}</p>`;
  res.send(response);
});

app.get('/api/persons', (req, res) => {
  res.json(db);
});

app.get('/api/persons/:id', (req, res) => {
  const idToSearch = Number(req.params.id);
  const personWithId = db.find((person) => person.id === idToSearch);

  if (personWithId) {
    return res.json(personWithId);
  } else {
    return res.status(404).end();
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const idToDelete = Number(req.params.id);
  const oldDbLength = db.length;
  db = db.filter((person) => person.id !== idToDelete);
  const newDbLength = db.length;
  if (newDbLength < oldDbLength) {
    return res.status(200).json({
      status: 204,
      success: true,
      message: `Person with id ${idToDelete} was successfully deleted`,
    });
  } else {
    return res.status(404).json({
      status: 404,
      success: false,
      message: `No person was deleted`,
    });
  }
});

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body;
  const nameAlreadyExists = db.find((person) => person.name === name);
  if (!name) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: `name field must be defined`,
    });
  } else if (!number) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: `number field must be defined`,
    });
  } else if (nameAlreadyExists) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: `name must be unique`,
    });
  }

  const newId = Math.floor(Math.random() * 2048);
  const newPerson = { name, number, id: newId };
  db.push(newPerson);

  res.status(200).json({
    status: 201,
    success: true,
    message: `The person with id ${newId} was successfully added to the Phonebook.`,
    person: newPerson,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
