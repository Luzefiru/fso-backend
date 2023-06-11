import Person from './Person';

const Persons = ({ personsToShow, handleDeletePerson }) => {
  return personsToShow.map((person) => (
    <Person
      key={person.id}
      person={person}
      handleDeletePerson={handleDeletePerson}
    />
  ));
};

export default Persons;
