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

const BoardView = ({ data, secondaryView }) => {
  const [groupedData, setGroupedData] = useState({});
  const [sorting, setSorting] = useState({});

  useEffect(() => {
    const grouped = {};
    const currentDate = new Date();

    data.forEach((task) => {
      const boardId = task.boardId;
      const boardName = task.boardname;

      if (!grouped[boardId]) {
        grouped[boardId] = { boardName, categories: {} };
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

        if (!grouped[boardId].categories[category]) {
          grouped[boardId].categories[category] = [];
        }
        grouped[boardId].categories[category].push(task);
      } else if (secondaryView === "person") {
        const personKey = Object.keys(task.enrichedColumns).find((key) =>
          key.startsWith("person@")
        );
        const persons = personKey ? task.enrichedColumns[personKey].value : [];

        if (persons.length > 0) {
          persons.forEach((person) => {
            if (!grouped[boardId].categories[person.name]) {
              grouped[boardId].categories[person.name] = [];
            }
            grouped[boardId].categories[person.name].push(task);
          });
        } else {
          if (!grouped[boardId].categories["Unassigned"]) {
            grouped[boardId].categories["Unassigned"] = [];
          }
          grouped[boardId].categories["Unassigned"].push(task);
        }
      } else {
        if (!grouped[boardId].categories["allTasks"]) {
          grouped[boardId].categories["allTasks"] = [];
        }
        grouped[boardId].categories["allTasks"].push(task);
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
            a.enrichedColumns?.[
              Object.keys(a.enrichedColumns).find((key) =>
                key.startsWith("date@")
              )
            ] || 0
          ).getTime();
          valB = new Date(
            b.enrichedColumns?.[
              Object.keys(b.enrichedColumns).find((key) =>
                key.startsWith("date@")
              )
            ] || 0
          ).getTime();
          break;
        case "status":
          valA =
            a.enrichedColumns?.[
              Object.keys(a.enrichedColumns).find((key) =>
                key.startsWith("status@")
              )
            ]?.text || "";
          valB =
            b.enrichedColumns?.[
              Object.keys(b.enrichedColumns).find((key) =>
                key.startsWith("status@")
              )
            ]?.text || "";
          break;
        case "time_tracking":
          valA =
            a.enrichedColumns?.[
              Object.keys(a.enrichedColumns).find((key) =>
                key.startsWith("time_tracking@")
              )
            ] || 0;
          valB =
            b.enrichedColumns?.[
              Object.keys(b.enrichedColumns).find((key) =>
                key.startsWith("time_tracking@")
              )
            ] || 0;
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
    if (!tasks || tasks.length === 0) return null;

    const columns = generateColumns();
    const sortedTasks = sortTasks(tasks);

    return (
      <Table columns={columns}>
        <TableHeader className="zindex">
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
            const statusColumnKey = Object.keys(task.enrichedColumns).find(
              (key) => key.startsWith("status@")
            );
            const statusData = statusColumnKey
              ? task.enrichedColumns[statusColumnKey]
              : {};
            const statusText = statusData.text || "-";
            const statusColor = statusData.color || "#cccccc"; // Default light gray if no color is provided

            return (
              <TableRow key={task.id}>
                <TableCell>{task.name || "No Task Name"}</TableCell>
                <TableCell>
                  <Label text={task.group?.title || "No Group Title"} />
                </TableCell>
                <TableCell>
                  <Label
                    text={
                      new Date(
                        task.enrichedColumns?.[
                          Object.keys(task.enrichedColumns).find((key) =>
                            key.startsWith("date@")
                          )
                        ] || ""
                      ).toLocaleDateString() || "-"
                    }
                    type="primary"
                  />
                </TableCell>
                <TableCell>
                  <AvatarGroup max={3} size="medium">
                    {(
                      task.enrichedColumns?.[
                        Object.keys(task.enrichedColumns).find((key) =>
                          key.startsWith("person@")
                        )
                      ]?.value || []
                    ).map((person) => (
                      <Avatar
                        key={person.id}
                        src={person.photo}
                        ariaLabel={person.name || "Unknown"}
                        type="img"
                        fallbackIcon={<FaUsers />}
                      /> || '-'
                    ))}
                  </AvatarGroup>
                </TableCell>
                  <div
                    className="padding-status h-full w-full flex items-center justify-center"
                    style={{
                      backgroundColor: statusColor,
                      color: "#ffffff",
                    }}
                  >
                    <Text color="fixedLight">
                    {statusText}
                    </Text>
                  </div>
                <TableCell>
                  {task.enrichedColumns?.[
                    Object.keys(task.enrichedColumns).find((key) =>
                      key.startsWith("time_tracking@")
                    )
                  ] || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="board-view">
      {Object.entries(groupedData).map(([boardId, { boardName, categories }]) => (
        <ExpandCollapse className="mb-4" key={boardId} title={boardName} isDefaultOpen>
          {secondaryView
            ? Object.entries(categories).map(([title, tasks]) => (
                <ExpandCollapse key={title} title={title} hideBorder>
                  {renderTable(tasks)}
                </ExpandCollapse>
              ))
            : renderTable(categories.allTasks)}
        </ExpandCollapse>
      ))}
    </div>
  );
};

export default BoardView;