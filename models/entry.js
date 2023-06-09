const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  name: String,
  number: String,
});

EntrySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
  },
});

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = Entry;
