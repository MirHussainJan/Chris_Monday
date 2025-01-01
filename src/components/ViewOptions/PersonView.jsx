import React, { useState, useEffect } from "react";
import "monday-ui-react-core/dist/main.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import Text from "monday-ui-react-core/dist/Text";
import Table from "../Table/Table";

// Helper to extract unique person IDs from data
const extractUniquePersonIds = (data) => {
  const personIds = new Set();
  data.forEach((item) => {
    item.people.forEach((person) => personIds.add(person.id));
  });
  return Array.from(personIds);
};

// Helper to filter data by person ID
const getFilteredDataById = (data, personId) => {
  return data.filter((item) =>
    item.people.some((person) => person.id === personId)
  );
};

const PersonView = ({ data }) => {
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [peopleIds, setPeopleIds] = useState([]);

  useEffect(() => {
    setPeopleIds(extractUniquePersonIds(data));
  }, [data]);

  const togglePerson = (personId) => {
    setSelectedPersonId(selectedPersonId === personId ? null : personId);
  };

  return (
    <div className="p-6">
      {peopleIds.map((personId, index) => (
        <div key={index} className="pb-4 mb-4">
          {/* Accordion Header */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => togglePerson(personId)}
          >
            <div className="flex items-center gap-2">
              {/* Arrow Icon */}
              <span
                className={`${
                  selectedPersonId === personId ? "rotate-90" : ""
                } transform text-xl text-gray-700 transition-transform duration-200`}
              >
                <MdKeyboardArrowRight />
              </span>
              {/* Person ID */}
              <Text
                size="lg"
                className={`${
                  selectedPersonId === personId
                    ? "font-bold text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {`Person ID: ${personId}`}
              </Text>
              {/* Item Count */}
              <Text size="sm" className="text-gray-500">
                {`${getFilteredDataById(data, personId).length} items`}
              </Text>
            </div>
          </div>

          {/* Accordion Content */}
          {selectedPersonId === personId && (
            <div className="mt-4">
              <Table data={getFilteredDataById(data, personId)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PersonView;
