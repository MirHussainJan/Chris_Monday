import React, { useEffect, useState } from "react";
import { FaUsers, FaClock, FaTasks } from "react-icons/fa";
import {
  Table as MondayTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Label,
  Text,
  Avatar,
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
  getProfilePhotosfromResponse,
} from "../../MondayAPI/monday2";

const Table = ({
  boardIds,
  selectedPeopleColumns,
  enrichedData,
  setEnrichedData,
}) => {
  const [data, setData] = useState([]);
  const [personData, setPersonData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [photos, setphotos] = useState({});
  const defaultColumns = [
    { id: "name", title: "Item Name" },
    { id: "group", title: "Group" },
    { id: "boardtitle", title: "Board" },
    { id: "people", title: "People" },
    { id: "date", title: "Date" },
    { id: "status", title: "Status" },
    { id: "priority", title: "Priority" },
    { id: "time_tracking", title: "Time Tracking" },
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
    const [type, boardId, columnId] = col.split("@");
    return { type, boardId, columnId, title: columnId };
  });

  const columns = [...defaultColumns];

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
                  boardname: board.name,
                }))
              );
            }
            return acc;
          }, []);
          setData(mergedData);

          if (selectedPeopleColumns.length > 0) {
            const columnBoardMapping = parsedColumns.map(
              ({ type, boardId, columnId }) => ({
                type,
                boardId,
                columnId,
              })
            );

            const personColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("person")
            );
            const statusColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("status")
            );
            const priorityColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("priority")
            );
            const dateColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("date")
            );
            const timeTrackingColumns = columnBoardMapping.filter(
              ({ columnId }) => columnId.includes("time_tracking")
            );

            const personValues = personColumns.length
              ? await getPersonValues(
                  personColumns.map((c) => c.columnId),
                  personColumns.map((c) => c.boardId)
                )
              : [];

            // Fetch profile photos
            const profilePhotosResponse = await getProfilePhotosfromResponse(
              personValues
            );

            const photos = profilePhotosResponse.reduce((acc, profile) => {
              acc[profile.id] = profile.photo_thumb_small;
              return acc;
            }, {});

            setphotos(photos);
            console.log("P", photos);

            const statusValues = statusColumns.length
              ? await getStatusValues(
                  statusColumns.map((c) => c.columnId),
                  statusColumns.map((c) => c.boardId)
                )
              : [];

            const priorityValues = priorityColumns.length
              ? await getStatusValues(
                  priorityColumns.map((c) => c.columnId),
                  priorityColumns.map((c) => c.boardId)
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
                    const key = `${columnType}@${board.id}@${col.id}`;
                    mapping[itemId][key] = {
                      value: col[valueKey] || col.text || "-",
                      columnType,
                    };
                  });
                });
              });
            };

            // Separate handling for person columns
            personColumns.forEach(({ columnId, boardId }) => {
              personValues.forEach((board) => {
                board.items_page.items.forEach((item) => {
                  const itemId = item.id;
                  if (!mapping[itemId]) mapping[itemId] = {};
                  item.column_values.forEach((col) => {
                    if (col.id === columnId) {
                      const personIds = col.persons_and_teams || [];
                      const photoUrls = personIds
                        .map((person) => photos[person.id] || null)
                        .filter((url) => url); // Filter out null values
                      const value = photoUrls.length > 0 ? photoUrls : ["-"];
                      mapping[itemId][`person@${boardId}@${columnId}`] = {
                        value: value.join(", "), // Join with commas if multiple
                        columnType: "person",
                      };
                    }
                  });
                });
              });
            });

            // Merge values for status, priority, date, and time tracking
            mergeValues(statusValues, "text", "status");
            mergeValues(priorityValues, "text", "priority");
            mergeValues(dateValues, "text", "date");
            mergeValues(timeTrackingValues, "duration", "time_tracking");

            console.log("map", mapping);
            setPersonData(mapping);

            const enrichedData = mergedData.map((item) => ({
              ...item,
              enrichedColumns: mapping[item.id] || {},
            }));

            setEnrichedData(enrichedData);
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

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  // Calculate summary data
  const calculateSummary = () => {
    const totalPeople = new Set();
    let totalTime = 0;
    const taskStatus = {};
    const taskPriority = {};
    const boardTitles = new Set();

    data.forEach((item) => {
      parsedColumns.forEach(({ columnId, boardId }) => {
        const value =
          item.boardId === boardId &&
          personData[item.id] &&
          personData[item.id][columnId]?.value;

        // Track unique people
        if (columnId.includes("person") && value) {
          totalPeople.add(value);
        }

        // Track task statuses
        if (columnId.includes("status") && value) {
          taskStatus[value] = taskStatus[value] ? taskStatus[value] + 1 : 1;
        }

        // Track task priorities
        if (columnId.includes("priority") && value) {
          taskPriority[value] = taskPriority[value]
            ? taskPriority[value] + 1
            : 1;
        }

        // Track time tracking totals
        if (columnId.includes("time_tracking") && value) {
          totalTime += value; // Assuming 'value' is in seconds
        }

        // Track unique board titles
        if (columnId.includes("boardtitle")) {
          boardTitles.add(item.boardtitle); // Adds board title for unique boards
        }
      });
    });

    return {
      totalPeople: totalPeople.size,
      totalTime: formatDuration(totalTime), // Format the time duration
      taskStatus,
      taskPriority, // Add taskPriority
      uniqueBoardTitles: boardTitles.size, // Count the number of unique board titles
    };
  };

  const summary = calculateSummary();

  const renderCell = (enrichedColumns, type) => {
    const columnKeys = Object.keys(enrichedColumns).filter((key) =>
      key.startsWith(`${type}@`)
    );

    // Ensure only one value is returned per column
    return columnKeys.length > 0 ? enrichedColumns[columnKeys[0]].value : "-";
  };

  return (
    <div className="flex flex-col items-center">
      <MondayTable
        columns={columns}
        className="w-full border border-gray-300 rounded-lg overflow-hidden"
      >
        <TableHeader className="border-b border-gray-300 border-[0.5px]">
          {columns.map((col) => (
            <TableHeaderCell
              key={col.id}
              title={col.title}
              className="text-center font-semibold text-sm"
            />
          ))}
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="bg-gray-50">
                  {defaultColumns.map((col) => (
                    <TableCell
                      key={col.id}
                      className="border-b border-r border-gray-300"
                    >
                      <SkeletonLoader />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((item, index) => {
                const enrichedColumns =
                  enrichedData.find((p) => p.id === item.id)?.enrichedColumns ||
                  {};
                return (
                  <TableRow
                    key={item.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <TableCell className="border-b border-r border-gray-300">
                      {item.name || "-"}
                    </TableCell>
                    <TableCell className="border-b border-r border-gray-300">
                      <Label text={item.group?.title || "-"}></Label>
                    </TableCell>
                    <TableCell className="border-b border-r border-gray-300">
                      {item.boardname || "-"} {/* Board Title */}
                    </TableCell>
                    <TableCell className="flex justify-center items-center border-b border-r border-gray-300">
                      <Avatar
                        src={renderCell(enrichedColumns, "person")}
                        type="img"
                        size="medium"
                      ></Avatar>
                    </TableCell>
                    <TableCell className="border-b border-r border-gray-300">
                      <Label
                        text={renderCell(enrichedColumns, "date", item.boardId)}
                      ></Label>
                    </TableCell>
                    <TableCell className="border-b border-r border-gray-300">
                      {renderCell(enrichedColumns, "status", item.boardId)}
                    </TableCell>
                    <TableCell className="border-b border-r border-gray-300">
                      {renderCell(enrichedColumns, "priority", item.boardId)}
                    </TableCell>
                    <TableCell className="border-b border-r border-gray-300">
                      {renderCell(
                        enrichedColumns,
                        "time_tracking",
                        item.boardId
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
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
          <p>
            <strong>Total People Involved:</strong> {summary.totalPeople}
          </p>
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
          <p>
            <strong>Priority Summary:</strong>
            <ul>
              {Object.entries(summary.taskPriority).map(([priority, count]) => (
                <li key={priority}>
                  {priority}: {count} tasks
                </li>
              ))}
            </ul>
          </p>
          <p>
            <strong>Total Time Tracked:</strong> {summary.totalTime}
          </p>
          <p>
            <strong>Total Unique Boards:</strong> {summary.uniqueBoardTitles}
          </p>
        </div>
      )}
    </div>
  );
};

export default Table;
