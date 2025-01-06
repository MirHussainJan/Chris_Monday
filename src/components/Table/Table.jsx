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
  getTimeTrackingValues,
} from "../../MondayAPI/monday2";

const Table = ({ boardIds, selectedPeopleColumns }) => {
  const [data, setData] = useState([]); // Holds board and item data
  const [personData, setPersonData] = useState({}); // { itemId: { columnId: value } }

  const defaultColumns = [
    { id: "name", title: "Item Name" },
    { id: "group", title: "Group" },
  ];

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
      title: `Column: ${col.columnId}`,
    })),
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (boardIds.length > 0) {
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

            // Fetch only for selected columns
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

            // Combine data from selected columns
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
          <TableRow key={item.id} className={index % 2 === 0 ? "even-row" : "odd-row"}>
            {/* Default columns */}
            <TableCell>{item.name || "-"}</TableCell>
            <TableCell>
              <Label
                text={item.group?.title || "-"}
                className={`color-${item.group?.color || "default"}`}
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
                  {displayValue || "-"}
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