const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();
monday.setToken(
  "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjM3NjE1OTI3NywiYWFpIjoxMSwidWlkIjo2MTAxNzc2OCwiaWFkIjoiMjAyNC0wNi0yNFQxOTowNzozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODUyNzQ5NSwicmduIjoidXNlMSJ9.ZSI1v2UukqqA0DckP8jc6Xp2rNqvboN-X46VilNRL6E"
);

const getBoards = async () => {
  let query2 = `query {
    boards(limit: 500 workspace_ids: 8359320) {
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
  let response = await monday.api(query2);
  return response.data.boards;
};

const getPeopleColumns = async () => {
  const boards = await getBoards();
  let column_values = [];
  for (const board of boards) {
    let query = `query {
        boards(ids: ${board.id}) {
          columns(types: people) {
            id
            title
          }
        }
      }`;
    let response = await monday.api(query);
    column_values.push(response.data.boards[0].columns);
  }
  return column_values;
};

const getDateColumns = async () => {
  const boards = await getBoards();
  let column_values = [];
  for (const board of boards) {
    let query = `query {
        boards(ids: ${board.id}) {
          columns(types: date) {
            id
            title
          }
        }
      }`;
    let response = await monday.api(query);
    column_values.push(response.data.boards[0].columns);
  }
  return column_values;
};

const getStatusColumns = async () => {
  const boards = await getBoards();
  let column_values = [];
  for (const board of boards) {
    let query = `query {
        boards(ids: ${board.id}) {
          columns(types: date) {
            id
            title
          }
        }
      }`;
    let response = await monday.api(query);
    column_values.push(response.data.boards[0].columns);
  }
  return column_values;
};

const getPersonValues = async (PeopleIds, boardIds) => {
  let query = `query {
    boards(ids: ${boardIds}) {
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
    boards(ids: ${boardIds}) {
      name
      items_page(limit: 500) {
        items {
          column_values(ids: ${JSON.stringify(StatusIds)}) {
            ... on StatusValue {
              label_style {
                color
              }
              text
            }
          }
        }
      }
    }
  }`;
  let response = await monday.api(query);
  return response.data.boards;
};

const getDateValuesAndgetTimeTrackingValue = async (DateIds, boardIds) => {
  let query = `query {
    boards(ids: ${boardIds}) {
      name
      items_page(limit: 500) {
        items {
          column_values(ids: ${JSON.stringify(DateIds)}) {
            text
          }
        }
      }
    }
  }`;
  let response = await monday.api(query);
  return response.data.boards;
};

// Export all functions
module.exports = {
  getBoards,
  getPeopleColumns,
  getDateColumns,
  getStatusColumns,
  getPersonValues,
  getStatusValues,
  getDateValuesAndgetTimeTrackingValue,
};