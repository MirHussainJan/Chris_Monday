import React from "react";
import { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import { Search } from "monday-ui-react-core/next";
import { Dropdown } from "monday-ui-react-core";
//Explore more Monday React Components here: https://style.monday.com/
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
  const [boardsItems, setBoardsItems] = useState([]);

  useEffect(() => {
    // Notice this method notifies the monday platform that user gains a first value in an app.
    // Read more about it here: https://developer.monday.com/apps/docs/mondayexecute#value-created-for-user/
    monday.execute("valueCreatedForUser");

    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    const unsubscribe = monday.listen("context", (res) => {
      setContext(res.data);
    });

    //clear listeners when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   async function fetchData() {
  //     const data = await getBoardItems(
  //       boardsData[0].boardId,
  //       [personId],
  //       boardsData[0].peopleColId,
  //       boardsData[0].statusColId,
  //       boardsData[0].dateColId,
  //       boardsData[0].priorityColId,
  //       boardsData[0].timeTrackingColId
  //     );
  //     console.log(data[0]);
  //   }
  //   if (!context) return;
  //   fetchData();
  // }, [context]);

  return (
    <div className="App" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
      {
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
            <Table />
          </TableContainer>
        </>
      }
      {/* {!context && <div>Loading...</div>} */}
    </div>
  );
};

export default App;
