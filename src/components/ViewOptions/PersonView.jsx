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
  Text,
  Label,
} from "monday-ui-react-core";
import { FaUsers } from "react-icons/fa";

const PersonView = ({ data, secondaryView }) => {
  const [groupedByPersons, setGroupedByPersons] = useState({});

  useEffect(() => {
    const grouped = {};

    data.forEach((task) => {
      const personColumns = Object.keys(task.enrichedColumns || {}).filter((key) =>
        key.startsWith("person@")
      );

      if (personColumns.length > 0) {
        const persons = task.enrichedColumns[personColumns[0]].value || [];

        persons.forEach((person) => {
          if (!grouped[person.id]) {
            grouped[person.id] = {
              person,
              tasks: [],
            };
          }
          grouped[person.id].tasks.push(task);
        });
      } else {
        if (!grouped["no_person"]) {
          grouped["no_person"] = {
            person: null,
            tasks: [],
          };
        }
        grouped["no_person"].tasks.push(task);
      }
    });

    setGroupedByPersons(grouped);
  }, [data]);

  const generateColumns = () => [
    { id: "taskName", title: "Task Name" },
    { id: "group", title: "Group" },
    { id: "date", title: "Date" },
    { id: "status", title: "Status" },
    { id: "time_tracking", title: "Time Tracking" },
  ];

  const renderStatusCell = (enrichedColumns) => {
    const columnKeys = Object.keys(enrichedColumns).filter((key) =>
      key.startsWith("status@")
    );
    if (columnKeys.length > 0) {
      const { text, color } = enrichedColumns[columnKeys[0]] || {};
      return (
        <div
          className="w-full h-full flex justify-center items-center"
          style={{
            backgroundColor: color || "#000000",
            color: "#ffffff",
          }}
        >
          {text || "-"}
        </div>
      );
    }
    return (
      <div className="w-full flex justify-center items-center">{"-"}</div>
    );
  };

  const renderDateCell = (enrichedColumns) => {
    const columnKeys = Object.keys(enrichedColumns).filter((key) =>
      key.startsWith("date@")
    );
    const dateValue =
      columnKeys.length > 0 ? enrichedColumns[columnKeys[0]] : null;
    return dateValue ? (
      <Label text={new Date(dateValue).toLocaleDateString()} type="primary" />
    ) : (
      "-"
    );
  };

  const renderTimeTrackingCell = (enrichedColumns) => {
    const timeTrackingKey = Object.keys(enrichedColumns).find((key) =>
      key.startsWith("time_tracking@")
    );
    const timeTrackingValue = timeTrackingKey
      ? enrichedColumns[timeTrackingKey]
      : null;

    return timeTrackingValue ? (
      <div className="w-full h-full flex justify-center items-center">
        {timeTrackingValue}
      </div>
    ) : (
      <div className="w-full flex justify-center items-center">{"-"}</div>
    );
  };

  return (
    <div className="person-view">
      {Object.keys(groupedByPersons).map((personId) => {
        const { person, tasks } = groupedByPersons[personId];
        const columns = generateColumns();

        return (
          <div key={personId} className="person-section">
            <ExpandCollapse
              title={
                person ? (
                  <div className="flex items-center">
                    <AvatarGroup max={1} size="medium">
                      <Avatar
                        src={person.photo}
                        ariaLabel={person.name || "Unknown"}
                        size="small"
                        type="img"
                        fallbackIcon={<FaUsers />}
                      />
                    </AvatarGroup>
                    <span className="ml-2 flex items-center">
                      {person.name} ({tasks.length} tasks)
                    </span>
                  </div>
                ) : (
                  `No Person Assigned (${tasks.length} tasks)`
                )
              }
              isDefaultOpen={true}
            >
              <Table columns={columns} className="table-auto border border-gray-300">
                <TableHeader>
                  {columns.map((col) => (
                    <TableHeaderCell
                      key={col.id}
                      title={col.title}
                      className="flex justify-center text-center border border-gray-300"
                    />
                  ))}
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell
                        className="flex justify-center text-center border border-gray-300"
                      >
                        {task.name || "No Task Name"}
                      </TableCell>
                      <TableCell
                        className="flex justify-center text-center border border-gray-300"
                      >
                        <Label
                          text={task.group?.title || "No Group Title"}
                          type="primary"
                        />
                      </TableCell>
                      <TableCell
                        className="flex justify-center text-center border border-gray-300"
                      >
                        {renderDateCell(task.enrichedColumns || {})}
                      </TableCell>
                      <TableCell
                        className="flex justify-center padding-status text-center border border-gray-300"
                      >
                        {renderStatusCell(task.enrichedColumns || {})}
                      </TableCell>
                      <TableCell
                        className="flex justify-center text-center border border-gray-300"
                      >
                        {renderTimeTrackingCell(task.enrichedColumns || {})}
                      </TableCell>
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

export default PersonView;
