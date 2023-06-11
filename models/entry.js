const mongoose = require('mongoose');

function validatePhoneNumber(inp) {
  const regex = /^\d{2,3}-\d+$/;
  return regex.test(inp);
}

const EntrySchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: true },
  number: {
    type: String,
    validate: {
      validator: validatePhoneNumber,
      message: (props) => `${props.value} is not a valid Phone Number`,
    },
    required: true,
  },
});

EntrySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
  },
});

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = Entry;
