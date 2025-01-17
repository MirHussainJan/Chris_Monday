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

const PersonView = ({ data }) => {
  const [groupedByPerson, setGroupedByPerson] = useState({});
  const [expandedPersons, setExpandedPersons] = useState([]);

  // Group tasks by person whenever `data` changes
  useEffect(() => {
    const grouped = data.reduce((acc, task) => {
      const person = task.enrichedColumns.person?.value;
      if (!person || !Array.isArray(person) || person.length === 0) return acc;

      person.forEach((p) => {
        if (!acc[p.id]) {
          acc[p.id] = { name: p.name, photo: p.photo, tasks: [] };
        }
        acc[p.id].tasks.push(task);
      });
      return acc;
    }, {});
    setGroupedByPerson(grouped);
  }, [data]);

  const togglePerson = (personId) => {
    setExpandedPersons((prev) =>
      prev.includes(personId)
        ? prev.filter((p) => p !== personId)
        : [...prev, personId]
    );
  };

  // Helper function to generate dynamic columns based on enriched data
  const generateColumns = (personTasks) => {
    const columnTypes = {};

    // Gather unique column types from enriched columns
    personTasks.forEach((task) => {
      Object.keys(task.enrichedColumns).forEach((key) => {
        const columnId = key.split('@')[0]; // Extract the column type like 'status', 'date'
        columnTypes[columnId] = columnId;
      });
    });

    // Create the columns array with dynamic column types
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

  return (
    <div className="person-view">
      <Accordion>
        {Object.keys(groupedByPerson).map((personId) => {
          const person = groupedByPerson[personId];
          const personTasks = person.tasks;
          const recordCount = personTasks.length;
          const columns = generateColumns(personTasks);

          return (
            <AccordionItem
              key={personId}
              title={`Person: ${person.name} (${recordCount} tasks)`}
              isOpen={expandedPersons.includes(personId)}
              onClick={() => togglePerson(personId)}
            >
              <Table columns={columns}>
                <TableHeader>
                  {columns.map((col) => (
                    <TableHeaderCell key={col.id} title={col.title} />
                  ))}
                </TableHeader>
                <TableBody>
                  {personTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.group?.title || "-"}</TableCell>

                      {columns.slice(2).map((col) => {
                        const enrichedValue = task.enrichedColumns[col.id + "@" + task.boardId];

                        const displayValue = enrichedValue ? enrichedValue.value : "-";

                        return (
                          <TableCell key={col.id}>{displayValue}</TableCell>
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

export default PersonView;