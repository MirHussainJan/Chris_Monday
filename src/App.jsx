import React, { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import { Search } from "monday-ui-react-core/next";
import { Dropdown } from "monday-ui-react-core";
import TableContainer from "./components/Table/TableContainer";
import Table from "./components/Table/Table";
import NavContainer from "./components/Navigation/NavContainer";
import SearchContainer from "./components/Search/SearchContainer";
import { getBoardItems, getProfilePicturesOfUsers, getProfilePicturesOfTeams } from "./MondayAPI/monday";

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
  const [boardsItems, setBoardsItems] = useState([]); // State to store fetched data
  const [enrichedData, setEnrichedData] = useState([]); // State to store data with profile pictures

  useEffect(() => {
    monday.execute("valueCreatedForUser");

    const unsubscribe = monday.listen("context", (res) => {
      setContext(res.data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Fetch board items
      const data = await getBoardItems(
        boardsData[0].boardId,
        [personId],
        boardsData[0].peopleColId,
        boardsData[0].statusColId,
        boardsData[0].dateColId,
        boardsData[0].priorityColId,
        boardsData[0].timeTrackingColId
      );

      // Extract unique people and teams for profile picture fetching
      const uniquePeople = [];
      const uniqueTeams = [];
      data.forEach((item) => {
        if (item.people) {
          item.people.forEach((person) => {
            if (person.kind === "person") uniquePeople.push(person.id);
            else if (person.kind === "team") uniqueTeams.push(person.id);
          });
        }
      });

      // Fetch profile pictures
      const [userPictures, teamPictures] = await Promise.all([
        getProfilePicturesOfUsers(uniquePeople),
        getProfilePicturesOfTeams(uniqueTeams),
      ]);

      const profileMap = new Map();
      userPictures.forEach((user) =>
        profileMap.set(user.id, user.photo_thumb_small)
      );
      teamPictures.forEach((team) =>
        profileMap.set(team.id, team.picture_url)
      );

      // Enrich data with profile pictures
      const enrichedItems = data.map((item) => {
        if (item.people) {
          item.people = item.people.map((person) => ({
            ...person,
            profile_picture: profileMap.get(person.id) || null,
          }));
        }
        return item;
      });

      setBoardsItems(data); // Original data
      setEnrichedData(enrichedItems); // Enriched data with profile pictures
      console.log("From App (Enriched Data)", enrichedItems);
    }

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
          <Table data={enrichedData} /> {/* Pass enriched data with profile pictures */}
        </TableContainer>
      </>
    </div>
  );
};

export default App;