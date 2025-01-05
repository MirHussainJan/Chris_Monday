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
  const [data, setData] = useState([]);
  const [personData, setPersonData] = useState({});

  const defaultColumns = [
    { id: "name", title: "Item Name" },
    { id: "group", title: "Group" },
  ];

  const columns = [
    ...defaultColumns,
    ...selectedPeopleColumns.map((column) => ({
      id: column.id,
      title: column.title,
    })),
  ];

  useEffect(() => {
    console.log("Columns:", selectedPeopleColumns);
    console.log("Boards:", boardIds);

    const fetchData = async () => {
      if (boardIds.length > 0) {
        const boardData = await getBoardsData(boardIds);

        // Merge all board items into a single array
        const mergedData = boardData.reduce((acc, board) => {
          if (board.items_page) acc.push(...board.items_page.items);
          return acc;
        }, []);
        setData(mergedData);

        // Fetch person column values
        const personColumnIds = selectedPeopleColumns.map((col) => col);
        console.log("Person Values:", personColumnIds);
        if (personColumnIds.length > 0) {
          const personValues = await getPersonValues(personColumnIds, boardIds);
          console.log("Person Values:", personValues);

          const parsedData = {};

          // Iterate over the person values and structure them
          personValues.forEach((board) => {
            board.items_page.items.forEach((item) => {
              item.column_values.forEach((colValue, colIndex) => {
                const columnId = personColumnIds[colIndex];

                // Initialize the item if not yet present in the parsedData
                if (!parsedData[item.id]) {
                  parsedData[item.id] = {};
                }

                // Assign parsed data (either person info or text)
                if (colValue.persons_and_teams && colValue.persons_and_teams.length > 0) {
                  parsedData[item.id][columnId] =
                    colValue.persons_and_teams
                      .map((p) => `${p.kind}: ${p.id}`) // Store the kind and ID of the person/team
                      .join(", ");
                } else {
                  parsedData[item.id][columnId] = colValue.text || "-"; // Fallback to text or "-" if no person/team data
                }
              });
            });
          });

          setPersonData(parsedData);
        }
      }
    };

    fetchData();
  }, [boardIds, selectedPeopleColumns]); // Trigger fetch when boardIds or selectedPeopleColumns change

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
            <TableCell>{item.name || "-"}</TableCell>
            <TableCell>
              <Label
                text={item.group?.title || "-"}
                className={`color-${item.group?.color || "default"}`}
              />
            </TableCell>
            {selectedPeopleColumns.map((col) => (
              <TableCell key={col.id}>
                {personData[item.id]?.[col.id] || "-"}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </MondayTable>
  );
};

export default Table;