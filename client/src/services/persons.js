import axios from 'axios';
const baseUrl = '/api/persons';

// returns the array containing the resources in the path
const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

// returns the created resource
const createPerson = async (person) => {
  try {
    const response = await axios.post(baseUrl, person);
    return response.data;
  } catch (err) {
    return err.response.data;
  }
};

// returns the updated resource with the new fields
const updatePerson = async (personId, fields) => {
  const response = await axios.patch(`${baseUrl}/${personId}`, fields);
  return response.data;
};

// returns the resource after the deletion: {}
const deletePerson = async (personId) => {
  const response = await axios.delete(`${baseUrl}/${personId}`);
  return response.data;
};

const exports = { getAll, createPerson, updatePerson, deletePerson };

export default exports;
