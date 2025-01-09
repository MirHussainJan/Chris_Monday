import React, { useState } from "react";
import { Search } from "monday-ui-react-core/next";
import { Dropdown, Text, Button, Heading } from "monday-ui-react-core";
import { FaCog } from "react-icons/fa"; // Importing React Icon (settings)
import "monday-ui-react-core/dist/main.css";
import Table from "./components/Table/Table";
import CustomizationSidebar from "./components/CustomizationSidebar/CustomizationSidebar";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedView, setSelectedView] = useState("table"); // "table" or "calendar"
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for centered button

  const viewOptions = [
    { value: "all", label: "View all" },
    { value: "board", label: "Board View" },
    { value: "person", label: "Person View" },
    { value: "date", label: "Date View" },
  ];

  return (
    <div className="app-container">
      {/* Header Section */}
      <div className="header">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>
      </div>

      {/* Nav Section */}
      <div
        className="nav-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Group One: SearchBar and Dropdown */}
        <div
          className="left-group"
          style={{ display: "flex", alignItems: "center" }}
        >
          <Search
            placeholder="Search"
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <Dropdown
            options={viewOptions}
            searchable={false}
            clearable={false}
            defaultValue={[viewOptions[0]]}
            onChange={(selected) => console.log(selected.value)}
            className="dropdown"
            style={{ marginLeft: "12px" }}
          />
        </div>

        {/* Group Two: Icon and Customize Button */}
        <Button
          onClick={() => setIsSidebarOpen(true)}
          size="small"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 12px",
            color: "white",
            borderRadius: "4px",
          }}
        >
          <FaCog size={18} style={{ marginRight: "8px" }} />{" "}
          {/* React Icon (settings) */}
          <span>Customize</span>
        </Button>
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <CustomizationSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedBoardIds={selectedBoardIds}
          setSelectedBoardIds={setSelectedBoardIds}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
        />
      )}

      {/* Main Content */}
      <div>
        {selectedBoardIds.length === 0 || selectedColumns.length === 0 ? (
          <div
            className="no-data-container"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <div className="no-data-message" style={{ textAlign: "center" }}>
              <Text
                weight="bold"
                className="no-data-title"
                style={{ marginBottom: "16px" }}
              >
                No boards or columns selected
              </Text>
              <Text className="no-data-text" style={{ marginBottom: "24px" }}>
                To view your tasks, please open the Customize sidebar and select
                your boards and columns.
              </Text>
              <Button
                onClick={() => setIsSidebarOpen(true)}
                size="small"
                style={{ marginTop: "16px" }}
              >
                Open Customize Sidebar
              </Button>
            </div>
          </div>
        ) : selectedView === "table" ? (
          <Table
            boardIds={selectedBoardIds}
            selectedPeopleColumns={selectedColumns || []}
            searchQuery={searchQuery}
          />
        ) : (
          <p style={{ textAlign: "center" }}>Calendar View (Coming Soon)</p>
        )}
      </div>
    </div>
  );
};

export default App;
