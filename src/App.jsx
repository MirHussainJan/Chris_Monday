import React, { useEffect, useState } from "react";
import "monday-ui-react-core/dist/main.css";
import SkeletonLoader from "./components/Loader/SkeletonLoader";
import {
  getBoards,
  getPeopleColumns,
  getDateColumns,
  getStatusColumns,
  getPersonValues,
  getStatusValues,
  getDateValuesAndgetTimeTrackingValue,
} from "./MondayAPI/monday2";
import { Home } from "monday-ui-react-core/dist/dist/esm/components/Icon/Icons/index.js";

const App = () => {
  // State variables for each data type
  const [boards, setBoards] = useState([]);
  const [peopleColumns, setPeopleColumns] = useState([]);
  const [dateColumns, setDateColumns] = useState([]);
  const [statusColumns, setStatusColumns] = useState([]);
  const [personValues, setPersonValues] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [dateAndTimeTrackingValues, setDateAndTimeTrackingValues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch boards
        const boardsData = await getBoards();
        setBoards(boardsData);
        console.log("Boards Data:", boardsData);

        // Fetch columns
        const [peopleColumnsData, dateColumnsData, statusColumnsData] =
          await Promise.all([
            getPeopleColumns(),
            getDateColumns(),
            getStatusColumns(),
          ]);
        setPeopleColumns(peopleColumnsData);
        setDateColumns(dateColumnsData);
        setStatusColumns(statusColumnsData);

        console.log("People Columns:", peopleColumnsData);
        console.log("Date Columns:", dateColumnsData);
        console.log("Status Columns:", statusColumnsData);

        // Fetch values
        const boardIds = boardsData.map((board) => board.id);
        const peopleIds = peopleColumnsData.flatMap((columns) =>
          columns.map((col) => col.id)
        );
        const statusIds = statusColumnsData.flatMap((columns) =>
          columns.map((col) => col.id)
        );
        const dateIds = dateColumnsData.flatMap((columns) =>
          columns.map((col) => col.id)
        );

        const [personValuesData, statusValuesData, dateAndTimeTrackingData] =
          await Promise.all([
            getPersonValues(peopleIds, boardIds),
            getStatusValues(statusIds, boardIds),
            getDateValuesAndgetTimeTrackingValue(dateIds, boardIds),
          ]);
        setPersonValues(personValuesData);
        setStatusValues(statusValuesData);
        setDateAndTimeTrackingValues(dateAndTimeTrackingData);

        console.log("Person Values:", personValuesData);
        console.log("Status Values:", statusValuesData);
        console.log("Date and Time Tracking Values:", dateAndTimeTrackingData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!boards || boards.length === 0) {
    return <SkeletonLoader />;
  }

  return (
    <div>
      <Home/>
    </div>
  );
};

export default App;