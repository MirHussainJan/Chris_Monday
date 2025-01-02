import React, { useState } from "react";
import "monday-ui-react-core/dist/main.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import Text from "monday-ui-react-core/dist/Text";
import Table from "../Table/Table";

// Mock Data Example
const companiesData = [
  { name: "Current" },
  { name: "Past" },
  { name: "Future" },
];

const getFilteredData = (data, dateStatus) => {
  const currentDate = new Date();
  return data.filter((item) => {
    const itemDate = new Date(item.date); // Assuming your `data` has a `date` field
    if (dateStatus === "Current") {
      return (
        itemDate.toDateString() === currentDate.toDateString()
      ); // Same date as today
    }
    if (dateStatus === "Past") {
      return itemDate < currentDate; // Before today
    }
    if (dateStatus === "Future") {
      return itemDate > currentDate; // After today
    }
    return true; // Default fallback
  });
};

const DateView = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const toggleDate = (dateStatus) => {
    setSelectedDate(selectedDate === dateStatus ? null : dateStatus);
  };

  return (
    <div className="p-6">
      {companiesData.map((company, index) => (
        <div key={index} className="pb-4 mb-4">
          {/* Accordion Header */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleDate(company.name)}
          >
            <div className="flex items-center gap-2">
              {/* Arrow Icon */}
              <span
                className={`${
                  selectedDate === company.name ? "rotate-90" : ""
                } transform text-xl text-gray-700 transition-transform duration-200`}
              >
                <MdKeyboardArrowRight />
              </span>
              {/* Company Name */}
              <Text
                size="lg"
                className={`${
                  selectedDate === company.name
                    ? "font-bold text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {company.name}
              </Text>
              {/* Item Count */}
              <Text size="sm" className="text-gray-500">
                {`${
                  getFilteredData(data, company.name).length
                } items`}
              </Text>
            </div>
          </div>

          {/* Accordion Content */}
          {selectedDate === company.name && (
            <div className="mt-4">
              <Table
                data={getFilteredData(data, company.name)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DateView;
