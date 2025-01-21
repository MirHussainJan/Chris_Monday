import React, { useState, useEffect } from "react";
import {
  ExpandCollapse,
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
    console.log("Grouped Data:", grouped); // Debugging grouped data
  }, [data]);

  // Generate dynamic columns for each board based on `enrichedColumns`
  const generateColumns = (boardData) => {
    const columnTypes = {};

    // Gather unique column types from the enrichedColumns
    boardData.forEach((task) => {
      if (task.enrichedColumns) {
        Object.keys(task.enrichedColumns).forEach((key) => {
          const columnId = key.split('@')[0]; // Extract the type like 'status', 'person', 'date'
          columnTypes[columnId] = columnId;
        });
      }
    });

    return [
      { id: "taskName", title: "Task Name" },
      { id: "group", title: "Group" },
      ...Object.keys(columnTypes).map((type) => ({
        id: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
      })),
    ];
  };

  // Render the 'person@' column as an AvatarGroup
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
      {Object.keys(groupedByBoard).map((boardId) => {
        const boardData = groupedByBoard[boardId];
        const columns = generateColumns(boardData);
        const boardName = boardData[0]?.boardname || `Board ${boardId}`; // Get board name or fallback to board ID

        return (
          <div key={boardId} className="board-section">
            <ExpandCollapse
              title={`${boardName} (${boardData.length} tasks)`}
              hideBorder
              isDefaultOpen={true}
            >
              <Table columns={columns}>
                <TableHeader className="zindex">
                  {columns.map((col) => (
                    <TableHeaderCell key={col.id} title={col.title} />
                  ))}
                </TableHeader>
                <TableBody>
                  {boardData.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name || "No Task Name"}</TableCell>
                      <TableCell>{task.group?.title || "No Group Title"}</TableCell>

                      {columns.slice(2).map((col) => {
                        const enrichedValue =
                          task.enrichedColumns?.[col.id + "@" + task.boardId]?.value;

                        // Render the 'person@' column properly
                        if (col.id === "person") {
                          return (
                            <TableCell key={col.id}>
                              {renderPersonCell(enrichedValue)}
                            </TableCell>
                          );
                        }

                        // Handle other enriched column types
                        return (
                          <TableCell key={col.id}>
                            {enrichedValue || "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ExpandCollapse>
          </div>
        );
      })}
    </div>
  );
};

export default BoardView;
