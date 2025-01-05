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
import { getBoardsData, getPersonValues } from "../../MondayAPI/monday2";

const Table = ({ boardIds, selectedPeopleColumns }) => {
  const [data, setData] = useState([]); // Holds board and item data
  const [personData, setPersonData] = useState({}); // { itemId: { columnId: value } }

  const defaultColumns = [
    { id: "name", title: "Item Name" },
    { id: "group", title: "Group" },
  ];

  // Create the columns based on selected columns
  const columns = [
    ...defaultColumns,
    ...selectedPeopleColumns.map((column) => ({
      id: column, // e.g., 'person@boardId'
      title: column,
    })),
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (boardIds.length > 0) {
        // Fetch board data
        const boardData = await getBoardsData(boardIds);

        // Extract and merge items from all boards
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
          // Parse selectedPeopleColumns to extract column and board IDs
          const columnBoardMapping = selectedPeopleColumns.map((col) => {
            const [columnId, boardId] = col.split("@");
            return { columnId, boardId };
          });

          // Fetch person values
          const personValues = await getPersonValues(
            columnBoardMapping.map((c) => c.columnId),
            columnBoardMapping.map((c) => c.boardId)
          );

          // Create a mapping of itemId to columnId and values
          const mapping = {};
          personValues.forEach((board) => {
            board.items_page.items.forEach((item) => {
              const itemId = item.id;
              if (!mapping[itemId]) mapping[itemId] = {};
              item.column_values.forEach((col) => {
                mapping[itemId][col.id] = col.text || "-";
              });
            });
          });

          setPersonData(mapping);
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
          <TableHeaderCell
            key={col.id}
            title={col.title}
            className="table-header"
          />
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
                className={`color-${item.group?.color || "default"}`}
              />
            </TableCell>

            {/* Dynamic people columns */}
            {selectedPeopleColumns.map((col) => {
              const [columnId, columnBoardId] = col.split("@");

              // Only show value if boardId matches and item exists in personData
              const value =
                item.boardId === columnBoardId &&
                personData[item.id] &&
                personData[item.id][columnId];

              return (
                <TableCell key={col}>
                  {value
                    ? value.split(", ").map((val, idx) => (
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
