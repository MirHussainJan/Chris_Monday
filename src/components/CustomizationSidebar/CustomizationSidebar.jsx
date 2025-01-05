import React, { useState, useEffect } from "react";
import { Checkbox, Button } from "monday-ui-react-core";
import { getBoards, getPeopleColumns } from "../../MondayAPI/monday2";

const CustomizationSidebar = ({
  isOpen,
  onClose,
  selectedBoardIds,
  setSelectedBoardIds,
  selectedPeopleColumns,
  setSelectedPeopleColumns,
}) => {
  const [boards, setBoards] = useState([]);
  const [peopleColumns, setPeopleColumns] = useState([]);
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

    if (updatedBoardIds.length > 0) {
      setLoadingColumns(true);
      try {
        const fetchedColumns = await getPeopleColumns(updatedBoardIds);
        const allColumns = fetchedColumns.flatMap((board) =>
          board.columns.map((column) => ({
            ...column,
            boardId: board.id, // Associate column with its board
          }))
        );
        setPeopleColumns(allColumns);
      } catch (error) {
        console.error("Error fetching people columns:", error);
      } finally {
        setLoadingColumns(false);
      }
    } else {
      setPeopleColumns([]);
    }
  };

  const handleColumnSelection = (columnId, boardId, isChecked) => {
    const columnKey = `${columnId}@${boardId}`;
    const updatedColumns = isChecked
      ? [...selectedPeopleColumns, columnKey]
      : selectedPeopleColumns.filter((key) => key !== columnKey);
    setSelectedPeopleColumns(updatedColumns);
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
      {peopleColumns.length > 0 && (
        <div>
          <h4>Select People Columns</h4>
          {loadingColumns ? (
            <p>Loading columns...</p>
          ) : (
            peopleColumns.map((col) => {
              const columnKey = `${col.id}@${col.boardId}`;
              return (
                <Checkbox
                  key={columnKey}
                  label={`${col.title} (Board: ${col.boardId})`}
                  checked={selectedPeopleColumns.includes(columnKey)}
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
