import {
  Label,
  Table as MondayTable,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "monday-ui-react-core";
import TableEmptyState from "./TableEmptyState";
import TableErrorState from "./TableErrorState";
import { useEffect, useState } from "react";
import {
  getBoardsData,
  getPersonValues,
  getStatusValues,
  getDateValues,
  getTimeTrackingValues, // Import the time tracking function
} from "../../MondayAPI/monday2";

const Table = ({ boardIds, selectedPeopleColumns }) => {
  const [data, setData] = useState([]); // Holds board and item data
  const [personData, setPersonData] = useState({}); // { itemId: { columnId: value } }

  const defaultColumns = [
    { id: "name", title: "Item Name" },
    { id: "group", title: "Group" },
  ];

  // Utility function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format as desired
  };

  // Utility function to format time tracking duration
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";
  
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    if (hours > 0) {
      // For durations greater than or equal to an hour
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
  
    // For durations less than an hour
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Parse column data for display
  const parsedColumns = selectedPeopleColumns.map((col) => {
    const [columnId, boardId] = col.split("@");
    return { columnId, boardId, title: columnId }; // title can be adjusted if needed
  });

  const columns = [
    ...defaultColumns,
    ...parsedColumns.map((col) => ({
      id: col.columnId,
      title: `Column: ${col.columnId}`, // Correcting string interpolation here
    })),
  ];

  useEffect(() => {
    const fetchData = async () => {
      console.log("From Table:", columns);
      if (boardIds.length > 0) {
        try {
          const boardData = await getBoardsData(boardIds);

          // Merge items from all boards
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

            // Fetch person, status, date, and time tracking values
            const personValues = await getPersonValues(
              columnBoardMapping.map((c) => c.columnId),
              columnBoardMapping.map((c) => c.boardId)
            );

            const statusColumns = parsedColumns.filter((col) => col.columnId.includes("status"));
            const statusColumnIds = statusColumns.map((col) => col.columnId);
            const statusValues = await getStatusValues(
              statusColumnIds,
              columnBoardMapping.map((c) => c.boardId)
            );

            const dateColumns = parsedColumns.filter((col) => col.columnId.includes("date"));
            const dateColumnIds = dateColumns.map((col) => col.columnId);
            const dateValues = await getDateValues(
              dateColumnIds,
              columnBoardMapping.map((c) => c.boardId)
            );

            const timeTrackingColumns = parsedColumns.filter((col) =>
              col.columnId.includes("time_tracking")
            );
            const timeTrackingColumnIds = timeTrackingColumns.map((col) => col.columnId);
            const timeTrackingValues = await getTimeTrackingValues(
              timeTrackingColumnIds,
              columnBoardMapping.map((c) => c.boardId)
            );

            // Combine data from all values
            const mapping = {};
            const mergeValues = (values, valueKey = "text") => {
              values.forEach((board) => {
                board.items_page.items.forEach((item) => {
                  const itemId = item.id;
                  if (!mapping[itemId]) mapping[itemId] = {};
                  item.column_values.forEach((col) => {
                    mapping[itemId][col.id] = col[valueKey] || "-";
                  });
                });
              });
            };

            mergeValues(personValues);
            mergeValues(statusValues);
            mergeValues(dateValues);
            mergeValues(timeTrackingValues, "duration"); // Use "duration" key for time tracking

            setPersonData(mapping);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [boardIds, selectedPeopleColumns]);

  return (
    <MondayTable
      columns={columns}
      emptyState={<TableEmptyState />}
      errorState={<TableErrorState />}
    >
      <TableHeader>
        {columns.map((col) => (
          <TableHeaderCell key={col.id} title={col.title} className="table-header" />
        ))}
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow
            key={item.id}
            className={index % 2 === 0 ? "even-row" : "odd-row"}
          >
            {/* Default columns */}
            <TableCell>{item.name || "-"}</TableCell>
            <TableCell>
              <Label
                text={item.group?.title || "-"}
                className={`color-${item.group?.color || "default"}`} // Corrected string interpolation here
              />
            </TableCell>

            {/* Dynamic columns */}
            {parsedColumns.map(({ columnId, boardId }) => {
              const value =
                item.boardId === boardId &&
                personData[item.id] &&
                personData[item.id][columnId];

              const displayValue = columnId.includes("date")
                ? formatDate(value)
                : columnId.includes("time_tracking")
                ? formatDuration(value)
                : value;

              return (
                <TableCell key={`${item.id}-${columnId}`}>
                  {displayValue
                    ? displayValue.split(", ").map((val, idx) => (
                        <div key={idx}>{val}</div> // Display each value on a new line
                      ))
                    : "-"}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </MondayTable>
  );
};

export default Table;