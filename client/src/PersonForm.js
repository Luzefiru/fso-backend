const PersonForm = ({
  handleSubmit,
  newName,
  setNewName,
  newNumber,
  setNewNumber,
}) => {
  const handleChange = (e, setValue) => {
    setValue(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        name:{' '}
        <input
          onChange={(e) => handleChange(e, setNewName)}
          value={newName}
          required
        />
      </div>
      <div>
        number:{' '}
        <input
          onChange={(e) => handleChange(e, setNewNumber)}
          value={newNumber}
          required
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

export default PersonForm;
