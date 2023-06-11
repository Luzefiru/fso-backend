const Filter = ({ search, setSearch }) => {
  const handleChange = (e, setValue) => {
    setValue(e.target.value);
  };

  return (
    <form>
      filter shown with{' '}
      <input
        onChange={(e) => {
          handleChange(e, setSearch);
        }}
        value={search}
      />
    </form>
  );
};

export default Filter;
