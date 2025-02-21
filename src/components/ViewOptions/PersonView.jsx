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

const PersonView = ({ data, secondaryView }) => {
  const [groupedByPersons, setGroupedByPersons] = useState({});
  const [sorting, setSorting] = useState({});

  useEffect(() => {
    const grouped = {};

    data.forEach((task) => {
      const personColumns = Object.keys(task.enrichedColumns || {}).filter(
        (key) => key.startsWith("person@")
      );

      if (personColumns.length > 0) {
        const persons = task.enrichedColumns[personColumns[0]].value || [];

        persons.forEach((person) => {
          if (!grouped[person.id]) {
            grouped[person.id] = { person, tasks: [] };
          }
          grouped[person.id].tasks.push(task);
        });
      } else {
        if (!grouped["no_person"]) {
          grouped["no_person"] = { person: null, tasks: [] };
        }
        grouped["no_person"].tasks.push(task);
      }
    });

    setGroupedByPersons(grouped);
  }, [data]);

  const categorizeByDate = (tasks) => {
    const categories = { past: [], current: [], future: [] };
    const today = new Date();

    tasks.forEach((task) => {
      const dateKey = Object.keys(task.enrichedColumns).find((key) =>
        key.startsWith("date@")
      );
      const dateValue = dateKey
        ? new Date(task.enrichedColumns[dateKey])
        : null;

      if (!dateValue || isNaN(dateValue)) {
        categories.future.push(task);
      } else if (dateValue < today) {
        categories.past.push(task);
      } else if (dateValue.toDateString() === today.toDateString()) {
        categories.current.push(task);
      } else {
        categories.future.push(task);
      }
    });

    return categories;
  };

  const categorizeByBoard = (tasks) => {
    return tasks.reduce((acc, task) => {
      const boardId = task.boardId || "Unknown Board";
      if (!acc[boardId]) acc[boardId] = [];
      acc[boardId].push(task);
      return acc;
    }, {});
  };

  const generateColumns = () => [
    { id: "taskName", title: "Task Name" },
    { id: "group", title: "Group" },
    { id: "date", title: "Date" },
    { id: "status", title: "Status" },
    { id: "time_tracking", title: "Time Tracking" },
  ];

  const onSort = (columnId, sortState) => {
    setSorting({ [columnId]: sortState });
  };

  const sortTasks = (tasks) => {
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
                  <Label text={task.group?.title || "No Group Title"} />
                </TableCell>
                <TableCell>
                <Label text={task.enrichedColumns?.[
                    Object.keys(task.enrichedColumns).find((key) =>
                      key.startsWith("date@")
                    )
                  ] || "-"} />
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
    <div className="person-view">
      {Object.keys(groupedByPersons).map((personId) => {
        const { person, tasks } = groupedByPersons[personId];

        let secondaryGroups = {};
        if (secondaryView === "date") {
          secondaryGroups = categorizeByDate(tasks);
        } else if (secondaryView === "board") {
          secondaryGroups = categorizeByBoard(tasks);
        }

        return (
          <div key={personId} className="person-section mb-4">
            <ExpandCollapse
              title={
                <div className="flex items-center">
                  <AvatarGroup max={1} size="medium">
                    <Avatar
                      src={person?.photo}
                      ariaLabel={person?.name || "Unknown"}
                      size="small"
                      type="img"
                      fallbackIcon={<FaUsers />}
                    />
                  </AvatarGroup>
                  <span className="ml-2">
                    {person?.name || "No Person Assigned"} ({tasks.length}{" "}
                    tasks)
                  </span>
                </div>
              }
              isDefaultOpen
            >
              {secondaryView
                ? Object.entries(secondaryGroups).map(
                    ([category, categoryTasks]) =>
                      categoryTasks.length ? (
                        <ExpandCollapse
                          key={category}
                          title={`${category} (${categoryTasks.length})`}
                          isDefaultOpen
                          hideBorder
                        >
                          {renderTable(categoryTasks)}
                        </ExpandCollapse>
                      ) : null
                  )
                : renderTable(tasks)}
            </ExpandCollapse>
          </div>
        );
      })}
    </div>
  );
};

export default PersonView;