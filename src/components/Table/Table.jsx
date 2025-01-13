import React, { useEffect, useState } from "react";
import { FaUsers, FaClock, FaTasks } from 'react-icons/fa'; // Importing icons from react-icons
import {
  Table as MondayTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Label,
  Text
} from "monday-ui-react-core";
import SkeletonLoader from "./SkeletonLoader";
import "monday-ui-react-core/dist/main.css";
import "tailwindcss/tailwind.css";

import {
  getBoardsData,
  getPersonValues,
  getStatusValues,
  getDateValues,
  getTimeTrackingValues,
} from "../../MondayAPI/monday2";

const Table = ({ boardIds, selectedPeopleColumns, enrichedData, setEnrichedData }) => {
  const [data, setData] = useState([]);
  const [personData, setPersonData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false); // Track summary visibility

  const defaultColumns = [
    { id: "name", title: "Item Name" },
    { id: "group", title: "Group" },
  ];

  const statusColors = {
    "Not Started": "gray",
    "Working on it": "#fdab3d",
    Done: "#00c875",
    Stuck: "#df2f4a",
    "": "#007eb5",
    null: "#c4c4c4",
  };

  const priorityColors = {
    "High Priority": "red",
    "Medium Priority": "orange",
    "Low Priority": "green",
    Urgent: "purple",
    Normal: "blue",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return hours > 0
      ? `${hours}h ${minutes}m ${remainingSeconds}s`
      : `${minutes}m ${remainingSeconds}s`;
  };

  const parsedColumns = selectedPeopleColumns.map((col) => {
    const [columnId, boardId] = col.split("@");
    return { columnId, boardId, title: columnId };
  });

  const columns = [
    ...defaultColumns,
    ...parsedColumns.map((col) => ({
      id: col.columnId,
      title: col.columnId,
    })),
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (boardIds.length > 0) {
        setLoading(true);

        try {
          const boardData = await getBoardsData(boardIds);

          const mergedData = boardData.reduce((acc, board) => {
            if (board.items_page) {
              acc.push(
                ...board.items_page.items.map((item) => ({
                  ...item,
                  boardId: board.id,
                }))
              );
            }
            return acc;
          }, []);
          setData(mergedData);

          if (selectedPeopleColumns.length > 0) {
            const columnBoardMapping = parsedColumns.map(({ columnId, boardId }) => ({
              columnId,
              boardId,
            }));

            const personColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("person")
            );
            const statusColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("status")
            );
            const dateColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("date")
            );
            const timeTrackingColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("time_tracking")
            );

            const personValues = personColumns.length
              ? await getPersonValues(
                  personColumns.map((c) => c.columnId),
                  personColumns.map((c) => c.boardId)
                )
              : [];

            const statusValues = statusColumns.length
              ? await getStatusValues(
                  statusColumns.map((c) => c.columnId),
                  statusColumns.map((c) => c.boardId)
                )
              : [];

            const dateValues = dateColumns.length
              ? await getDateValues(
                  dateColumns.map((c) => c.columnId),
                  dateColumns.map((c) => c.boardId)
                )
              : [];

            const timeTrackingValues = timeTrackingColumns.length
              ? await getTimeTrackingValues(
                  timeTrackingColumns.map((c) => c.columnId),
                  timeTrackingColumns.map((c) => c.boardId)
                )
              : [];

            const mapping = {};
            const mergeValues = (values, valueKey = "text", columnType) => {
              values.forEach((board) => {
                board.items_page.items.forEach((item) => {
                  const itemId = item.id;
                  if (!mapping[itemId]) mapping[itemId] = {};
                  item.column_values.forEach((col) => {
                    mapping[itemId][col.id] = {
                      value: col[valueKey] || col.text || "-",
                      columnType, // Add column type (person, status, date, time_tracking)
                    };
                  });
                });
              });
            };

            mergeValues(personValues, "text", "person");
            mergeValues(statusValues, "text", "status");
            mergeValues(dateValues, "text", "date");
            mergeValues(timeTrackingValues, "duration", "time_tracking");

            setPersonData(mapping);

            // Set the enriched data with column type information
            const enrichedData = mergedData.map((item) => ({
              ...item,
              enrichedColumns: mapping[item.id] || {},
            }));

            setEnrichedData(enrichedData);
            console.log("Enriched Data:", enrichedData); // Log enriched data
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [boardIds, selectedPeopleColumns]);

  // Function to toggle the visibility of the summary
  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  // Calculate summary data
  const calculateSummary = () => {
    const totalPeople = new Set();
    let totalTime = 0;
    const taskStatus = {};

    data.forEach((item) => {
      parsedColumns.forEach(({ columnId, boardId }) => {
        const value =
          item.boardId === boardId &&
          personData[item.id] &&
          personData[item.id][columnId]?.value;

        if (columnId.includes("person") && value) {
          totalPeople.add(value);
        }

        if (columnId.includes("status") && value) {
          taskStatus[value] = taskStatus[value] ? taskStatus[value] + 1 : 1;
        }

        if (columnId.includes("time_tracking") && value) {
          totalTime += value; // Assuming 'value' is in seconds
        }
      });
    });

    return {
      totalPeople: totalPeople.size,
      taskStatus,
      totalTime: formatDuration(totalTime),
    };
  };

  const summary = calculateSummary();

  return (
    <div className="flex flex-col items-center">
      <MondayTable
        columns={columns}
        className="border border-gray-300 rounded-lg overflow-hidden w-full"
      >
        <TableHeader className="text-center">
          {columns.map((col) => (
            <TableHeaderCell
              key={col.id}
              title={col.title}
              className="text-center font-semibold text-sm"
            />
          ))}
        </TableHeader>
        <TableBody className="text-center">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="bg-gray-50">
                  {columns.map((col) => (
                    <TableCell
                      key={`${index}-${col.id}`}
                      className="px-4 py-2 text-center"
                    >
                      <SkeletonLoader />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                >
                  <TableCell className="px-4 py-2 border-r text-center">
                    {item.name || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-2 border-r text-center">
                    <Label text={item.group?.title || "-"} color="primary" />
                  </TableCell>

                  {parsedColumns.map(({ columnId, boardId }) => {
                    const enrichedValue =
                      item.boardId === boardId &&
                      personData[item.id] &&
                      personData[item.id][columnId];

                    const displayValue = enrichedValue
                      ? columnId.includes("date")
                        ? formatDate(enrichedValue.value)
                        : columnId.includes("time_tracking")
                        ? formatDuration(enrichedValue.value)
                        : enrichedValue.value
                      : "-";

                    const bgColor =
                      columnId.includes("status") && statusColors[displayValue]
                        ? statusColors[displayValue]
                        : columnId.includes("priority") &&
                          priorityColors[displayValue]
                        ? priorityColors[displayValue]
                        : "";

                    return (
                      <TableCell
                        key={`${item.id}-${columnId}`}
                        className="px-4 py-2 border-r text-center"
                        style={{ backgroundColor: bgColor }}
                      >
                        {loading ? (
                          <SkeletonLoader />
                        ) : columnId.includes("date") || columnId === "group" ? (
                          <Label text={displayValue} color="primary" />
                        ) : (
                          <Text>{displayValue}</Text>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
        </TableBody>
      </MondayTable>

      {/* Summary Toggle Button */}
      <button
        onClick={toggleSummary}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
      >
        {showSummary ? "Hide Summary" : "Show Summary"}
      </button>

      {/* Show summary if visible */}
      {showSummary && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-semibold">Summary</h4>
          <p><strong>Total People Involved:</strong> {summary.totalPeople}</p>
          <p>
            <strong>Status Summary:</strong>
            <ul>
              {Object.entries(summary.taskStatus).map(([status, count]) => (
                <li key={status}>
                  {status}: {count} tasks
                </li>
              ))}
            </ul>
          </p>
          <p><strong>Total Time Tracked:</strong> {summary.totalTime}</p>
        </div>
      )}
    </div>
  );
};

export default Table;