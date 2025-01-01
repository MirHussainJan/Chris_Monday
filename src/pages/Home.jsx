import React, { useState } from "react";
import { Search } from "monday-ui-react-core/next";
import { Dropdown, TabList, Tab, Text, Checkbox, Button } from "monday-ui-react-core";
import { GiSettingsKnobs } from "react-icons/gi";
import TableContainer from "../components/Table/TableContainer";
import Table from "../components/Table/Table";
import NavContainer from "../components/Navigation/NavContainer";
import SearchContainer from "../components/Search/SearchContainer";
import BoardView from "../components/ViewOptions/BoardView";
import CustomizationSidebar from "../components/CustomizationSidebar/CustomizationSidebar";
import DateView from "../components/ViewOptions/DateView";


export default function Home({ enrichedData }) {
  const [selectedView, setSelectedView] = useState("all"); // Dropdown view state
  const [activeTab, setActiveTab] = useState("table"); // Tab state for switching between "Table" and "Calendar"
  const [showCustomization, setShowCustomization] = useState(false); // State to manage customization sidebar visibility

  const viewOptions = [
    { value: "all", label: "View all" },
    { value: "board", label: "Board View" },
    { value: "person", label: "Person View" },
    { value: "date", label: "Date View" },
  ];

  const renderContent = () => {
    if (activeTab === "table") {
      switch (selectedView) {
        case "all":
          return (
            <TableContainer>
              <Table data={enrichedData} />
            </TableContainer>
          );
        case "board":
          return <BoardView data={enrichedData} />;
        case "date":
          return <DateView data={enrichedData} />;
        default:
          return (
            <TableContainer>
              <Table data={enrichedData} />
            </TableContainer>
          );
      }
    }
    if (activeTab === "calendar") {
      return <div>Calendar View Coming Soon!</div>;
    }
  };

  return (
    <div className="App" style={{ padding: "32px", position: "relative" }}>
      <Text weight="medium" style={{ fontSize: "24px" }}>
        Tasks
      </Text>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TabList activeTabId={activeTab} onTabChange={(id) => setActiveTab(id)}>
          <Tab id="table">Table</Tab>
          <Tab id="calendar">Calendar</Tab>
        </TabList>
        <button
          className="hover:underline flex font-bold"
          onClick={() => setShowCustomization(true)}
        >
          <GiSettingsKnobs size={17} style={{ marginRight: "13px" }} className="rotate-90" />
          <Text type={Text.types.BUTTON}>Customize</Text>
        </button>
      </div>
      <NavContainer>
        <SearchContainer>
          <Search size="small" placeholder="Search" />
        </SearchContainer>
        <Dropdown
          size={Dropdown.sizes.SMALL}
          className="width-dropdown z-index-dropdown background-dropdown"
          options={viewOptions}
          searchable={false}
          clearable={false}
          defaultValue={[viewOptions[0]]}
          onChange={(selected) => setSelectedView(selected.value)}
        />
      </NavContainer>
      {renderContent()}
      {showCustomization && (
        <CustomizationSidebar onClose={() => setShowCustomization(false)} />
      )}
    </div>
  );
}
