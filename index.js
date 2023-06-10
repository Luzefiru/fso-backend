require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
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

app.get('/api/persons', async (req, res, next) => {
  try {
    const entries = await Entry.find({});
    return res.json(entries);
  } catch (err) {
    next(err);
  }
});

app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const idToSearch = req.params.id;
    const personWithId = await Entry.findById(idToSearch);

    if (personWithId) {
      return res.json(personWithId);
    } else {
      return res.status(404).end();
    }
  } catch (err) {
    next(err);
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

  // validates whether the HTTP request body input meets constraints
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
  }

  // // duplicate name handler
  // // updates the existing MongoDB document via a PATCH HTTP request to itself (same server)
  // if (nameAlreadyExists.length > 0) {
  //   const response = await axios.put(
  //     `http://127.0.0.1:${process.env.PORT || '3001'}/api/persons/${
  //       nameAlreadyExists[0]._id
  //     }`,
  //     { name, number }
  //   );
  //   if (response.data.success === true) {
  //     return res.status(200).json({
  //       status: 200,
  //       success: true,
  //       message: response.data.message,
  //       person: response.data.person,
  //     });
  //   } else {
  //     return res.status(500).json({
  //       status: 500,
  //       success: false,
  //       message: 'failed to update existing person due to a server error',
  //     });
  //   }
  // }

  // otherwise, creates a new entry in the collection
  const newEntry = new Entry({ name, number });
  const savedEntry = await newEntry.save();

  res.status(201).json({
    status: 201,
    success: true,
    message: `The person with id ${savedEntry._id} was successfully added to the Phonebook.`,
    person: savedEntry,
  });
});

app.patch('/api/persons/:id', async (req, res, next) => {
  const { name, number } = req.body;
  const idToUpdate = req.params.id;

  try {
    const updatedEntry = await Entry.findByIdAndUpdate(
      idToUpdate,
      { name, number },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      success: true,
      message: `The person with id ${updatedEntry._id} was successfully updated.`,
      person: updatedEntry,
    });
  } catch (err) {
    return next(err);
  }
});

// unknown route handler
app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
});

// error handler
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
