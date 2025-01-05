import React, { useState } from "react";
import { Search } from "monday-ui-react-core/next";
import { Dropdown, Text } from "monday-ui-react-core";
import { GiSettingsKnobs } from "react-icons/gi";
import Table from "../components/Table/Table";
import CustomizationSidebar from "../components/CustomizationSidebar/CustomizationSidebar";

export default function Home({ enrichedData, setEnrichedData }) {
  const [selectedView, setSelectedView] = useState("all");
  const [showCustomization, setShowCustomization] = useState(false);

  const viewOptions = [
    { value: "all", label: "View all" },
    { value: "board", label: "Board View" },
    { value: "person", label: "Person View" },
    { value: "date", label: "Date View" },
  ];

  return (
    <div className="App" style={{ padding: "32px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text weight="medium" style={{ fontSize: "24px" }}>Tasks</Text>
        <button
          className="hover:underline flex font-bold"
          onClick={() => setShowCustomization(true)}
        >
          <GiSettingsKnobs size={17} style={{ marginRight: "13px" }} className="rotate-90" />
          <Text type={Text.types.BUTTON}>Customize</Text>
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Search size="small" placeholder="Search" />
        <Dropdown
          size={Dropdown.sizes.SMALL}
          className="width-dropdown z-index-dropdown background-dropdown"
          options={viewOptions}
          searchable={false}
          clearable={false}
          defaultValue={[viewOptions[0]]}
          onChange={(selected) => setSelectedView(selected.value)}
        />
      </div>
      {selectedView === "all" && <Table data={enrichedData} />}
      {showCustomization && (
        <CustomizationSidebar
          onClose={() => setShowCustomization(false)}
          enrichedData={enrichedData}
          setEnrichedData={setEnrichedData}
        />
      )}
    </div>
  );
}