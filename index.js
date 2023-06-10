require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(express.json(), cors(), express.static('build'));
const mongoose = require('mongoose');
const Entry = require('./models/entry');
mongoose.set('strictQuery', false);

// morgan console logging
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

// MongoDB connection
async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log('Connected to MongoDB.');
  } catch (err) {
    console.log('Error connecting to MongoDB:', err);
  }
}
connectToMongoDB();

// routes
app.get('/info', async (req, res) => {
  const entries = await Entry.find({});
  const response = `<p>Phonebook has info for ${
    entries.length
  } people</p><p>${new Date()}</p>`;
  res.send(response);
});

app.get('/api/persons', async (req, res) => {
  const entries = await Entry.find({});
  res.json(entries);
});

app.get('/api/persons/:id', async (req, res) => {
  const idToSearch = req.params.id;
  const personWithId = await Entry.find({ _id: idToSearch }).exec();

  if (personWithId) {
    return res.json(personWithId);
  } else {
    return res.status(404).end();
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  const idToDelete = req.params.id;
  try {
    const deletedEntry = await Entry.findByIdAndDelete(idToDelete);
    if (deletedEntry) {
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
  } catch (err) {
    return next(err);
  }
});

app.post('/api/persons', async (req, res) => {
  const { name, number } = req.body;
  const nameAlreadyExists = await Entry.find({ name });
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
  } else if (nameAlreadyExists.length > 0) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: `name must be unique`,
    });
  }

  const newEntry = new Entry({ name, number });
  const savedEntry = await newEntry.save();

  res.status(200).json({
    status: 201,
    success: true,
    message: `The person with id ${savedEntry._id} was successfully added to the Phonebook.`,
    person: savedEntry,
  });
});

app.use((req, res) => {
  res.status(404).send({ error: 'Unknown endpoint.' });
});

app.use((err, req, res, next) => {
  console.log(err.message);

  if (err.name === 'CastError') {
    res.status(504).send({ error: 'incorrect id format' });
  }
});

// server initialization
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
