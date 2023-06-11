const Person = ({ person, handleDeletePerson }) => {
  const confirmDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${person.name}?`)) {
      handleDeletePerson(person.id);
    }
  };

  return (
    <div>
      {person.name} {person.number}{' '}
      <button onClick={confirmDelete}>delete</button>
    </div>
  );
};

export default Person;
