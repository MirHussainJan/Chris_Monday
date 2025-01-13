import React, { useEffect, useState } from "react";
import { Search } from "monday-ui-react-core/next";
import { Dropdown, Text, Button } from "monday-ui-react-core";
import { FaCog } from "react-icons/fa"; // Importing React Icon (settings)
import "monday-ui-react-core/dist/main.css";
import Table from "./components/Table/Table";
import CustomizationSidebar from "./components/CustomizationSidebar/CustomizationSidebar";
import BoardView from "./components/ViewOptions/BoardView";
import PersonView from "./components/ViewOptions/PersonView";
import DateView from "./components/ViewOptions/DateView";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedView, setSelectedView] = useState("table"); // "table" or "calendar"
  const [searchQuery, setSearchQuery] = useState("");
  const [enrichedData, setEnrichedData] = useState([]); // State for enriched data

  useEffect(() => {
    console.log(enrichedData, "from app");
    console.log(selectedView, "from app");
  }, [selectedView]); // Add selectedView to the dependency array

  const viewOptions = [
    { value: "table", label: "View all" },
    { value: "board", label: "Board View" },
    { value: "person", label: "Person View" },
    { value: "date", label: "Date View" },
  ];

  return (
    <div className="app-container">
      {/* Header Section */}
      <div className="header">
        <div>
          <Text className="text-4xl font-bold">Tasks</Text>
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
          {/* <Search
            placeholder="Search"
            onChange={(event) => setSearchQuery(event.target.value)}
          /> */}
          <Dropdown
            options={viewOptions}
            searchable={false}
            clearable={false}
            defaultValue={[viewOptions[0]]}
            onChange={(selected) => setSelectedView(selected.value)} // Update state
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
          <span>Customize</span>
        </Button>
      </div>

      {/* Sidebar */}
      <CustomizationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedBoardIds={selectedBoardIds}
        setSelectedBoardIds={setSelectedBoardIds}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
      />

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
        ) : // Conditional rendering based on selectedView
        selectedView === "board" ? (
          <BoardView data={enrichedData} />
        ) : selectedView === "person" ? (
          <PersonView data={enrichedData} />
        ) : selectedView === "date" ? (
          <DateView data={enrichedData} />
        ) : (
          <Table
            boardIds={selectedBoardIds}
            selectedPeopleColumns={selectedColumns || []}
            searchQuery={searchQuery}
            enrichedData={enrichedData}
            setEnrichedData={setEnrichedData}
          />
        )}
      </div>
    </div>
  );
};

export default App;
