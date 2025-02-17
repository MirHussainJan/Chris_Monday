import React, { useEffect, useState } from "react";
import { Search } from "monday-ui-react-core/next";
import { Dropdown, Text, Button } from "monday-ui-react-core";
import { FaCog } from "react-icons/fa"; 
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
  const [selectedView, setSelectedView] = useState("table"); 
  const [selectedViewSec, setSelectedViewSec] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrichedData, setEnrichedData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(enrichedData);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = enrichedData.filter((item) =>
        item.name.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, enrichedData]);

  const viewOptions = [
    { value: "table", label: "View all" },
    { value: "board", label: "Board View" },
    { value: "person", label: "Person View" },
    { value: "date", label: "Date View" },
  ];

  const getSecondaryOptions = () => {
    return viewOptions.filter((option) => option.value !== "table" && option.value !== selectedView);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <Text className="text-4xl font-bold">Tasks</Text>
      </div>

      {/* Navigation */}
      <div
        className="nav-container zindex"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        {/* Left Group */}
        <div className="left-group" style={{ display: "flex", alignItems: "center" }}>
          <Search
            placeholder="Search (Item Name)"
            onChange={(event) => setSearchQuery(event.target.value.toLowerCase())}
          />
          
          {/* Primary View Dropdown */}
          <Dropdown
            options={viewOptions}
            searchable={false}
            clearable={false}
            defaultValue={[viewOptions[0]]}
            onChange={(selected) => {
              if (selected?.value) {
                setSelectedView(selected.value);
                setSelectedViewSec(null); 
              }
            }}
            className="dropdown"
            style={{ marginLeft: "12px" }}
          />
          
          {/* Secondary View Dropdown */}
          <Dropdown
            options={getSecondaryOptions()}
            searchable={false}
            clearable={false}
            placeholder={selectedView === "table" ? "-" : "Select"}
            disabled={!selectedView || selectedView === "table"}  // Disable if no selection or "View all" selected
            onChange={(selected) => {
              if (selected?.value) {
                setSelectedViewSec(selected.value);
              }
            }}
            className="dropdown zindex"
            style={{ marginLeft: "12px" }}
          />
        </div>

        {/* Customize Button */}
        <Button
          onClick={() => setIsSidebarOpen(true)}
          size="small"
          style={{ display: "flex", alignItems: "center", padding: "8px 12px", color: "white", borderRadius: "4px" }}
        >
          <FaCog size={18} style={{ marginRight: "8px" }} />
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
          <div className="no-data-container" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "300px" }}>
            <div className="no-data-message" style={{ textAlign: "center" }}>
              <Text weight="bold" className="no-data-title" style={{ marginBottom: "16px" }}>
                No boards or columns selected
              </Text>
              <Text className="no-data-text" style={{ marginBottom: "24px" }}>
                To view your tasks, please open the Customize sidebar and select your boards and columns.
              </Text>
              <Button onClick={() => setIsSidebarOpen(true)} size="small" style={{ marginTop: "16px" }}>
                Open Customize Sidebar
              </Button>
            </div>
          </div>
        ) : selectedView === "board" ? (
          <BoardView data={filteredData} secondaryView={selectedViewSec} />
        ) : selectedView === "person" ? (
          <PersonView data={filteredData} secondaryView={selectedViewSec} />
        ) : selectedView === "date" ? (
          <DateView data={filteredData} secondaryView={selectedViewSec} />
        ) : (
          <Table
            boardIds={selectedBoardIds}
            selectedPeopleColumns={selectedColumns || []}
            searchQuery={searchQuery}
            enrichedData={filteredData}
            setEnrichedData={setEnrichedData}
            secondaryView={selectedViewSec}
          />
        )}
      </div>
    </div>
  );
};

export default App;
