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

const DateView = ({ data, secondaryView }) => {
  const [categorizedData, setCategorizedData] = useState({
    past: {},
    current: {},
    future: {},
  });

  useEffect(() => {
    const currentDate = new Date();

    const categorized = {
      past: {},
      current: {},
      future: {},
    };

    data.forEach((task) => {
      const dateKey = Object.keys(task.enrichedColumns).find((key) =>
        key.startsWith("date@")
      );
      const itemDate = dateKey ? new Date(task.enrichedColumns[dateKey]) : null;

      let category = null;
      if (itemDate) {
        if (itemDate.toDateString() === currentDate.toDateString()) {
          category = "current";
        } else if (itemDate < currentDate) {
          category = "past";
        } else {
          category = "future";
        }
      }

      if (category) {
        if (secondaryView === "board") {
          const boardId = task.boardId;
          if (!categorized[category][boardId]) {
            categorized[category][boardId] = { tasks: [] };
          }
          categorized[category][boardId].tasks.push(task);
        } else if (secondaryView === "person") {
          const personKey = Object.keys(task.enrichedColumns).find((key) =>
            key.startsWith("person@")
          );
          const persons = personKey ? task.enrichedColumns[personKey].value : [];

          if (persons.length > 0) {
            persons.forEach((person) => {
              if (!categorized[category][person.id]) {
                categorized[category][person.id] = {
                  personDetails: person,
                  tasks: [],
                };
              }
              categorized[category][person.id].tasks.push(task);
            });
          } else {
            if (!categorized[category]["unassigned"]) {
              categorized[category]["unassigned"] = { tasks: [] };
            }
            categorized[category]["unassigned"].tasks.push(task);
          }
        } else {
          if (!categorized[category]["allTasks"]) {
            categorized[category]["allTasks"] = { tasks: [] };
          }
          categorized[category]["allTasks"].tasks.push(task);
        }
      }
    });

    setCategorizedData(categorized);
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
                {task.group?.title || "No Group Title"}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300">
                {renderDateCell(task.enrichedColumns || {})}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300">
                {renderPersonCell(
                  task.enrichedColumns?.[
                    Object.keys(task.enrichedColumns).find((key) =>
                      key.startsWith("person@")
                    )
                  ]?.value
                )}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300 padding-status">
                {renderStatusCell(task.enrichedColumns || {})}
              </TableCell>
              <TableCell className="flex justify-center border border-gray-300">
                {
                  task.enrichedColumns?.[
                    Object.keys(task.enrichedColumns).find((key) =>
                      key.startsWith("time_tracking@")
                    )
                  ] || "-"
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="date-view">
      {["past", "current", "future"].map((category) => (
        <div key={category} className="date-section mb-4">
          <ExpandCollapse
            title={`${category.charAt(0).toUpperCase() + category.slice(1)} (${
              Object.values(categorizedData[category]).reduce(
                (acc, group) => acc + group.tasks.length,
                0
              )
            } tasks)`}
            // hideBorder
            isDefaultOpen={true}
          >
            {Object.keys(categorizedData[category]).map((groupKey) => {
              const tasks = categorizedData[category][groupKey].tasks;
              const title =
                secondaryView === "board"
                  ? `Board ${groupKey}`
                  : secondaryView === "person"
                  ? categorizedData[category][groupKey].personDetails?.name ||
                    "Unassigned"
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
      ))}
    </div>
  );
};

export default DateView;