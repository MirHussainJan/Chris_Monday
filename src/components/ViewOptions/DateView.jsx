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
import { FaUsers } from "react-icons/fa";

const DateView = ({ data }) => {
  const [categorizedData, setCategorizedData] = useState({
    past: [],
    current: [],
    future: [],
  });

  useEffect(() => {
    const currentDate = new Date();

    const categorized = {
      past: [],
      current: [],
      future: [],
    };

    data.forEach((task) => {
      const dateKey = Object.keys(task.enrichedColumns).find((key) =>
        key.startsWith("date@")
      );
      const itemDate = dateKey ? new Date(task.enrichedColumns[dateKey]) : null;

      if (itemDate) {
        if (itemDate.toDateString() === currentDate.toDateString()) {
          categorized.current.push(task);
        } else if (itemDate < currentDate) {
          categorized.past.push(task);
        } else {
          categorized.future.push(task);
        }
      }
    });

    setCategorizedData(categorized);
  }, [data]);

  const generateColumns = (tasks) => {
    const columnTypes = {};

    tasks.forEach((task) => {
      if (task.enrichedColumns) {
        Object.keys(task.enrichedColumns).forEach((key) => {
          const columnId = key.split("@")[0];
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

  const renderTable = (category, tasks) => {
    const columns = generateColumns(tasks);

    return (
      <Table columns={columns}>
        <TableHeader className="zindex">
          {columns.map((col) => (
            <TableHeaderCell key={col.id} title={col.title} />
          ))}
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.name || "No Task Name"}</TableCell>
              <TableCell>{task.group?.title || "No Group Title"}</TableCell>

              {columns.slice(2).map((col) => {
                const enrichedValue =
                  task.enrichedColumns?.[col.id + "@" + task.boardId]?.value;

                if (col.id === "person") {
                  return (
                    <TableCell key={col.id}>
                      {renderPersonCell(enrichedValue)}
                    </TableCell>
                  );
                }

                return <TableCell key={col.id}>{enrichedValue || "-"}</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="date-view">
      {["past", "current", "future"].map((category) => (
        <div key={category} className="date-section">
          <ExpandCollapse
            title={`${category.charAt(0).toUpperCase() + category.slice(1)} (${
              categorizedData[category].length
            } tasks)`}
            hideBorder
            isDefaultOpen={true}
          >
            {renderTable(category, categorizedData[category])}
          </ExpandCollapse>
        </div>
      ))}
    </div>
  );
};

export default DateView;