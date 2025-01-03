import mondaySdk from "monday-sdk-js";
// const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();
monday.setToken(
  "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjM3NjE1OTI3NywiYWFpIjoxMSwidWlkIjo2MTAxNzc2OCwiaWFkIjoiMjAyNC0wNi0yNFQxOTowNzozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODUyNzQ5NSwicmduIjoidXNlMSJ9.ZSI1v2UukqqA0DckP8jc6Xp2rNqvboN-X46VilNRL6E"
);

const getBoards = async () =>
{
  let monday_query =`query
{
  boards(workspace_ids:8359320)
  {
    id
    name
}
}
}`
  let response = await monday.api(monday_query)
  let BoardsData = []
  console.log("Boards: ",response.data.boards)
  response.data.boards.forEach(board => {
    if(board.id != "7574081999")
    {
    BoardsData.push(board.id)
    }
  })
return BoardsData  
}

//function to get the board items
const getBoardItems = async (
  boardId = "",
  userIds = [],
  peopleColId = "",
  statusColId = "",
  dateColId = "",
  priorityColId = "",
  timeTrackingColId = ""
) => {
  //check board id exist
  if (boardId === "") {
    return [];
  }

  //construct board part of query
  let query = `query {
                complexity {
                    query
                }
                boards(ids: ${boardId}) {`;

  if (peopleColId && userIds.length !== 0) {
    //construct item part of query - with user filter
    query += `items_page(query_params: {rules: {column_id: "${peopleColId}", compare_value: [${userIds.map(
      (id) => `"person-${id}"`
    )}], operator: any_of}}) {
                items {
                    id
                    name
                    group {
                        title
                        id
                        color
                    }
                    board {
                        id
                        name
                    }`;
  } else {
    //construct item part of query - without user filter
    query += `items_page {
                items {
                    id
                    group {
                        title
                        id
                        color
                    }
                    board {
                        id
                        name
                    }`;
  }

  if (
    statusColId ||
    dateColId ||
    priorityColId ||
    timeTrackingColId ||
    peopleColId
  ) {
    query += `
        column_values(ids: [${peopleColId ? `"${peopleColId}", ` : ""}${
      statusColId ? `"${statusColId}", ` : ""
    }${priorityColId ? `"${priorityColId}", ` : ""}${
      dateColId ? `"${dateColId}", ` : ""
    }${timeTrackingColId ? `"${timeTrackingColId}", ` : ""}]) {
        id
        ...on StatusValue {
            label_style {
                color
            }
            text
        }
        ...on DateValue {
            text
        }
        ...on TimeTrackingValue {
            history {
                started_user_id
                ended_user_id
                started_at
                ended_at
            }
        }
        ...on PeopleValue {
        text
            persons_and_teams {
                id
                kind
            }    
        }
    }`;
  } else {
  }

  query += `}}}}`;

  try {
    const response = await monday.api(query);

    /** 
    //after we have all the users fetch user's profile pictures link
    // Extract all unique people and teams IDs
    // const items = response.data.boards[0].items_page.items;
    // const uniquePeopleAndTeamsMap = new Map();

    // items.forEach((item) => {
    //   const peopleColVal = item.column_values.find((colVal) =>
    //     colVal.hasOwnProperty("persons_and_teams")
    //   );

    //   if (peopleColVal && peopleColVal.persons_and_teams) {
    //     peopleColVal.persons_and_teams.forEach((personOrTeam) => {
    //       uniquePeopleAndTeamsMap.set(personOrTeam.id, personOrTeam);
    //     });
    //   }
    // });

    // const uniquePeopleAndTeams = Array.from(uniquePeopleAndTeamsMap.values());

    // // Split into people and teams
    // const uniquePeople = uniquePeopleAndTeams.filter(
    //   (item) => item.kind === "person"
    // );
    // const uniqueTeams = uniquePeopleAndTeams.filter(
    //   (item) => item.kind === "team"
    // );

    // // Fetch profile pictures in parallel
    // const [usersProfilePictures, teamProfilePictures] = await Promise.all([
    //   getProfilePicturesOfUsers(uniquePeople.map((item) => item.id)),
    //   getProfilePicturesOfTeams(uniqueTeams.map((item) => item.id)),
    // ]);

    // // Create a map for profile pictures
    // const profilePicturesMap = new Map();

    // [...usersProfilePictures, ...teamProfilePictures].forEach((profile) => {
    //   profilePicturesMap.set(profile.id, profile);
    // });

    // // Update items with profile pictures
    // const updatedItems = items.map((item) => {
    //   const updatedColumnValues = item.column_values.map((colVal) => {
    //     if (colVal.hasOwnProperty("persons_and_teams")) {
    //       const updatedPersonsAndTeams = colVal.persons_and_teams.map(
    //         (personOrTeam) => {
    //           const profile = profilePicturesMap.get(personOrTeam.id);
    //           return {
    //             ...personOrTeam,
    //             profile_picture:
    //               profile?.photo_thumb_small || profile?.picture_url || null,
    //           };
    //         }
    //       );

    //       return {
    //         ...colVal,
    //         persons_and_teams: updatedPersonsAndTeams,
    //       };
    //     }
    //     return colVal;
    //   });

    //   return {
    //     ...item,
    //     column_values: updatedColumnValues,
    //   };
    // });
    // console.log("updatedItems", updatedItems);

    **/
    // Extract items from the response
    const items = response.data.boards[0].items_page.items;

    // Initialize a Set to collect unique person and team IDs
    const uniquePeopleAndTeamsSet = new Set();

    // Prepare updated items array
    const updatedItems = items.map((item) => {
      // Create a new item object without column_values
      const newItem = {
        id: item.id,
        name: item.name,
        group: item.group,
        board: item.board,
      };

      // Extract column_values
      const columnValues = item.column_values;

      // Process columns
      columnValues.forEach((colVal) => {
        // Check if colVal.id matches any of the column IDs
        if (colVal.id === peopleColId && colVal.persons_and_teams) {
          // Process people column
          newItem.people = colVal.persons_and_teams.map((personOrTeam) => {
            // Add ID and kind to unique set
            uniquePeopleAndTeamsSet.add(
              JSON.stringify({ id: personOrTeam.id, kind: personOrTeam.kind })
            );
            // We will fill in profile_picture later
            return {
              id: personOrTeam.id,
              kind: personOrTeam.kind,
              text: colVal.text,
            };
          });
        } else if (colVal.id === statusColId) {
          // Process status column
          newItem.status = {
            id: colVal.id,
            text: colVal.text,
            color: colVal.label_style?.color,
          };
        } else if (colVal.id === dateColId) {
          // Process date column
          newItem.date = colVal.text || null; // Assuming the date is in text property
        } else if (colVal.id === priorityColId) {
          // Process priority column
          newItem.priority = {
            id: colVal.id,
            text: colVal.text,
            color: colVal.label_style?.color,
          };
        } else if (colVal.id === timeTrackingColId) {
          // Process time tracking column
          newItem.timeTracking = colVal.history || []; // Assuming history is an array
        }
      });

      return newItem;
    });

    // Convert uniquePeopleAndTeamsSet to an array
    const uniquePeopleAndTeams = Array.from(uniquePeopleAndTeamsSet).map(
      (str) => JSON.parse(str)
    );

    // Split into uniquePeople and uniqueTeams
    const uniquePeople = uniquePeopleAndTeams.filter(
      (item) => item.kind === "person"
    );
    const uniqueTeams = uniquePeopleAndTeams.filter(
      (item) => item.kind === "team"
    );

    // Fetch profile pictures
    const [usersProfilePictures, teamProfilePictures] = await Promise.all([
      getProfilePicturesOfUsers(uniquePeople.map((item) => item.id)),
      getProfilePicturesOfTeams(uniqueTeams.map((item) => item.id)),
    ]);

    // Create a map for profile pictures
    const profilePicturesMap = new Map();

    // Map user profile pictures
    usersProfilePictures.forEach((profile) => {
      profilePicturesMap.set(profile.id, profile.photo_thumb_small);
    });

    // Map team profile pictures
    teamProfilePictures.forEach((profile) => {
      profilePicturesMap.set(profile.id, profile.picture_url);
    });

    // Now, update the people array in each item to include profile_picture
    const finalItems = updatedItems.map((item) => {
      if (item.people) {
        item.people = item.people.map((personOrTeam) => {
          return {
            ...personOrTeam,
            profile_picture: profilePicturesMap.get(personOrTeam.id) || null,
          };
        });
      }
      return item;
    });

    // Now, finalItems is the array of items with the desired structure

    console.log("items", finalItems);

    return finalItems;
  } catch (error) {
    console.error("Error: ", error);
    return [];
  }
};

//function to get the profile pictures of users
const getProfilePicturesOfUsers = async (userIds) => {
  //construct query
  let query = `query {
                users(limit: 500 ids: [${userIds.map((id) => id).join(",")}]) {
                  id
                  photo_thumb_small
                }
              }`;

  try {
    const response = await monday.api(query);
    return response.data.users;
  } catch (error) {
    console.error("Error: ", error);
    return [];
  }
};

//function to get the profile pictures of teams
const getProfilePicturesOfTeams = async (teamIds) => {
  //construct query
  let query = `query {
                teams(ids: [${teamIds.map((id) => id).join(",")}]) {
                  id
                  picture_url
                }
              }`;

  try {
    const response = await monday.api(query);
    return response.data.teams;
  } catch (error) {
    console.error("Error: ", error);
    return [];
  }
};

//test call of funciton
// getBoardItems(
//   7574082160,
//   [61017768],
//   "person",
//   "status",
//   "date4",
//   "status_1__1",
//   "time_tracking__1"
// );

export { getBoardItems, getProfilePicturesOfUsers, getProfilePicturesOfTeams, getBoards as getBoards};

//Board Selection is Necessary