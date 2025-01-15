import React, { useState, useEffect } from "react";
import {
  ExpandCollapse,
  Checkbox,
  Button,
  Dropdown,
  Text,
} from "monday-ui-react-core";
import "monday-ui-react-core/dist/main.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IoClose } from "react-icons/io5";
import { MdCheckBox, MdCalendarToday, MdPeople, MdTimer, MdDashboard } from "react-icons/md";

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
  const [columnsCache, setColumnsCache] = useState({});

  useEffect(() => {
    console.log(selectedColumns)
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
  }, [selectedColumns]);

  const handleBoardSelection = async (boardId, isChecked) => {
    const updatedBoardIds = isChecked
      ? [...selectedBoardIds, boardId]
      : selectedBoardIds.filter((id) => id !== boardId);

    setSelectedBoardIds(updatedBoardIds);

    if (isChecked) {
      if (columnsCache[boardId]) {
        const cachedColumns = columnsCache[boardId];
        setPeopleColumns((prev) => [...prev, ...cachedColumns.people]);
        setDateColumns((prev) => [...prev, ...cachedColumns.date]);
        setStatusColumns((prev) => [...prev, ...cachedColumns.status]);
        setTimeTrackingColumns((prev) => [
          ...prev,
          ...cachedColumns.timeTracking,
        ]);
      } else {
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

          setPeopleColumns((prev) => [...prev, ...newColumns.people]);
          setDateColumns((prev) => [...prev, ...newColumns.date]);
          setStatusColumns((prev) => [...prev, ...newColumns.status]);
          setTimeTrackingColumns((prev) => [
            ...prev,
            ...newColumns.timeTracking,
          ]);
          setColumnsCache((prev) => ({ ...prev, [boardId]: newColumns }));
        } catch (error) {
          console.error("Error fetching columns:", error);
        } finally {
          setLoadingColumns(false);
        }
      }
    } else {
      setPeopleColumns((prev) => prev.filter((col) => col.boardId !== boardId));
      setDateColumns((prev) => prev.filter((col) => col.boardId !== boardId));
      setStatusColumns((prev) => prev.filter((col) => col.boardId !== boardId));
      setTimeTrackingColumns((prev) =>
        prev.filter((col) => col.boardId !== boardId)
      );

      setSelectedColumns((prevSelectedColumns) =>
        prevSelectedColumns.filter((key) => !key.includes(`@${boardId}@`))
      );
    }
  };

  const handleColumnSelection = (columnId, boardId, type) => {
    const columnKey = `${type}@${boardId}@${columnId}`;

    // Remove any previously selected column of the same type for this board
    const updatedSelectedColumns = selectedColumns.filter(
      (key) => !key.startsWith(`${type}@${boardId}@`)
    );

    updatedSelectedColumns.push(columnKey); // Add the newly selected column
    setSelectedColumns(updatedSelectedColumns);
  };

  const renderSkeleton = (count) => (
    <div className="mb-3">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} height={25} width="100%" className="mb-2" />
      ))}
    </div>
  );

  const renderColSkeleton = (count) => (
    <div className="mb-3">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} height={60} width="100%" className="mb-2" />
      ))}
    </div>
  );

  const renderColumnsSection = (title, columns, type, icon, dropdownColor) => {
    if (loadingColumns) return renderColSkeleton(1);
    if (columns.length === 0) return null;

    const columnsByBoard = columns.reduce((acc, col) => {
      if (!acc[col.boardId]) acc[col.boardId] = [];
      acc[col.boardId].push(col);
      return acc;
    }, {});

    return (
      <ExpandCollapse
        title={
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "8px", color: dropdownColor }}>
              {icon}
            </span>
            {title}
          </span>
        }
        isExpanded
        className="my-4"
      >
        {Object.entries(columnsByBoard).map(([boardId, boardColumns]) => {
          const boardName =
            boards.find((b) => b.id === boardId)?.name || boardId;

          const selectedColumnKey = selectedColumns.find((key) =>
            key.startsWith(`${type}@${boardId}@`)
          );

          const selectedColumnId = selectedColumnKey
            ? selectedColumnKey.split("@")[2]
            : "";

          return (
            <div key={boardId} className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {boardName}
              </Text>
              <Dropdown
                options={boardColumns.map((col) => ({
                  value: col.id,
                  label: (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          marginRight: "8px",
                          color: dropdownColor,
                        }}
                      >
                        {icon}
                      </span>
                      {col.title}
                    </div>
                  ),
                }))}
                value={selectedColumnId}
                onChange={(e) => handleColumnSelection(e.value, boardId, type)}
                placeholder={`Select ${title}`}
                size={Dropdown.sizes.SMALL}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  backgroundColor: "#f9f9f9",
                  zIndex: 1000,
                }}
              />
            </div>
          );
        })}
      </ExpandCollapse>
    );
  };

  return (
    <div
      className={`sidebar p-6 bg-white border border-gray-200 rounded-md shadow-lg fixed top-0 right-0 h-full transition-all duration-300 ${
        isOpen ? "transform translate-x-0" : "transform translate-x-full"
      }`}
      style={{
        maxHeight: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        width: "320px",
        zIndex: "1000",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <Text className="text-xl font-bold text-gray-800">Customize</Text>
        <IoClose
          size={20}
          className="cursor-pointer text-black hover:text-gray-800 transition-all"
          onClick={onClose}
          title="Close"
        />
      </div>
      <hr />
      <ExpandCollapse
        title={
          <span style={{ display: "flex", alignItems: "center" }}>
            <MdDashboard style={{ marginRight: "8px", color: "#666" }} />
            Boards
          </span>
        }
        className="my-4"
        isExpanded
        size="small"
      >
        {loadingBoards
          ? renderSkeleton(5)
          : boards.map((board) => (
              <Checkbox
                key={board.id}
                label={board.name}
                checked={selectedBoardIds.includes(board.id)}
                onChange={(e) =>
                  handleBoardSelection(board.id, e.target.checked)
                }
                className="my-2"
              />
            ))}
      </ExpandCollapse>

      {selectedBoardIds.length > 0 && (
        <>
          {renderColumnsSection(
            "People Columns",
            peopleColumns,
            "people",
            <MdPeople />,
            "#4caf50"
          )}
          {renderColumnsSection(
            "Status Columns",
            statusColumns,
            "status",
            <MdCheckBox />,
            "#2196f3"
          )}
          {renderColumnsSection(
            "Date Columns",
            dateColumns,
            "date",
            <MdCalendarToday />,
            "#ff9800"
          )}
          {renderColumnsSection(
            "Time Tracking Columns",
            timeTrackingColumns,
            "timeTracking",
            <MdTimer />,
            "#9c27b0"
          )}
        </>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} kind={Button.kinds.PRIMARY}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSidebar;