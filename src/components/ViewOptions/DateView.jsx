import React, { useMemo } from "react";
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
import { Text } from "monday-ui-react-core";

// Function to categorize tasks based on their due date
const categorizeByDate = (data) => {
  const currentDate = new Date().setHours(0, 0, 0, 0); // Normalize current date to midnight
  const pastTasks = [];
  const currentTasks = [];
  const futureTasks = [];
  const invalidTasks = []; // To keep tasks with invalid or missing dates

  data.forEach((task) => {
    const taskDate = task.enrichedColumns?.date4
      ? new Date(task.enrichedColumns.date4).setHours(0, 0, 0, 0)
      : null;

    if (!taskDate || isNaN(taskDate)) {
      invalidTasks.push(task); // Add to invalid tasks if the date is missing or invalid
      return;
    }

    if (taskDate < currentDate) {
      pastTasks.push(task);
    } else if (taskDate === currentDate) {
      currentTasks.push(task);
    } else {
      futureTasks.push(task);
    }
  });

  return { pastTasks, currentTasks, futureTasks, invalidTasks };
};

const DateView = ({ data = [] }) => {
  // Use memoization to categorize tasks when data changes
  const { pastTasks = [], currentTasks = [], futureTasks = [], invalidTasks = [] } = useMemo(
    () => categorizeByDate(data),
    [data]
  );

  // Function to render task table
  const renderTaskTable = (tasks, title) => {
    if (tasks.length === 0) {
      return (
        <Text
          style={{
            margin: "16px 0",
            textAlign: "center",
            color: "gray",
          }}
        >
          No tasks available in this category.
        </Text>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableHeaderCell title="Task Name" />
          <TableHeaderCell title="Board" />
          <TableHeaderCell title="Person" />
          <TableHeaderCell title="Date" />
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.name || "N/A"}</TableCell>
              <TableCell>{task.boardId || "N/A"}</TableCell>
              <TableCell>{task.enrichedColumns?.person || "Unassigned"}</TableCell>
              <TableCell>{task.enrichedColumns?.date4 || "No Date"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="date-view">
      <Accordion>
        {/* Past Tasks */}
        <AccordionItem title={`Past Tasks (${pastTasks.length})`} isOpen={true}>
          {renderTaskTable(pastTasks, "Past Tasks")}
        </AccordionItem>

        {/* Current Tasks */}
        <AccordionItem title={`Current Tasks (${currentTasks.length})`}>
          {renderTaskTable(currentTasks, "Current Tasks")}
        </AccordionItem>

        {/* Future Tasks */}
        <AccordionItem title={`Future Tasks (${futureTasks.length})`}>
          {renderTaskTable(futureTasks, "Future Tasks")}
        </AccordionItem>

        {/* Invalid Tasks */}
        {invalidTasks.length > 0 && (
          <AccordionItem title="Tasks with Invalid Dates" isOpen={true}>
            <Text
              style={{
                margin: "16px 0",
                textAlign: "center",
                color: "red",
              }}
            >
              These tasks have invalid or missing dates.
            </Text>
            {renderTaskTable(invalidTasks, "Invalid Tasks")}
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default DateView;