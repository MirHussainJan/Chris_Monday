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
} from "monday-ui-react-core";

const PersonView = ({ data }) => {
  const [groupedByPerson, setGroupedByPerson] = useState({});
  const [expandedPersons, setExpandedPersons] = useState([]);

  // Group tasks by person whenever `data` changes
  useEffect(() => {
    const grouped = data.reduce((acc, task) => {
      const person = task.enrichedColumns.person?.value;
      if (!person) return acc;

      if (!acc[person]) {
        acc[person] = [];
      }
      acc[person].push(task);
      return acc;
    }, {});
    setGroupedByPerson(grouped);
  }, [data]);

  const togglePerson = (person) => {
    setExpandedPersons((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person]
    );
  };

  // Helper function to generate dynamic columns based on enriched data
  const generateColumns = (personTasks) => {
    const columnTypes = {};

    // Gather unique column types from enriched columns
    personTasks.forEach((task) => {
      Object.values(task.enrichedColumns).forEach((col) => {
        columnTypes[col.columnType] = col.columnType;
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
        {Object.keys(groupedByPerson).map((person) => {
          const personTasks = groupedByPerson[person];
          const recordCount = personTasks.length;
          const columns = generateColumns(personTasks);

          return (
            <AccordionItem
              key={person}
              title={`Person: ${person} (${recordCount} tasks)`}
              isOpen={expandedPersons.includes(person)}
              onClick={() => togglePerson(person)}
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
                        const enrichedValue = task.enrichedColumns[col.id];
                        const displayValue = enrichedValue
                          ? enrichedValue.value
                          : "-";

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