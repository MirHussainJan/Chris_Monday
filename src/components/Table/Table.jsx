import {
  Table as MondayTable,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Label,
  Text,
  AvatarGroup,
  Avatar,
  Flex,
  Tooltip,
} from "monday-ui-react-core";
import TableEmptyState from "./TableEmptyState";
import TableErrorState from "./TableErrorState";

const columns = [
  {
    id: "itemName",
    infoContent: "Item Name",
    loadingStateType: "medium-text",
    title: "Sent on",
    width: {
      min: 120,
    },
  },
  {
    id: "group",
    infoContent: "Group Name",
    loadingStateType: "medium-text",
    title: "Status",
    width: {
      max: 142,
      min: 84,
    },
  },
  {
    id: "Board",
    infoContent: "Board Name",
    loadingStateType: "circle",
    title: "Sent by",
    width: {
      max: 185,
      min: 84,
    },
  },
  {
    id: "people",
    infoContent: "People Name",
    loadingStateType: "medium-text",
    title: "Status",
    width: {
      max: 200,
      min: 96,
    },
  },
  {
    id: "date",
    infoContent: "Date",
    loadingStateType: "medium-text",
    title: "Status",
    width: {
      max: 200,
      min: 96,
    },
  },
  {
    id: "status",
    infoContent: "Status",
    loadingStateType: "medium-text",
    title: "Status",
    width: {
      max: 200,
      min: 96,
    },
  },
  {
    id: "priority",
    infoContent: "Priority",
    loadingStateType: "medium-text",
    title: "Status",
    width: {
      max: 200,
      min: 96,
    },
  },
  {
    id: "timeTracking",
    infoContent: "Time Tracking",
    loadingStateType: "medium-text",
    title: "Status",
    width: {
      max: 200,
      min: 96,
    },
  },
];

const tableData = [
  {
    id: "1",
    itemName: "Item 1",
    group: {
      id: "group_1",
      text: "Group 1",
      color: "blue",
    },
    board: "Board 1",
    people: {
      id: "20973674",
      text: "Christopher Heiman",
      photo_thumb:
        "https://files.monday.com/use1/photos/20973674/thumb/20973674-user_photo_2023_10_30_18_39_16.png?1698691157",
    },
    date: "2021-06-01",
    status: {
      id: "status_1",
      text: "Done",
      color: "blue",
    },
    priority: {
      id: "priority_1",
      text: "High",
      color: "red",
    },
    timeTracking: [
      {
        started_user_id: "20973674",
        ended_user_id: "20973674",
        started_at: "2024-10-09T10:00:00+00:00",
        ended_at: "2024-10-09T11:00:00+00:00",
      },
    ],
  },
  {
    id: "2",
    itemName: "Item 2",
    group: {
      id: "group_2",
      text: "Group 2",
      color: "green",
    },
    board: "Board 2",
    people: {
      id: "20973674",
      text: "Christopher Heiman",
      photo_thumb:
        "https://files.monday.com/use1/photos/20973674/thumb/20973674-user_photo_2023_10_30_18_39_16.png?1698691157",
    },
    date: "2021-06-02",
    status: {
      id: "status_2",
      text: "Working on it",
      color: "blue",
    },
    priority: {
      id: "priority_2",
      text: "Low",
      color: "yellow",
    },
    timeTracking: [
      {
        started_user_id: "20973674",
        ended_user_id: "20973674",
        started_at: "2024-10-09T10:00:00+00:00",
        ended_at: "2024-10-09T11:00:00+00:00",
      },
    ],
  },
  {
    id: "2",
    itemName: "Item 2",
    group: {
      id: "group_2",
      text: "Group 2",
      color: "green",
    },
    board: "Board 2",
    people: {
      id: "20973674",
      text: "Christopher Heiman",
      photo_thumb:
        "https://files.monday.com/use1/photos/20973674/thumb/20973674-user_photo_2023_10_30_18_39_16.png?1698691157",
    },
    date: "2021-06-02",
    status: {
      id: "status_2",
      text: "Working on it",
      color: "purple",
    },
    priority: {
      id: "priority_2",
      text: "Low",
      color: "blue",
    },
    timeTracking: [
      {
        started_user_id: "20973674",
        ended_user_id: "20973674",
        started_at: "2024-10-09T10:00:00+00:00",
        ended_at: "2024-10-09T11:00:00+00:00",
      },
    ],
  },
];

const Table = () => {
  return (
    <>
      <MondayTable
        columns={columns}
        emptyState={<TableEmptyState />}
        errorState={<TableErrorState />}
      >
        <TableHeader>
          <TableHeaderCell
            title="Item Name"
            onSortClicked={(direction) => {}}
          />
          <TableHeaderCell title="Group" onSortClicked={(direction) => {}} />
          <TableHeaderCell title="Board" onSortClicked={(direction) => {}} />
          <TableHeaderCell title="People" onSortClicked={(direction) => {}} />
          <TableHeaderCell title="Date" onSortClicked={(direction) => {}} />
          <TableHeaderCell title="Status" onSortClicked={(direction) => {}} />
          <TableHeaderCell title="Priority" onSortClicked={(direction) => {}} />
          <TableHeaderCell
            title="Time Tracking"
            onSortClicked={(direction) => {}}
          />
        </TableHeader>
        <TableBody>
          {tableData.map((data) => (
            <TableRow key={data.id}>
              <TableCell>{data.itemName}</TableCell>
              <TableCell>
                <Label
                  text={data.group.text}
                  className={`color-${data.group.color}`}
                />
              </TableCell>
              <TableCell>{data.board}</TableCell>
              <TableCell>
                <Flex
                  direction={Flex.directions.COLUMN}
                  gap={Flex.gaps.LARGE}
                  align={Flex.align.START}
                >
                  <AvatarGroup
                    size={Avatar.sizes.SMALL}
                    type={Avatar.types.IMG}
                    max={4}
                    removePadding={true}
                  >
                    <Avatar
                      type={Avatar.types.IMG}
                      src={data.people.photo_thumb}
                      ariaLabel={data.people.text}
                      tooltipProps={{
                        content: <span>{data.people.text}</span>,
                        position: Tooltip.positions.BOTTOM,
                      }}
                    />
                    <Avatar
                      type={Avatar.types.IMG}
                      src={data.people.photo_thumb}
                      ariaLabel={data.people.text}
                      tooltipProps={{
                        content: <span>{data.people.text}</span>,
                        position: Tooltip.positions.BOTTOM,
                      }}
                    />
                    <Avatar
                      type={Avatar.types.IMG}
                      src={data.people.photo_thumb}
                      ariaLabel={data.people.text}
                      tooltipProps={{
                        content: <span>{data.people.text}</span>,
                        position: Tooltip.positions.BOTTOM,
                      }}
                    />
                  </AvatarGroup>
                </Flex>
              </TableCell>
              <TableCell>
                <Label
                  text={new Date(data.date)
                    .toDateString()
                    .split(" ")
                    .slice(1)
                    .join(" ")}
                  color="primary"
                />
              </TableCell>
              <TableCell className="padding-status">
                <Text
                  color="onInverted"
                  className={`statusText background-${data.status.color}`}
                >
                  {data.status.text}
                </Text>
              </TableCell>
              <TableCell className="padding-status">
                <Text
                  color="onInverted"
                  className={`statusText background-${data.priority.color}`}
                >
                  {data.priority.text}
                </Text>
              </TableCell>
              <TableCell>
                <Text>
                  {data.timeTracking.reduce((prev, curr) => {
                    if (
                      curr.started_user_id === data.people.id &&
                      curr.ended_user_id === data.people.id
                    ) {
                      return (
                        prev +
                        (new Date(curr.ended_at) - new Date(curr.started_at))
                      );
                    }
                    return prev;
                  }, 0) /
                    1000 /
                    60 /
                    60}{" "}
                  Hours
                </Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MondayTable>
    </>
  );
};

export default Table;
