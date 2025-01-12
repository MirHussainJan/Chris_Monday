import React, { useEffect, useState } from "react";
import {
  Table as MondayTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Label,
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

const Table = ({ boardIds, selectedPeopleColumns, view }) => {
  const [data, setData] = useState([]);
  const [personData, setPersonData] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedBoards, setExpandedBoards] = useState({});

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
        console.log()
        try {
          const boardData = await getBoardsData(boardIds);

          const mergedData = boardData.reduce((acc, board) => {
            if (board.items_page) {
              acc.push(
                ...board.items_page.items.map((item) => ({
                  ...item,
                  boardId: board.id,
                  boardName: board.name,
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
            const mergeValues = (values, valueKey = "text") => {
              values.forEach((board) => {
                board.items_page.items.forEach((item) => {
                  const itemId = item.id;
                  if (!mapping[itemId]) mapping[itemId] = {};
                  item.column_values.forEach((col) => {
                    mapping[itemId][col.id] =
                      col[valueKey] || col.text || "-";
                  });
                });
              });
            };

            mergeValues(personValues);
            mergeValues(statusValues);
            mergeValues(dateValues);
            mergeValues(timeTrackingValues, "duration");

            setPersonData(mapping);
          }

          // Initialize board expand/collapse state
          const initialExpandedState = boardIds.reduce(
            (acc, boardId) => ({ ...acc, [boardId]: true }),
            {}
          );
          setExpandedBoards(initialExpandedState);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [boardIds, selectedPeopleColumns]);

  const toggleBoardExpansion = (boardId) => {
    setExpandedBoards((prevState) => ({
      ...prevState,
      [boardId]: !prevState[boardId],
    }));
  };

  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.boardId]) {
      acc[item.boardId] = {
        boardName: item.boardName,
        items: [],
      };
    }
    acc[item.boardId].items.push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col items-center w-full">
      {loading && (
        <div className="text-center">
          <SkeletonLoader />
        </div>
      )}
      {!loading &&
        Object.entries(groupedData).map(([boardId, boardData]) => (
          <div
            key={boardId}
            className="mb-4 border border-gray-300 rounded-lg w-full"
          >
            <div
              className="bg-gray-200 p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleBoardExpansion(boardId)}
            >
              <h2 className="text-lg font-semibold">
                {boardData.boardName || `Board ${boardId}`}
              </h2>
              <span>
                {expandedBoards[boardId] ? "▼ Collapse" : "▶ Expand"}
              </span>
            </div>

            {expandedBoards[boardId] && (
              <MondayTable
                columns={columns}
                className="border-t border-gray-300 overflow-hidden w-full"
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
                  {boardData.items.map((item, index) => (
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
                        <Label
                          text={item.group?.title || "-"}
                          color="primary"
                        />
                      </TableCell>
                      {parsedColumns.map(({ columnId }) => {
                        const value =
                          personData[item.id] &&
                          personData[item.id][columnId];

                        return (
                          <TableCell
                            key={`${item.id}-${columnId}`}
                            className="px-4 py-2 border-r text-center"
                          >
                            {value || "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </MondayTable>
            )}
          </div>
        ))}
    </div>
  );
};

export default Table;
