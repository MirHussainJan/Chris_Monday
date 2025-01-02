import React, { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import {
  getBoardItems,
  getProfilePicturesOfUsers,
  getProfilePicturesOfTeams,
  getBoards,
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
    async function fetchAllData() {
      try {
        let ids = await getBoards(); // Fetch all board IDs
        console.log("Board IDs:", ids);
 
        const allEnrichedData = []; // Array to store enriched data for all boards
 
        // Loop through each board ID
        for (const boardId of ids) {
          console.log(`Processing Board ID: ${boardId}`);
 
          // Fetch board items
          const data = await getBoardItems(
            boardId, // Dynamic board ID
            [personId], // Person ID
            boardsData[0].peopleColId, // People Column ID
            boardsData[0].statusColId, // Status Column ID
            boardsData[0].dateColId, // Date Column ID
            boardsData[0].priorityColId, // Priority Column ID
            boardsData[0].timeTrackingColId // Time Tracking Column ID
          );
          console.log(data);
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
 
          // Add enriched data to the global array
          allEnrichedData.push(...enrichedItems);
        }
 
        // Set data for all boards
        setBoardsItems(allEnrichedData); // Original data
        setEnrichedData(allEnrichedData); // Enriched data with profile pictures
 
        console.log("All Enriched Data:", allEnrichedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
 
    // Call the updated function
    fetchAllData();
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
