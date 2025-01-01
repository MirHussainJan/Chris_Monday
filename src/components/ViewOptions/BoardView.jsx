import React, { useState } from "react";
import "monday-ui-react-core/dist/main.css";
import { MdKeyboardArrowRight} from "react-icons/md";
import Text from "monday-ui-react-core/dist/Text";
import Table from "../Table/Table";
const companiesData = [
  {
    name: "ABC Company",
    group: "SaaS",
    board: "ABC Company",
    people: ["John Doe", "Jane Smith"],
    date: "29 July",
    status: "Not Started",
    priority: "High Priority",
    timeTracking: "8 Hours",
  },
  {
    name: "XYZ Company",
    group: "Enterprise",
    board: "XYZ Board",
    people: ["Alice", "Bob"],
    date: "15 August",
    status: "In Progress",
    priority: "Medium Priority",
    timeTracking: "4 Hours",
  },
  {
    name: "123 Company",
    group: "Marketing",
    board: "123 Board",
    people: ["Eve", "Sam"],
    date: "20 September",
    status: "Completed",
    priority: "Low Priority",
    timeTracking: "12 Hours",
  },
  {
    name: "456 Company",
    group: "Tech",
    board: "456 Board",
    people: ["Kate", "Mike"],
    date: "10 October",
    status: "Not Started",
    priority: "High Priority",
    timeTracking: "5 Hours",
  },
];


const BoardView = ({data}) => {
  const [expandedCompany, setExpandedCompany] = useState(null);

  const toggleCompany = (companyName) => {
    setExpandedCompany(expandedCompany === companyName ? null : companyName);
  };

  

  return (
    <div className="p-6">
      {companiesData.map((company, index) => (
        <div key={index} className=" pb-4 mb-4">
          {/* Company Header */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleCompany(company.name)}
          >
            <div className="flex items-center gap-2">
              <span
                className={`${
                  expandedCompany === company.name ? "rotate-90" : ""
                } transform text-xl text-gray-700`}
              >
                <MdKeyboardArrowRight />
              </span>
              <Text
                size="lg"
                className={`${
                  expandedCompany === company.name
                    ? "font-bold text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {company.name}
              </Text>
              <Text size="sm" className="text-gray-500">
                {`52 items`}
              </Text>
            </div>
          </div>

          {/* Expanded Company Details */}
          {expandedCompany === company.name && (
            <div className="mt-4">
             <Table data={data}/>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BoardView;
