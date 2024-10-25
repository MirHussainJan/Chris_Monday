import mondaySdk from "monday-sdk-js";
// const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();
// monday.setToken(
//   "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjM3NjE1OTI3NywiYWFpIjoxMSwidWlkIjo2MTAxNzc2OCwiaWFkIjoiMjAyNC0wNi0yNFQxOTowNzozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODUyNzQ5NSwicmduIjoidXNlMSJ9.ZSI1v2UukqqA0DckP8jc6Xp2rNqvboN-X46VilNRL6E"
// );

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

    //after we have all the users fetch user's profile pictures link
    const userIds = response.data.boards[0].items_page.items.map((item) => {
      // const peopleArray = item.column_values.find((colVal) =>
      //   colVal.hasOwnProperty("persons_and_teams")
      // ).map(person_team => );
      // return peopleArray;
    });
    console.log(userIds);

    // fully print the response object tot the console with max depth
    // console.dir(response, { depth: null });
    return response.data.boards[0].items_page.items;
  } catch (error) {
    console.error("Error: ", error);
    return [];
  }
};

const getProfilePictures = async (userIds) => {
  //construct query
  let query = `query {
                users(ids: [${userIds.map((id) => id).join(",")}]) {
                    id
                    name
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

export { getBoardItems };

//Board Selection is Necessary
