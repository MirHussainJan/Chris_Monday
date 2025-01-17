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
  AvatarGroup,
  Avatar,
} from "monday-ui-react-core";
import { FaUsers } from "react-icons/fa"; // Fallback icon

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

    // Gather unique column types from the enrichedColumns
    boardData.forEach((task) => {
      Object.keys(task.enrichedColumns).forEach((key) => {
        const columnId = key.split('@')[0]; // Extract the type like 'status', 'person', 'date'
        columnTypes[columnId] = columnId;
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

  // Render the cell for 'person@' type columns
  const renderPersonCell = (persons) => {
    const validPersons = Array.isArray(persons) ? persons : [];
    return (
      <AvatarGroup max={3} size="medium">
        {validPersons.length > 0 ? (
          validPersons.map((person) => (
            <Avatar
              key={person.id}
              src={person.photo}
              ariaLabel={person.name || "Unknown"}
              type="img"
              fallbackIcon={<FaUsers />}
            />
          ))
        ) : (
          <Avatar fallbackIcon={<FaUsers />} ariaLabel="No person assigned" />
        )}
      </AvatarGroup>
    );
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
                        const enrichedValue = task.enrichedColumns[col.id + "@" + task.boardId];

                        // Render the 'person@' column properly
                        if (col.id === "person") {
                          return (
                            <TableCell key={col.id}>
                              {renderPersonCell(enrichedValue?.value)}
                            </TableCell>
                          );
                        }

                        if (col.id === "status") {
                          return (
                            <TableCell key={col.id}>{enrichedValue || "-"}</TableCell>
                          );
                        }

                        if (col.id === "date") {
                          return (
                            <TableCell key={col.id}>
                              {enrichedValue || "-"}
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={col.id}>{enrichedValue || "-"}</TableCell>
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