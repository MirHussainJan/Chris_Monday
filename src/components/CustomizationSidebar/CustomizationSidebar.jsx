import React, { useState, useEffect } from "react";
import { Checkbox, Button } from "monday-ui-react-core";
import { getBoards, getColumns } from "../../MondayAPI/monday2"; // Generic function to get columns

const CustomizationSidebar = ({
  isOpen,
  onClose,
  selectedBoardIds,
  setSelectedBoardIds,
  selectedColumns,
  setSelectedColumns,
}) => {
  const [boards, setBoards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      setLoadingBoards(true);
      try {
        const fetchedBoards = await getBoards();
        setBoards(fetchedBoards);
      } catch (error) {
        console.error("Error fetching boards:", error);
      } finally {
        setLoadingBoards(false);
      }
    };
    fetchBoards();
  }, []);

  const handleBoardSelection = async (boardId, isChecked) => {
    const updatedBoardIds = isChecked
      ? [...selectedBoardIds, boardId]
      : selectedBoardIds.filter((id) => id !== boardId);
    setSelectedBoardIds(updatedBoardIds);

    if (isChecked) {
      setLoadingColumns(true);
      try {
        const fetchedColumns = await getColumns(updatedBoardIds); // Fetch all column types
        const allColumns = fetchedColumns.flatMap((board) =>
          board.columns.map((column) => ({
            ...column,
            boardId: board.id,
          }))
        );
        setColumns(allColumns);
      } catch (error) {
        console.error("Error fetching columns:", error);
      } finally {
        setLoadingColumns(false);
      }
    } else {
      // Remove deselected board's columns
      const filteredColumns = selectedColumns.filter(
        (colKey) => !colKey.endsWith(`@${boardId}`)
      );
      setSelectedColumns(filteredColumns);

      const updatedColumns = columns.filter(
        (column) => column.boardId !== boardId
      );
      setColumns(updatedColumns);
    }
  };

  const handleColumnSelection = (columnId, boardId, isChecked) => {
    const columnKey = `${columnId}@${boardId}`;
    const updatedColumns = isChecked
      ? [...selectedColumns, columnKey]
      : selectedColumns.filter((key) => key !== columnKey);
    setSelectedColumns(updatedColumns);
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar">
      <h3>Customization Sidebar</h3>
      <div>
        <h4>Select Boards</h4>
        {loadingBoards ? (
          <p>Loading boards...</p>
        ) : (
          boards.map((board) => (
            <Checkbox
              key={board.id}
              label={board.name}
              checked={selectedBoardIds.includes(board.id)}
              onChange={(e) => handleBoardSelection(board.id, e.target.checked)}
            />
          ))
        )}
      </div>
      {columns.length > 0 && (
        <div>
          <h4>Select Columns</h4>
          {loadingColumns ? (
            <p>Loading columns...</p>
          ) : (
            columns.map((col) => {
              const columnKey = `${col.id}@${col.boardId}`;
              return (
                <Checkbox
                  key={columnKey}
                  label={`${col.title} (Board: ${col.boardId})`}
                  checked={selectedColumns.includes(columnKey)}
                  onChange={(e) =>
                    handleColumnSelection(col.id, col.boardId, e.target.checked)
                  }
                />
              );
            })
          )}
        </div>
      )}
      <div style={{ marginTop: "20px" }}>
        <Button onClick={onClose} kind={Button.kinds.PRIMARY}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSidebar;