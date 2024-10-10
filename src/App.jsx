import React from "react";
import { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
//Explore more Monday React Components here: https://style.monday.com/
// import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js";

//components import
import TableContainer from "./components/Table/TableContainer";
import Table from "./components/Table/Table";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();

const boardItems = [
  {
    id: "1",
    name: "Item 1",
    columnValues: {
      priority: {
        text: "High",
        color: "red",
      },
      status: {
        text: "Done",
        color: "green",
      },
      person: {
        user_id: 123456,
        text: "John Doe",
      },
      date: {
        date: "2021-06-01",
      },
      time_tracking: {
        duration: 3600,
      },
      group: {
        id: "group_1",
        text: "Group 1",
        color: "blue",
      },
      board: {
        id: "board_1",
        text: "Board 1",
      },
    },
  },
  {
    id: "2",
    name: "Item 2",
    columnValues: {
      priority: {
        text: "Low",
        color: "yellow",
      },
      status: {
        text: "Working on it",
        color: "orange",
      },
      person: {
        user_id: 654321,
        text: "Jane Doe",
      },
      date: {
        date: "2021-06-02",
      },
      time_tracking: {
        duration: 7200,
      },
      group: {
        id: "group_2",
        text: "Group 2",
        color: "purple",
      },
      board: {
        id: "board_2",
        text: "Board 2",
      },
    },
  },
  {
    id: "3",
    name: "Item 3",
    columnValues: {
      priority: {
        text: "Medium",
        color: "blue",
      },
      status: {
        text: "Stuck",
        color: "red",
      },
      person: {
        user_id: 123456,
        text: "John Doe",
      },
      date: {
        date: "2021-06-03",
      },
      time_tracking: {
        duration: 10800,
      },
      group: {
        id: "group_3",
        text: "Group 3",
        color: "green",
      },
      board: {
        id: "board_3",
        text: "Board 3",
      },
    },
  },
];

const App = () => {
  const [context, setContext] = useState();

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
  return (
    <div className="App">
      <TableContainer>
        <Table />
      </TableContainer>

      <TableContainer>
        <Table />
      </TableContainer>
    </div>
  );
};

export default App;
