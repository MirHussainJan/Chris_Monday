import React, { useState, useMemo } from "react";
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
const peopleData = [
  { name: "Johnny", role: "Creative Director", avatar: "https://via.placeholder.com/30" },
  { name: "Johnny Martin", role: "CEO", avatar: "https://via.placeholder.com/30" },
  { name: "Martin Johnny", role: "Developer", avatar: "https://via.placeholder.com/30" },
];

const companyData = [
  {
    companyName: "ABC Company",
    columns: [
      { value: "fromDate", label: "From Date", icon: <FaCalendarAlt color="white"/> },
      { value: "toDate", label: "To Date", icon: <FaCalendarAlt color="white"/> },
    ],
  },
  {
    companyName: "123 Company",
    columns: [
      { value: "startDate", label: "Start Date", icon: <FaCalendarAlt color="white"/> },
      { value: "endDate", label: "End Date", icon: <FaCalendarAlt color="white"/> },
    ],
  },
];

export default function CustomizationSidebar({ onClose, data, setData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);

  const filteredPeople = peopleData.filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                value: person.name,
                label: (
                  <div key={index} className="flex items-center">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <div className="flex gap-2">
                      <Text>{person.name}</Text>
                      <Text type={Text.types.BODY} color={Text.colors.SECONDARY}>
                        {person.role}
                      </Text>
                    </div>
                  </div>
                ),
              }))}
              onChange={(value) => setSelectedPerson(value)}
              value={selectedPerson}
            />
          </AccordionItem>
        </Accordion>
      </div>

      {/* Boards Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Boards">
            <Text className="text-md mb-4 font-bold">Which boards should we show?</Text>
            <div className="pl-3">
              <Checkbox className="mt-3" label="ABC Company" checked />
              <Checkbox className="mt-3" label="123 Company" />
              <Checkbox className="mt-3" label="Replies" checked />
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Columns Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Date Column">
            <Text className="text-md mb-4 font-bold">Which board columns should we show?</Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {companyData.map((company, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{company.companyName}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={company.columns.map((column) => ({
                    value: column.value,
                    label: (
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-green-500 rounded">{column.icon}</span>
                        <Text>{column.label}</Text>
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
            <Text className="text-md mb-4 font-bold">Which status column should we show?</Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {companyData.map((company, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{company.companyName}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={company.columns.map((column) => ({
                    value: column.value,
                    label: (
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-green-500 rounded">{column.icon}</span>
                        <Text>{column.label}</Text>
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
            <Text className="text-md mb-4 font-bold">Which time tracking column should we show?</Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {companyData.map((company, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{company.companyName}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={company.columns.map((column) => ({
                    value: column.value,
                    label: (
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-green-500 rounded">{column.icon}</span>
                        <Text>{column.label}</Text>
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
