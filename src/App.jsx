import React, { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import { Search } from "monday-ui-react-core/next";
import { Dropdown } from "monday-ui-react-core";
// Explore more Monday React Components here: https://style.monday.com/
// import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js";

//components import
import TableContainer from "./components/Table/TableContainer";
import Table from "./components/Table/Table";
import NavContainer from "./components/Navigation/NavContainer";
import SearchContainer from "./components/Search/SearchContainer";
import { getBoardItems } from "./MondayAPI/monday";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();

const personId = 61017768;
const boardsData = [
  {
    boardId: 7574082160,
    peopleColId: "person",
    statusColId: "status",
    dateColId: "date4",
    priorityColId: "status_1__1",
    timeTrackingColId: "time_tracking__1",
  },
];

const viewOptions = [
  { value: "all", label: "View all" },
  { value: "board", label: "Board View" },
  { value: "person", label: "Person View" },
  { value: "date", label: "Date View" },
];

const App = () => {
  const [context, setContext] = useState(null);
  const [boardsItems, setBoardsItems] = useState([]);  // State to store fetched data

  useEffect(() => {
    // Notice this method notifies the monday platform that user gains a first value in an app.
    monday.execute("valueCreatedForUser");

    // Set up event listener to get context from monday SDK
    const unsubscribe = monday.listen("context", (res) => {
      setContext(res.data);
    });

    // Clean up event listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      const data = await getBoardItems(
        boardsData[0].boardId,
        [personId],
        boardsData[0].peopleColId,
        boardsData[0].statusColId,
        boardsData[0].dateColId,
        boardsData[0].priorityColId,
        boardsData[0].timeTrackingColId
      );
      setBoardsItems(data);  // Store fetched data in state
      console.log("From App",data)
    }
    // if (!context) return;
    fetchData();
  }, []);

  return (
    <div className="App" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
      <>
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
          />
        </NavContainer>

        <TableContainer>
          <Table data={boardsItems} />  {/* Pass the first item of boardsItems as a prop */}
        </TableContainer>
      </>
    </div>
  );
};

export default App;