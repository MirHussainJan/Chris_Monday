import React from "react";
import { Accordion, AccordionItem, Text } from "monday-ui-react-core";

const Summary = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center">
        <Text type="text" size="small" color="secondary">
          No data available.
        </Text>
      </div>
    );
  }

  // Calculate Total Time Tracked
  const totalTimeTracked = data.reduce((sum, item) => {
    const timeTrackingKey = Object.keys(item.enrichedColumns || {}).find((key) =>
      key.startsWith("time_tracking@")
    );

    const timeTrackingValue = item?.enrichedColumns?.[timeTrackingKey] || "0s";
    const match = timeTrackingValue.match(/(\d+)hr\s*(\d*)min?/);
    const hours = match ? parseInt(match[1] || 0, 10) : 0;
    const minutes = match ? parseInt(match[2] || 0, 10) : 0;

    return sum + hours * 60 + minutes; // Convert hours to minutes
  }, 0);

  // Summarize Status Counts
  const statusSummary = data.reduce((acc, item) => {
    const statusKey = Object.keys(item.enrichedColumns || {}).find((key) =>
      key.startsWith("status@")
    );

    const statusText = item?.enrichedColumns?.[statusKey]?.text || "Unknown";
    acc[statusText] = (acc[statusText] || 0) + 1;
    return acc;
  }, {});

  const totalUniqueStatuses = Object.keys(statusSummary).length; // Count unique statuses

  // Summarize Assigned Persons
  const personsSummary = data.reduce((acc, item) => {
    const personKey = Object.keys(item.enrichedColumns || {}).find((key) =>
      key.startsWith("person@")
    );

    const persons = item?.enrichedColumns?.[personKey]?.value || [];
    persons.forEach((person) => {
      acc[person.name] = (acc[person.name] || 0) + 1;
    });

    return acc;
  }, {});

  const totalUniquePersons = Object.keys(personsSummary).length; // Count unique persons

  return (
    <div className="p-4 bg-white border border-gray-300 rounded-sm">
      <Accordion>
        {/* Total Time Tracked */}
        <AccordionItem
          title={`Total Time Tracked (${Math.floor(totalTimeTracked / 60)}hr ${totalTimeTracked % 60}min)`}
        >
          <Text type="text" size="small">This section summarizes total time tracked.</Text>
        </AccordionItem>

        {/* Status Summary (Count of Unique Statuses) */}
        <AccordionItem title={`Statuses (${totalUniqueStatuses})`}>
          {Object.entries(statusSummary).map(([status, count]) => (
            <Text key={status} type="text" size="small">
              {status}: {count}
            </Text>
          ))}
        </AccordionItem>

        {/* Assigned Persons Summary (Count of Unique Persons) */}
        <AccordionItem title={`Assigned Persons (${totalUniquePersons})`}>
          {Object.entries(personsSummary).map(([person, count]) => (
            <Text key={person} type="text" size="small">
              {person}: {count}
            </Text>
          ))}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Summary;