const TableContainer = ({ children }) => {
  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "12px",
        paddingLeft: "32px",
        paddingRight: "32px",
      }}
    >
      {children}
    </section>
  );
};

export default TableContainer;
