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
  Text,
} from "monday-ui-react-core";
import { FaUsers } from "react-icons/fa";

const DateView = ({ data, secondaryView }) => {
  const [categorizedData, setCategorizedData] = useState({
    past: {},
    current: {},
    future: {},
  });

  const [sorting, setSorting] = useState({});

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

      let category = "future";
      if (itemDate) {
        if (itemDate.toDateString() === currentDate.toDateString()) {
          category = "current";
        } else if (itemDate < currentDate) {
          category = "past";
        }
      }

      if (secondaryView === "board") {
        const boardId = task.boardId;
        const boardName = task.boardname || "Unknown Board";

        if (!categorized[category][boardId]) {
          categorized[category][boardId] = { title: boardName, tasks: [] };
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
                title: person.name,
                tasks: [],
              };
            }
            categorized[category][person.id].tasks.push(task);
          });
        } else {
          if (!categorized[category]["unassigned"]) {
            categorized[category]["unassigned"] = { title: "Unassigned", tasks: [] };
          }
          categorized[category]["unassigned"].tasks.push(task);
        }
      } else {
        if (!categorized[category]["allTasks"]) {
          categorized[category]["allTasks"] = { tasks: [] };
        }
        categorized[category]["allTasks"].tasks.push(task);
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

  const onSort = (columnId, sortState) => {
    setSorting({
      [columnId]: sortState,
    });
  };

  const sortTasks = (tasks) => {
    if (!Array.isArray(tasks)) return [];

    const sortedColumn = Object.keys(sorting)[0];
    const sortOrder = sorting[sortedColumn];

    if (!sortedColumn || !sortOrder) return tasks;

    return [...tasks].sort((a, b) => {
      let valA, valB;

      switch (sortedColumn) {
        case "taskName":
          valA = a.name || "";
          valB = b.name || "";
          break;
        case "group":
          valA = a.group?.title || "";
          valB = b.group?.title || "";
          break;
        case "date":
          valA = new Date(
            a.enrichedColumns?.[Object.keys(a.enrichedColumns).find((key) => key.startsWith("date@"))] || 0
          ).getTime();
          valB = new Date(
            b.enrichedColumns?.[Object.keys(b.enrichedColumns).find((key) => key.startsWith("date@"))] || 0
          ).getTime();
          break;
        case "status":
          valA = a.enrichedColumns?.[Object.keys(a.enrichedColumns).find((key) => key.startsWith("status@"))]?.text || "";
          valB = b.enrichedColumns?.[Object.keys(b.enrichedColumns).find((key) => key.startsWith("status@"))]?.text || "";
          break;
        case "time_tracking":
          valA = parseFloat(
            a.enrichedColumns?.[Object.keys(a.enrichedColumns).find((key) => key.startsWith("time_tracking@"))] || "0"
          );
          valB = parseFloat(
            b.enrichedColumns?.[Object.keys(b.enrichedColumns).find((key) => key.startsWith("time_tracking@"))] || "0"
          );
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      if (sortOrder === "desc") return valA < valB ? 1 : -1;
      return 0;
    });
  };

  const renderTable = (tasks) => {
    const columns = generateColumns();
    const sortedTasks = sortTasks(tasks);

    return (
      <Table columns={columns}>
        <TableHeader>
          {columns.map((col) => (
            <TableHeaderCell
              key={col.id}
              title={col.title}
              onSortClicked={(sortState) => onSort(col.id, sortState)}
              sortState={sorting[col.id]}
            />
          ))}
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => {
            const statusKey = Object.keys(task.enrichedColumns).find((key) =>
              key.startsWith("status@")
            );
            const status = task.enrichedColumns?.[statusKey] || {};
            const statusText = status.text || "-";
            const statusColor = status.color || "#000000";

            return (
              <TableRow key={task.id}>
                <TableCell>{task.name || "No Task Name"}</TableCell>
                <TableCell>
                  <Label text={task.group?.title || "No Group Title"} type="secondary" />
                </TableCell>
                <TableCell>
                  <Label
                    text={
                      new Date(
                        task.enrichedColumns?.[Object.keys(task.enrichedColumns).find((key) => key.startsWith("date@"))] || ""
                      ).toLocaleDateString() || "-"
                    }
                    type="primary"
                  />
                </TableCell>
                <TableCell>
                  <AvatarGroup max={3} size="medium">
                    {(
                      task.enrichedColumns?.[Object.keys(task.enrichedColumns).find((key) => key.startsWith("person@"))]
                        ?.value || []
                    ).map((person) => (
                      <Avatar
                        key={person.id}
                        src={person.photo}
                        ariaLabel={person.name || "Unknown"}
                        type="img"
                        fallbackIcon={<FaUsers />}
                      />
                    ))}
                  </AvatarGroup>
                </TableCell>
                  <div
                    className="w-full flex items-center justify-center h-full padding-status"
                    style={{
                      backgroundColor: statusColor,
                      color: "#ffffff",
                    }}
                  >
                    <Text color="fixedLight">{statusText}</Text>
                  </div>
                <TableCell>
                  {task.enrichedColumns?.[Object.keys(task.enrichedColumns).find((key) => key.startsWith("time_tracking@"))] ||
                    "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="date-view">
      {["past", "current", "future"].map((category) => {
        const groups = categorizedData[category];

        if (Object.keys(groups).length === 0) return null;

        return (
          <div key={category} className="date-section mb-4">
            <ExpandCollapse title={`${category.charAt(0).toUpperCase() + category.slice(1)} (${Object.values(groups).reduce((acc, group) => acc + group.tasks.length, 0)} tasks)`} isDefaultOpen>
              {secondaryView
                ? Object.keys(groups).map((key) => (
                    <ExpandCollapse key={key} title={groups[key].title} hideBorder isDefaultOpen>
                      {renderTable(groups[key].tasks)}
                    </ExpandCollapse>
                  ))
                : renderTable(Object.values(groups).flatMap((g) => g.tasks))}
            </ExpandCollapse>
          </div>
        );
      })}
    </div>
  );
};

export default DateView;