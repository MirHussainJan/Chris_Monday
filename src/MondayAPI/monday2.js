const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();
monday.setToken(
  "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjM3NjE1OTI3NywiYWFpIjoxMSwidWlkIjo2MTAxNzc2OCwiaWFkIjoiMjAyNC0wNi0yNFQxOTowNzozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODUyNzQ5NSwicmduIjoidXNlMSJ9.ZSI1v2UukqqA0DckP8jc6Xp2rNqvboN-X46VilNRL6E"
);

const getBoards = async () => {
  let query2 = `query
{
  boards(limit:500 workspace_ids: 8359320)
  {
    id
    name
}
}`;
  let response = await monday.api(query2);

  let boards = response.data.boards;
  const filteredBoards = boards.filter(
    (board, index, self) =>
      self.findIndex((b) => b.id === board.id) === index &&
      board.id !== "7574081999"
  );
  return filteredBoards;
};

const getBoardsData = async (boardIds) => {
  let query = `{
  boards(limit: 500, ids: ${JSON.stringify(boardIds)}) {
    id
    name
    items_page(limit: 500) {
      items {
        name
        group {
          title
        }
      }
    }
  }
}`;
  let response = await monday.api(query);
  return response.data.boards;
};

const getPeopleColumns = async (boardIds) => {
  let query = `query {
        boards(ids: ${JSON.stringify(boardIds)}) {
          columns(types: people) {
            id
            title
          }
        }
      }`;
  let response = await monday.api(query);
  return response.data.boards;
};
const getDateColumns = async (boardIds) => {
  let query = `query {
          boards(ids: ${JSON.stringify(boardIds)}) {
            columns(types: date) {
              id
              title
            }
          }
        }`;
  let response = await monday.api(query);
  return response.data.boards;
};
const getStatusColumns = async (boardIds) => {
  // Execute queries for each board and get people columns
  let query = `query {
          boards(ids: ${JSON.stringify(boardIds)}) {
            columns(types: status) {
              id
              title
            }
          }
        }`;
  let response = await monday.api(query);
  console.log(response);
  return response.data.boards;
};
const getTimeTrackingColmns = async (boardIds) => {
  // Execute queries for each board and get people columns
  let query = `query {
          boards(ids: ${JSON.stringify(boardIds)}) {
            columns(types: time_tracking) {
              id
              title
            }
          }
        }`;
  let response = await monday.api(query);
  return response.data.boards;
};
const getPersonValues = async (PeopleIds, boardIds) => {
  let query = `query {
    boards(ids: ${JSON.stringify(boardIds)}) {
      items_page(limit: 500) {
        items {
          column_values(ids: ${JSON.stringify(PeopleIds)}) {
            ... on PeopleValue {
              text
              persons_and_teams {
                id
                kind
              }
            }
          }
        }
      }
    }
  }`;
  let response = await monday.api(query);
  return response.data.boards;
};

const getStatusValues = async (StatusIds, boardIds) => {
  let query = `query {
  boards(ids: ${JSON.stringify(boardIds)}) {
    name
    items_page(limit: 500)
    {
    items {
      column_values(ids: ${JSON.stringify(StatusIds)}) {
        ... on StatusValue
        {
          label_style{
            color
          }
 				text
        }
        
      }
    }
  }
}
}`;
  // Make the API request
  let response = await monday.api(query);
  return response.data.boards;
};

const getDateValuesAndgetTimeTrackingValue = async (DateIds, boardIds) => {
  let query = `query {
  boards(ids: ${JSON.stringify(boardIds)}) {
    name
    items_page(limit: 500)
    {
    items {
      column_values(ids: ${JSON.stringify(DateIds)}) {
        text
        
      }
    }
  }
}
}`;
  // Make the API request
  let response = await monday.api(query);
  return response.data.boards;
};

const main = async () => {
  let final = await getBoardsData([7574082160, 8144290011]);
  console.dir(final, { depth: null });
};
main();
