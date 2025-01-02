import React, { useState, useMemo, useEffect } from "react";
import {
  Dropdown,
  Text,
  Checkbox,
  Accordion,
  AccordionItem,
  Search,
  Button,
  TabList,
  Tab,
} from "monday-ui-react-core";
import { FaCalendarAlt } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export default function CustomizationSidebar({ onClose, data, setData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  // Filter people dynamically from data
  const uniquePeople = Array.from(
    new Map(
      data.flatMap((item) => item.people).map((person) => [person.id, person])
    ).values()
  );
  const [filteredPeople, setFilteredPeople] = useState([]);
  useEffect(() => {
      setFilteredPeople(uniquePeople.filter(
          (person) =>
            person.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            person.kind.toLowerCase().includes(searchQuery.toLowerCase())
        ));
  }, []);
  const handlePeopleChange = (value) => {
        setSelectedPerson(value);
        const filteredData = data.filter((item) =>
          item.people.some((person) => {
            console.log("people", value)
            return person.text === value.value;
          })
        );
        setData(filteredData);
  };
  // Get unique boards dynamically
  const uniqueBoards = Array.from(
    data
      .reduce((map, item) => {
        const boardId = item.board.id;

        // Check if the board is already in the map
        if (!map.has(boardId)) {
          map.set(boardId, {
            ...item.board,
            dates: item.date ? [item.date] : [],
            statuses: item.status ? [item.status.text] : [],
            timeTracking: [],
          });
        } else {
          const board = map.get(boardId);
          // Add new date if it exists and is not already added
          if (item.date && !board.dates.includes(item.date)) {
            board.dates.push(item.date);
          }
          // Add new status if it exists and is not already added
          if (item.status && !board.statuses.includes(item.status.text)) {
            board.statuses.push({
              text: item.status.text,
              color: item.status.color,
            });
          }
          if (item.timeTracking) {
            // Calculate the time spent in hours for each timeTracking item

            const timeSpentInHours = item.timeTracking.map((time) => {
              const startedAt = new Date(time.started_at).getTime();
              const endedAt = new Date(time.ended_at).getTime();
              const timeSpentInHours = (
                (endedAt - startedAt) /
                (1000 * 60 * 60)
              ).toFixed(2); // Convert milliseconds to hours
              return parseFloat(timeSpentInHours);
            });
            // Add the new timeTracking (as an array of hours) to the board's timeTracking array
            const sum = timeSpentInHours.reduce((prev, curr) => {
              return prev + curr;
            }, 0);
            board.timeTracking.push(sum);
          }
        }
        return map;
      }, new Map())
      .values()
  );

  console.log(uniqueBoards);

  return (
    <div className="fixed top-0 right-0 w-[340px] h-full bg-white shadow-2xl p-4 z-50 overflow-y-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <Text type={Text.types.H4} weight={Text.weights.BOLD}>
          Customize
        </Text>
        <Button kind={Button.kinds.TERTIARY} onClick={onClose}>
          <RxCross2 />
        </Button>
      </div>

      {/* Tabs Section */}
      <TabList size="small" className="mt-4">
        <Tab>General</Tab>
        <Tab>Table</Tab>
        <Tab>Calendar</Tab>
      </TabList>

      {/* People Section */}

      <div className="mt-4">
        <Accordion>
          <AccordionItem title="People">
            <Text>Whose items should we show?</Text>
            <Dropdown
              placeholder="Select a person"
              options={filteredPeople.map((person, index) => ({
                value: person.text,
                label: (
                  <div key={index} className="flex items-center">
                    <img
                      src={person.profile_picture}
                      alt={person.text}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <div className="flex gap-2">
                      <Text>{person.text}</Text>
                    </div>
                  </div>
                ),
              }))}
              onChange={handlePeopleChange}
              value={selectedPerson}
            />
          </AccordionItem>
        </Accordion>
      </div>

      {/* Boards Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Boards">
            <Text className="text-md mb-4 font-bold">
              Which boards should we show?
            </Text>
            <div className="pl-3">
              {uniqueBoards.map((board) => (
                <div key={board.id} className="mb-2">
                  <Checkbox label={board.name} />
                </div>
              ))}
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Columns Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Date Column">
            <Text className="text-md mb-4 font-bold">
              Which board columns should we show?
            </Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {uniqueBoards.map((board, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{board.name}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={board.dates.map((date) => ({
                    value: date,
                    label: (
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-green-500 rounded">
                          <FaCalendarAlt />
                        </span>
                        <Text>{date}</Text>
                      </div>
                    ),
                  }))}
                  onChange={(value) => setSelectedColumn(value)}
                  value={selectedColumn}
                />
              </div>
            ))}
          </AccordionItem>
        </Accordion>
      </div>
      {/* Status Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Status Column">
            <Text className="text-md mb-4 font-bold">
              Which status column should we show?
            </Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {uniqueBoards.map((board, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{board.name}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={board.statuses.map((status) => ({
                    value: status.text,
                    label: (
                      <div className="flex items-center gap-2">
                        <span
                          className="pl-1 pr-1 rounded"
                          style={{
                            backgroundColor: status.color,
                            fontSize: "10px",
                          }}
                        >
                          {status.text ? status.text : "No Status"}
                        </span>
                      </div>
                    ),
                  }))}
                  onChange={(value) => setSelectedColumn(value)}
                  value={selectedColumn}
                />
              </div>
            ))}
          </AccordionItem>
        </Accordion>
      </div>

      {/* Time Tracking Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Time Tracking Column">
            <Text className="text-md mb-4 font-bold">
              Which time tracking column should we show?
            </Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {uniqueBoards.map((board, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{board.name}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={board.timeTracking.map((time) => ({
                    value: time,
                    label: (
                      <div className="flex items-center gap-2">
                        <Text>{time} Hours</Text>
                      </div>
                    ),
                  }))}
                  onChange={(value) => setSelectedColumn(value)}
                  value={selectedColumn}
                />
              </div>
            ))}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
