import React, { useState, useEffect } from "react";
import "monday-ui-react-core/dist/main.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import Text from "monday-ui-react-core/dist/Text";
import Table from "../Table/Table";

// Helper to extract unique person IDs from data
const extractUniquePersonIds = (data) => {
  const personMap = new Map();
  data.forEach((item) => {
    item.people.forEach((person) => {
      if (!personMap.has(person.id)) {
        personMap.set(person.id, { id: person.id, text: person.text });
      }
    });
  });
  return Array.from(personMap.values());
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
      {peopleIds.map((personId) => {
        const filteredData = getFilteredDataById(data, personId.id);
        return (
          <div key={personId.id} className="pb-4 mb-4">
            {/* Accordion Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => togglePerson(personId.id)}
            >
              <div className="flex items-center gap-2">
                {/* Arrow Icon */}
                <span
                  className={`${
                    selectedPersonId === personId.id ? "rotate-90" : ""
                  } transform text-xl text-gray-700 transition-transform duration-200`}
                >
                  <MdKeyboardArrowRight />
                </span>
                {/* Person ID */}
                <Text
                  size="lg"
                  className={`${
                    selectedPersonId === personId.id
                      ? "font-bold text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {`${personId.text}`}
                </Text>
                {/* Item Count */}
                <Text size="sm" className="text-gray-500">
                  {`${filteredData.length} items`}
                </Text>
              </div>
            </div>

            {/* Accordion Content */}
            {selectedPersonId === personId.id && (
              <div className="mt-4">
                <Table data={filteredData} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PersonView;