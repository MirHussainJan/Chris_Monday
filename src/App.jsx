import { useState } from "react";
import Table from "./components/Table/Table";
import CustomizationSidebar from "./components/CustomizationSidebar/CustomizationSidebar";

const App = () => {
  const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  const [selectedPeopleColumns, setSelectedPeopleColumns] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div>
      <h1>Monday App</h1>
      <CustomizationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedBoardIds={selectedBoardIds}
        setSelectedBoardIds={setSelectedBoardIds}
        selectedPeopleColumns={selectedPeopleColumns}
        setSelectedPeopleColumns={setSelectedPeopleColumns}
      />
      <h2>Board Data</h2>
      {selectedBoardIds.length > 0 ? (
        <Table
          boardIds={selectedBoardIds} // Pass selected board IDs to Table
          selectedPeopleColumns={selectedPeopleColumns} // Pass selected columns to Table
        />
      ) : (
        <p>Select boards and columns from the sidebar to see their data.</p>
      )}
    </div>
  );
};

export default App;