import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Label,
} from "monday-ui-react-core";

const BoardView = ({ data }) => {
  const [groupedByBoard, setGroupedByBoard] = useState({});
  const [expandedBoards, setExpandedBoards] = useState([]);

  // Group tasks by boardId whenever `data` changes
  useEffect(() => {
    const grouped = data.reduce((acc, task) => {
      if (!acc[task.boardId]) {
        acc[task.boardId] = [];
      }
      acc[task.boardId].push(task);
      return acc;
    }, {});
    setGroupedByBoard(grouped);
  }, [data]);

  const toggleBoard = (boardId) => {
    setExpandedBoards((prev) =>
      prev.includes(boardId)
        ? prev.filter((board) => board !== boardId)
        : [...prev, boardId]
    );
  };

  // Helper function to create columns based on enriched data
  const generateColumns = (boardData) => {
    const columnTypes = {};

    // Gather unique column types
    boardData.forEach((task) => {
      Object.values(task.enrichedColumns).forEach((col) => {
        columnTypes[col.columnType] = col.columnType;
      });
    });

    const columns = [
      { id: "taskName", title: "Task Name" },
      { id: "group", title: "Group" },
      ...Object.keys(columnTypes).map((type) => ({
        id: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
      })),
    ];

    return columns;
  };

  return (
    <div className="board-view">
      <Accordion>
        {Object.keys(groupedByBoard).map((boardId) => {
          const boardData = groupedByBoard[boardId];
          const columns = generateColumns(boardData);
          const recordCount = boardData.length;

          return (
            <AccordionItem
              key={boardId}
              title={`Board ID: ${boardId} (${recordCount} records)`}
              isOpen={expandedBoards.includes(boardId)}
              onClick={() => toggleBoard(boardId)}
            >
              <Table columns={columns}>
                <TableHeader>
                  {columns.map((col) => (
                    <TableHeaderCell key={col.id} title={col.title} />
                  ))}
                </TableHeader>
                <TableBody>
                  {boardData.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.group?.title || "-"}</TableCell>

                      {columns.slice(2).map((col) => {
                        const enrichedValue = task.enrichedColumns[col.id];
                        const displayValue = enrichedValue
                          ? enrichedValue.value
                          : "-";

                        return (
                          <TableCell key={col.id}>{displayValue}</TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default BoardView;
