import React, { useState, useEffect } from "react";
import { ExpandCollapse, Checkbox, Button, Dropdown } from "monday-ui-react-core";
import "monday-ui-react-core/dist/main.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IoClose } from "react-icons/io5"; // Importing the close icon

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
  const [peopleColumns, setPeopleColumns] = useState([]);
  const [statusColumns, setStatusColumns] = useState([]);
  const [dateColumns, setDateColumns] = useState([]);
  const [timeTrackingColumns, setTimeTrackingColumns] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [columnsCache, setColumnsCache] = useState({}); // Cache for fetched columns

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
      // Check if columns are already cached
      if (columnsCache[boardId]) {
        const cachedColumns = columnsCache[boardId];
        setPeopleColumns((prev) => [...prev, ...cachedColumns.people]);
        setDateColumns((prev) => [...prev, ...cachedColumns.date]);
        setStatusColumns((prev) => [...prev, ...cachedColumns.status]);
        setTimeTrackingColumns((prev) => [...prev, ...cachedColumns.timeTracking]);
      } else {
        // Fetch columns if not cached
        setLoadingColumns(true);
        try {
          const fetchedPeopleColumns = await getPeopleColumns([boardId]);
          const fetchedDateColumns = await getDateColumns([boardId]);
          const fetchedStatusColumns = await getStatusColumns([boardId]);
          const fetchedTimeTrackingColumns = await getTimeTrackingColumns([boardId]);

          const newColumns = {
            people: fetchedPeopleColumns.flatMap((board) =>
              board.columns.map((col) => ({ ...col, boardId }))
            ),
            date: fetchedDateColumns.flatMap((board) =>
              board.columns.map((col) => ({ ...col, boardId }))
            ),
            status: fetchedStatusColumns.flatMap((board) =>
              board.columns.map((col) => ({ ...col, boardId }))
            ),
            timeTracking: fetchedTimeTrackingColumns.flatMap((board) =>
              board.columns.map((col) => ({ ...col, boardId }))
            ),
          };

          // Update the state and cache
          setPeopleColumns((prev) => [...prev, ...newColumns.people]);
          setDateColumns((prev) => [...prev, ...newColumns.date]);
          setStatusColumns((prev) => [...prev, ...newColumns.status]);
          setTimeTrackingColumns((prev) => [...prev, ...newColumns.timeTracking]);
          setColumnsCache((prev) => ({ ...prev, [boardId]: newColumns }));
        } catch (error) {
          console.error("Error fetching columns:", error);
        } finally {
          setLoadingColumns(false);
        }
      }
    } else {
      // Remove columns for deselected board
      setPeopleColumns((prev) => prev.filter((col) => col.boardId !== boardId));
      setDateColumns((prev) => prev.filter((col) => col.boardId !== boardId));
      setStatusColumns((prev) => prev.filter((col) => col.boardId !== boardId));
      setTimeTrackingColumns((prev) => prev.filter((col) => col.boardId !== boardId));

      setSelectedColumns((prevSelectedColumns) =>
        prevSelectedColumns.filter((key) => !key.endsWith(`@${boardId}`))
      );
    }
  };

  const handleColumnSelection = (columnId, boardId, type) => {
    const columnKey = `${columnId}@${boardId}`;

    // Update selectedColumns array by removing the previous selection for the same type and adding the new one
    const updatedSelectedColumns = selectedColumns.filter(
      (key) => !key.startsWith(`${type}@`)
    );

    // Add the newly selected column
    updatedSelectedColumns.push(columnKey);

    setSelectedColumns(updatedSelectedColumns);
  };

  const renderSkeleton = (count) => (
    <div className="mb-3">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} height={25} width="100%" className="mb-2" />
      ))}
    </div>
  );

  const renderColumnsSection = (title, columns, type) => {
    if (loadingColumns) return renderSkeleton(5);
    if (columns.length === 0) return null;

    return (
      <ExpandCollapse
        title={
          <span
            className="truncate-text"
            title={title}
            style={{
              maxWidth: "200px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
        }
        isExpanded
      >
        <Dropdown
          options={columns.map((col) => ({
            value: `${col.id}@${col.boardId}`,
            label: `${col.title} (${boards.find((b) => b.id === col.boardId)?.name || col.boardId})`,
          }))}
          value={selectedColumns.find((key) => key.startsWith(`${type}@`)) || ''}
          onChange={(e) => handleColumnSelection(e.value.split('@')[0], e.value.split('@')[1], type)}
          placeholder={`Select ${title}`}
          style={{ width: '100%' }}
        />
      </ExpandCollapse>
    );
  };

  return (
    <div
      className={`sidebar p-4 bg-white border border-gray-300 rounded-lg shadow-lg fixed top-0 right-0 h-full transition-all duration-300 ${
        isOpen ? "transform translate-x-0" : "transform translate-x-full"
      }`}
      style={{
        maxHeight: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        width: "300px !important", // Adjust sidebar width as needed
        zIndex: "1000 !important", // Make sure sidebar stays on top
      }}
    >
      {/* Close Icon */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Customize</h3>
        <IoClose
          size={24}
          className="cursor-pointer"
          onClick={onClose}
          title="Close"
        />
      </div>

      {/* Boards Section */}
      <ExpandCollapse title="Boards" className="my-3" isExpanded>
        {loadingBoards ? (
          renderSkeleton(5)
        ) : (
          boards.map((board) => (
            <Checkbox
              key={board.id}
              label={board.name}
              checked={selectedBoardIds.includes(board.id)}
              onChange={(e) => handleBoardSelection(board.id, e.target.checked)}
              className="my-2"
            />
          ))
        )}
      </ExpandCollapse>

      {/* Columns Sections */}
      {selectedBoardIds.length > 0 && (
        <>
          {renderColumnsSection("People Columns", peopleColumns, "people")}
          {renderColumnsSection("Status Columns", statusColumns, "status")}
          {renderColumnsSection("Date Columns", dateColumns, "date")}
          {renderColumnsSection("Time Tracking Columns", timeTrackingColumns, "timeTracking")}
        </>
      )}

      <div className="mt-5 flex justify-end">
        <Button onClick={onClose} kind={Button.kinds.PRIMARY}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSidebar;