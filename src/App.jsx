import React, { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";

import {
  getBoardItems,
  getProfilePicturesOfUsers,
  getProfilePicturesOfTeams,
} from "./MondayAPI/monday";
import Home from "./pages/Home";
import SkeletonLoader from "./components/Loader/SkeletonLoader";

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

const App = () => {
  const [context, setContext] = useState(null);
  const [boardsItems, setBoardsItems] = useState([]); // State to store fetched data
  const [enrichedData, setEnrichedData] = useState([]); // State to store data with profile pictures
  const [loading, setLoading] = useState(true); // Loading state

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
      setLoading(true); // Start loading
      try {
        const data = await getBoardItems(
          boardsData[0].boardId,
          [personId],
          boardsData[0].peopleColId,
          boardsData[0].statusColId,
          boardsData[0].dateColId,
          boardsData[0].priorityColId,
          boardsData[0].timeTrackingColId
        );

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

        const enrichedItems = data.map((item) => {
          if (item.people) {
            item.people = item.people.map((person) => ({
              ...person,
              profile_picture: profileMap.get(person.id) || null,
            }));
          }
          return item;
        });

        setBoardsItems(data);
        setEnrichedData(enrichedItems);
        console.log("From App (Enriched Data)", enrichedItems);
      } finally {
        setLoading(false); // End loading
      }
    }

    fetchData();
  }, []);

  if(enrichedData.length === 0){
    return <SkeletonLoader/>;
  }
  return (
    <div>
      
        <Home enrichedData={enrichedData} setEnrishedData = {setEnrichedData} />
    </div>
  );
};

export default App;
