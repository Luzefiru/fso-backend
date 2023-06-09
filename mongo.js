require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// accepts input in this format: node mongo.js <password> <name> <number>
const [_, __, password, nameArg, numberArg] = process.argv;

async function connectToMongoDB() {
  const CONNECTION_STRING = `mongodb+srv://admin:${password}@fso-cluster.lumsjv5.mongodb.net/phonebook?retryWrites=true&w=majority`;
  try {
    await mongoose.connect(CONNECTION_STRING);
    console.log('Connected to MongoDB.');
  } catch (err) {
    console.log(err);
    cleanUp();
  }
}

const EntrySchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Entry = mongoose.model('Entry', EntrySchema);

/* if no name & number arguments are provided, fetch all documents and display them to console */
if (!nameArg && !numberArg) {
  async function getAllPhonebookEntries() {
    await connectToMongoDB();
    const result = await Entry.find({}).exec();
    console.log('phonebook:');
    result.forEach((entry) => {
      console.log(entry.name, entry.number);
    });
    cleanUp();
  }

  getAllPhonebookEntries();
} else {
  /* if nameArg & numberArg are defined, then create a phonebook entry */
  async function createNewPhonebookEntry(name, number) {
    await connectToMongoDB();
    const newEntry = new Entry({ name, number });
    const result = await newEntry.save();
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    // close the connection
    cleanUp();
  }

  createNewPhonebookEntry(nameArg, numberArg);
}

function cleanUp() {
  mongoose.connection.close();
  process.exit();
}
