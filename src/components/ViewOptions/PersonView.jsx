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

const PersonView = ({ data }) => {
  const [groupedByPerson, setGroupedByPerson] = useState({});

  // Group tasks by persons whenever `data` changes
  useEffect(() => {
    const grouped = data.reduce((acc, task) => {
      const assignedPersons = task.enrichedColumns?.["person@" + task.boardId]?.value || [];
      if (assignedPersons.length === 0) {
        // Group tasks with no assigned person under "Unassigned"
        if (!acc["Unassigned"]) acc["Unassigned"] = [];
        acc["Unassigned"].push(task);
      } else {
        assignedPersons.forEach((person) => {
          if (!acc[person.id]) acc[person.id] = { person, tasks: [] };
          acc[person.id].tasks.push(task);
        });
      }
      return acc;
    }, {});
    setGroupedByPerson(grouped);
  }, [data]);

  // Generate dynamic columns for the table
  const generateColumns = () => [
    { id: "taskName", title: "Task Name" },
    { id: "boardName", title: "Board Name" },
    { id: "group", title: "Group" },
    { id: "status", title: "Status" },
    { id: "date", title: "Date" },
  ];

  return (
    <div className="person-view">
      {Object.keys(groupedByPerson).map((personId) => {
        const personData = groupedByPerson[personId];
        const tasks = personData?.tasks || personData; // For "Unassigned," it's just tasks
        const personName = personId === "Unassigned" ? "Unassigned" : personData.person.name;
        const personPhoto = personData?.person?.photo;
        const columns = generateColumns();

        return (
          <div key={personId} className="person-section">
            <ExpandCollapse
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {personId !== "Unassigned" ? (
                    <Avatar src={personPhoto} fallbackIcon={<FaUsers />} ariaLabel={personName} />
                  ) : (
                    <Avatar fallbackIcon={<FaUsers />} ariaLabel="Unassigned" size="small"/>
                  )}
                  <span>{`${personName} (${tasks.length} tasks)`}</span>
                </div>
              }
              hideBorder
              isDefaultOpen={false}
            >
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
                      <TableCell>{task.boardname || "No Board Name"}</TableCell>
                      <TableCell>{task.group?.title || "No Group Title"}</TableCell>
                      <TableCell>
                        {task.enrichedColumns?.["status@" + task.boardId]?.value || "-"}
                      </TableCell>
                      <TableCell>
                        {task.enrichedColumns?.["date@" + task.boardId]?.value || "-"}
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