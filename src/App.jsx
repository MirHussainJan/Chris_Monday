import { useState, useEffect } from "react";
import Table from "./components/Table/Table";
import { getBoards, getBoardsData, getPeopleColumns } from "./MondayAPI/monday2"; // Import necessary API functions

const App = () => {
  const [boards, setBoards] = useState([]);
  const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  const [boardData, setBoardData] = useState([]);
  const [peopleColumns, setPeopleColumns] = useState([]); // Store the people columns
  const [selectedPeopleColumns, setSelectedPeopleColumns] = useState([]); // Track selected people columns

  // Fetch boards on initial render
  useEffect(() => {
    const fetchBoards = async () => {
      const boards = await getBoards();
      setBoards(boards);
    };
    fetchBoards();
  }, []);

  // Fetch people columns for selected boards
  useEffect(() => {
    const fetchPeopleColumns = async () => {
      if (selectedBoardIds.length > 0) {
        const peopleColumns = await getPeopleColumns(selectedBoardIds);
        const allPeopleColumns = peopleColumns.flatMap((board) =>
          board.columns.map((column) => ({
            ...column,
            boardName: board.name, // Attach the parent board name
          }))
        );
        setPeopleColumns(allPeopleColumns);
      } else {
        setPeopleColumns([]);
      }
    };
    fetchPeopleColumns();
  }, [selectedBoardIds]);

  // Handle board selection
  const handleCheckboxChange = (boardId) => {
    setSelectedBoardIds((prev) =>
      prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId]
    );
  };

  // Handle people column selection
  const handlePeopleColumnSelection = (column) => {
    setSelectedPeopleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  return (
    <div>
      <h1>Select Boards</h1>
      {boards.length > 0 ? (
        <div>
          {boards.map((board) => (
            <div key={board.id}>
              <input
                type="checkbox"
                id={board.id}
                checked={selectedBoardIds.includes(board.id)}
                onChange={() => handleCheckboxChange(board.id)}
              />
              <label htmlFor={board.id}>{board.name}</label>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading boards...</p>
      )}

      <h2>Select Columns</h2>
      {peopleColumns.length > 0 ? (
        <div>
          {peopleColumns.map((column) => (
            <div key={column.id}>
              <input
                type="checkbox"
                id={column.id}
                checked={selectedPeopleColumns.includes(column)}
                onChange={() => handlePeopleColumnSelection(column)}
              />
              <label htmlFor={column.id}>{column.title}</label>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading people columns...</p>
      )}

      <h2>Board Data</h2>
      {selectedBoardIds.length > 0 ? (
        <Table
          boardIds={selectedBoardIds} // Pass selected board IDs to Table
          selectedPeopleColumns={selectedPeopleColumns} // Pass selected columns to Table
        />
      ) : (
        <p>Select boards to see their data.</p>
      )}
    </div>
  );
};

export default App;