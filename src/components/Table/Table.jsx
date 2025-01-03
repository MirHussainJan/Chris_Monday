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
    const fetchData = async () => {
      if (boardIds.length > 0) {
        const boardData = await getBoardsData(boardIds);
        const mergedData = boardData.reduce((acc, board) => {
          if (board.items_page) acc.push(...board.items_page.items);
          return acc;
        }, []);
        setData(mergedData);

        // Fetch person data for selected people columns
        const personColumnIds = selectedPeopleColumns.map((col) => col.id);
        if (personColumnIds.length > 0) {
          const personValues = await getPersonValues(personColumnIds, boardIds);
          const parsedData = {};
          personValues.forEach((board) => {
            board.items_page.items.forEach((item) => {
              item.column_values.forEach((colValue, colIndex) => {
                const columnId = personColumnIds[colIndex];
                if (!parsedData[columnId]) parsedData[columnId] = [];
                parsedData[columnId].push(colValue.text || "-");
              });
            });
          });
          setPersonData(parsedData);
        }
      }
    };

    fetchData();
  }, [boardIds, selectedPeopleColumns]);

  return (
    <MondayTable columns={columns} emptyState={<TableEmptyState />} errorState={<TableErrorState />}>
      <TableHeader>
        {columns.map((col) => (
          <TableHeaderCell key={col.id} title={col.title} className="table-header" />
        ))}
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={item.id} className={index % 2 === 0 ? "even-row" : "odd-row"}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <Label text={item.group.title} className={`color-${item.group.color}`} />
            </TableCell>
            {selectedPeopleColumns.map((col) => (
              <TableCell key={col.id}>{personData[col.id]?.[index] || "-"}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </MondayTable>
  );
};

export default Table;
