import { useState, useEffect } from 'react';
import Filter from './Filter';
import PersonForm from './PersonForm';
import Persons from './Persons';
import personsService from './services/persons';
import Notification from './Notification';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState(null);
  const [notificationColor, setNotificationColor] = useState('green');

  useEffect(() => {
    personsService
      .getAll()
      .then((initialPersons) => setPersons(initialPersons));
  }, []);

  const handleAddNewPerson = (e) => {
    e.preventDefault();

    // catcher for duplicate numbers
    if (persons.filter((person) => person.name === newName).length !== 0) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        personsService
          .updatePerson(persons.find((p) => p.name === newName).id, {
            number: newNumber,
          })
          .then((updatedPerson) => {
            setPersons(
              persons
                .filter((p) => p.name !== newName)
                .concat({ name: newName, number: newNumber })
            );
            setNotification(`Updated ${newName}`);
            setTimeout(() => {
              setNotification(null);
            }, 5000);
            setNewName('');
            setNewNumber('');
          })
          .catch((err) => {
            const personAttemptedToUpdate = persons.find(
              (p) => p.name === newName
            );
            setNotificationColor('red');
            setNotification(
              `Information about ${personAttemptedToUpdate.name} has already been removed from the server`
            );
            setTimeout(() => {
              setNotification(null);
              setNotificationColor('green');
            }, 5000);
          });
      }
      return;
    }

    // posts to the db.json server
    personsService
      .createPerson({ name: newName, number: newNumber })
      .then((newPerson) => {
        if (!newPerson.error) {
          setPersons([...persons, newPerson]);
          setNotification(`Added ${newName}`);
          setTimeout(() => {
            setNotification(null);
          }, 5000);
          setNewName('');
          setNewNumber('');
        } else {
          setNotificationColor('red');
          setNotification(newPerson.error);
          setTimeout(() => {
            setNotification(null);
            setNotificationColor('green');
          }, 5000);
        }
      });
  };

  const handleDeletePerson = (personId) => {
    personsService
      .deletePerson(personId)
      .then(() => {
        setPersons(persons.filter((p) => p.id !== personId));
      })
      .catch((err) => {
        const personAttemptedToDelete = persons.find((p) => p.id === personId);
        setNotificationColor('red');
        setNotification(
          `Information about ${personAttemptedToDelete.name} has already been removed from the server`
        );
        setTimeout(() => {
          setNotification(null);
          setNotificationColor('green');
        }, 5000);
      });
  };

  const personsToShow = persons.filter(
    (person) => person?.name?.toLowerCase().indexOf(search.toLowerCase()) === 0
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} color={notificationColor} />
      <Filter search={search} setSearch={setSearch} />

      <h2>add a new</h2>
      <PersonForm
        handleSubmit={handleAddNewPerson}
        newName={newName}
        setNewName={setNewName}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
      />
      <h2>Numbers</h2>
      <Persons
        personsToShow={personsToShow}
        handleDeletePerson={handleDeletePerson}
      />
    </div>
  );
};

export default App;
