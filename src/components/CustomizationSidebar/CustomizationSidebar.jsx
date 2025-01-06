import React, { useEffect, useState } from "react";
import { getBoardsData } from "../../MondayAPI/monday2";

const CustomizationSidebar = ({
  isOpen,
  onClose,
  selectedBoardIds,
  setSelectedBoardIds,
  selectedColumns,
  setSelectedColumns,
}) => {
  const [boards, setBoards] = useState([]);
  const [columns, setColumns] = useState({}); // { boardId: [columns] }

  useEffect(() => {
    const fetchBoards = async () => {
      const boardsData = await getBoardsData(); // Fetch all boards
      setBoards(boardsData);
    };
    fetchBoards();
  }, []);

  const handleBoardSelection = async (boardId) => {
    const updatedBoardIds = selectedBoardIds.includes(boardId)
      ? selectedBoardIds.filter((id) => id !== boardId)
      : [...selectedBoardIds, boardId];

    setSelectedBoardIds(updatedBoardIds);

    if (!columns[boardId]) {
      const boardData = await getBoardsData([boardId]); // Fetch columns for selected board
      const boardColumns = boardData[0]?.columns || [];
      setColumns((prev) => ({ ...prev, [boardId]: boardColumns }));
    }
  };

  const handleColumnSelection = (columnId) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  return isOpen ? (
    <div className="sidebar">
      <button onClick={onClose}>Close Sidebar</button>
      <h2>Boards</h2>
      {boards.map((board) => (
        <div key={board.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedBoardIds.includes(board.id)}
              onChange={() => handleBoardSelection(board.id)}
            />
            {board.name}
          </label>
          {selectedBoardIds.includes(board.id) &&
            columns[board.id]?.map((column) => (
              <div key={column.id} style={{ marginLeft: "20px" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.id)}
                    onChange={() => handleColumnSelection(column.id)}
                  />
                  {column.title}
                </label>
              </div>
            ))}
        </div>
      ))}
    </div>
  ) : null;
};

export default CustomizationSidebar;