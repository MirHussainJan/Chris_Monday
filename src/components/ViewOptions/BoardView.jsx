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
  Label,
} from "monday-ui-react-core";
import { FaUsers } from "react-icons/fa";

const BoardView = ({ data, secondaryView }) => {
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    const grouped = {};
    const currentDate = new Date();

    data.forEach((task) => {
      const boardId = task.boardId;
      if (!grouped[boardId]) {
        grouped[boardId] = {};
      }

      const dateKey = Object.keys(task.enrichedColumns).find((key) =>
        key.startsWith("date@")
      );
      const taskDate = dateKey ? new Date(task.enrichedColumns[dateKey]) : null;

      if (secondaryView === "date") {
        let category = "Please select the date first";

        if (taskDate) {
          if (taskDate.toDateString() === currentDate.toDateString()) {
            category = "current";
          } else if (taskDate < currentDate) {
            category = "past";
          } else {
            category = "future";
          }
        }

        if (!grouped[boardId][category]) {
          grouped[boardId][category] = { tasks: [] };
        }
        grouped[boardId][category].tasks.push(task);
      } else if (secondaryView === "person") {
        const personKey = Object.keys(task.enrichedColumns).find((key) =>
          key.startsWith("person@")
        );
        const persons = personKey ? task.enrichedColumns[personKey].value : [];

        if (persons.length > 0) {
          persons.forEach((person) => {
            if (!grouped[boardId][person.id]) {
              grouped[boardId][person.id] = {
                personDetails: person,
                tasks: [],
              };
            }
            grouped[boardId][person.id].tasks.push(task);
          });
        } else {
          if (!grouped[boardId]["unassigned"]) {
            grouped[boardId]["unassigned"] = { tasks: [] };
          }
          grouped[boardId]["unassigned"].tasks.push(task);
        }
      } else {
        if (!grouped[boardId]["allTasks"]) {
          grouped[boardId]["allTasks"] = { tasks: [] };
        }
        grouped[boardId]["allTasks"].tasks.push(task);
      }
    });

    setGroupedData(grouped);
  }, [data, secondaryView]);

  const generateColumns = () => [
    { id: "taskName", title: "Task Name" },
    { id: "group", title: "Group" },
    { id: "date", title: "Date" },
    { id: "person", title: "Person" },
    { id: "status", title: "Status" },
    { id: "time_tracking", title: "Time Tracking" },
  ];

  const renderPersonCell = (persons) => {
    if (!Array.isArray(persons) || persons.length === 0) {
      return "-";
    }
    return (
      <AvatarGroup max={3} size="medium">
        {persons.map((person) => (
          <Avatar
            key={person.id}
            src={person.photo}
            ariaLabel={person.name || "Unknown"}
            type="img"
            fallbackIcon={<FaUsers />}
          />
        ))}
      </AvatarGroup>
    );
  };

  const renderStatusCell = (enrichedColumns) => {
    const statusKey = Object.keys(enrichedColumns).find((key) =>
      key.startsWith("status@")
    );
    if (statusKey) {
      const { text, color } = enrichedColumns[statusKey] || {};
      return (
        <div
          className="w-full h-full flex justify-center items-center padding-status"
          style={{
            backgroundColor: color || "#000000",
            color: "#ffffff",
          }}
        >
          {text || "-"}
        </div>
      );
    }
    return "-";
  };

  const renderDateCell = (enrichedColumns) => {
    const dateKey = Object.keys(enrichedColumns).find((key) =>
      key.startsWith("date@")
    );
    const dateValue = dateKey ? enrichedColumns[dateKey] : null;
  
    return dateValue ? (
      <Label text={new Date(dateValue).toLocaleDateString()} type="primary" />
    ) : (
      "-"
    );
  };

  const renderTable = (tasks) => {
    const columns = generateColumns();

    return (
      <Table columns={columns}>
        <TableHeader>
          {columns.map((col) => (
            <TableHeaderCell
              key={col.id}
              title={col.title}
              className="flex justify-center border border-gray-300"
            />
          ))}
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="flex justify-center border border-gray-300">
                {task.name || "No Task Name"}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300">
                {<Label text={task.group?.title}/> || "No Group Title"}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300">
                {renderDateCell(task.enrichedColumns || {})}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300">
                {renderPersonCell(
                  task.enrichedColumns?.[Object.keys(task.enrichedColumns).find((key) =>
                    key.startsWith("person@")
                  )]?.value
                )}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300 padding-status">
                {renderStatusCell(task.enrichedColumns || {})}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300">
                {
                  task.enrichedColumns?.[Object.keys(task.enrichedColumns).find((key) =>
                    key.startsWith("time_tracking@")
                  )] || "-"
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="board-view">
      {Object.keys(groupedData).map((boardId) => {
        const boardTasks = groupedData[boardId];
        const boardName =
          Object.values(boardTasks)[0]?.tasks?.[0]?.boardname ||
          `Board ${boardId}`;

        return (
          <div key={boardId} className="board-section mb-4">
            <ExpandCollapse
              title={`${boardName} (${Object.values(boardTasks).reduce(
                (acc, item) => acc + item.tasks.length,
                0
              )} tasks)`}
              isDefaultOpen={true}
            >
              {Object.keys(boardTasks).map((groupKey) => {
                const tasks = boardTasks[groupKey].tasks;
                const title =
                  secondaryView === "date"
                    ? groupKey.charAt(0).toUpperCase() + groupKey.slice(1) // "Past", "Current", "Future"
                    : secondaryView === "person"
                    ? boardTasks[groupKey].personDetails?.name
                    : null;

                return secondaryView ? (
                  <ExpandCollapse key={groupKey} title={title} hideBorder isDefaultOpen={true}>
                    {renderTable(tasks)}
                  </ExpandCollapse>
                ) : (
                  renderTable(tasks)
                );
              })}
            </ExpandCollapse>
          </div>
        );
      })}
    </div>
  );
};

export default BoardView;