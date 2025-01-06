import React, { useState, useEffect } from "react";
import { Checkbox, Button } from "monday-ui-react-core";
import {
  getBoards,
  getPeopleColumns,
  getDateColumns,
  getStatusColumns,
  getTimeTrackingColumns,
} from "../../MondayAPI/monday2";

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
        console.log("Fetched Boards:", fetchedBoards); // Debug log for boards
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
        const peopleColumns = await getPeopleColumns([boardId]);
        const dateColumns = await getDateColumns([boardId]);
        const statusColumns = await getStatusColumns([boardId]);
        const timeTrackingColumns = await getTimeTrackingColumns([boardId]);

        // Debugging the fetched columns
        console.log("People Columns:", peopleColumns);
        console.log("Date Columns:", dateColumns);
        console.log("Status Columns:", statusColumns);
        console.log("Time Tracking Columns:", timeTrackingColumns);

        const allColumns = [
          ...peopleColumns.flatMap((board) =>
            board.columns.map((col) => ({ ...col, boardId: boardId }))
          ),
          ...dateColumns.flatMap((board) =>
            board.columns.map((col) => ({ ...col, boardId: boardId }))
          ),
          ...statusColumns.flatMap((board) =>
            board.columns.map((col) => ({ ...col, boardId: boardId }))
          ),
          ...timeTrackingColumns.flatMap((board) =>
            board.columns.map((col) => ({ ...col, boardId: boardId }))
          ),
        ];

        // Debugging the columns after adding
        console.log("All Columns:", allColumns);

        setColumns((prevColumns) => [...prevColumns, ...allColumns]);
      } catch (error) {
        console.error("Error fetching columns:", error);
      } finally {
        setLoadingColumns(false);
      }
    } else {
      // Remove columns related to the unchecked board
      setColumns((prevColumns) =>
        prevColumns.filter((col) => col.boardId !== boardId)
      );

      // Remove selected columns related to the unchecked board
      setSelectedColumns((prevSelectedColumns) =>
        prevSelectedColumns.filter((key) => !key.endsWith(`@${boardId}`))
      );
    }
  };

  const handleColumnSelection = (columnId, boardId, isChecked) => {
    const columnKey = `${columnId}@${boardId}`;
    const updatedSelectedColumns = isChecked
      ? [...selectedColumns, columnKey]
      : selectedColumns.filter((key) => key !== columnKey);

    setSelectedColumns(updatedSelectedColumns);
  };

  if (!isOpen) return null;

  const groupedColumns = columns.reduce((acc, col) => {
    acc[col.boardId] = acc[col.boardId] || [];
    acc[col.boardId].push(col);
    return acc;
  }, {});

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
      {Object.keys(groupedColumns).length > 0 && (
        <div>
          <h4>Select Columns</h4>
          {loadingColumns ? (
            <p>Loading columns...</p>
          ) : (
            Object.entries(groupedColumns).map(([boardId, cols]) => {
              const board = boards.find((b) => b.id === boardId);
              return (
                <div key={boardId}>
                  <h5>Board: {board ? board.name : boardId}</h5>
                  {cols.map((col) => {
                    const columnKey = `${col.id}@${col.boardId}`;
                    return (
                      <Checkbox
                        key={columnKey}
                        label={col.title}
                        checked={selectedColumns.includes(columnKey)}
                        onChange={(e) =>
                          handleColumnSelection(col.id, col.boardId, e.target.checked)
                        }
                      />
                    );
                  })}
                </div>
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