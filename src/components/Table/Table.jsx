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
import { useEffect } from "react";
const columns = [
  {
    id: "name",
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
const Table = ({ data }) => {
  useEffect(() => {
    console.log("From Table:",data);
  }, [data]);

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
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Label
                  text={item.group.title}
                  className={`color-${item.group.color}`}
                />
              </TableCell>
              <TableCell>{item.board.name}</TableCell>
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
                      src={item.people.photo_thumb}
                      ariaLabel={item.people.text}
                      tooltipProps={{
                        content: <span>{item.people.text}</span>,
                        position: Tooltip.positions.BOTTOM,
                      }}
                    />
                  </AvatarGroup>
                </Flex>
              </TableCell>
              <TableCell>
                <Label
                  text={new Date(item.date)
                    .toDateString()
                    .split(" ")
                    .slice(1)
                    .join(" ")}
                  color="primary"
                />
              </TableCell>
              <TableCell
                style={{
                  backgroundColor: item.status.color
                }}
                className="padding-status"
              >
                <Text
                  color="onInverted"
                  style={{ color: item.status.color ? "white" : "black" }}
                >
                  {item.status.text}
                </Text>
              </TableCell>
              <TableCell
                style={{
                  backgroundColor: item.priority.color || "transparent",
                }}
                className="padding-status"
              >
                <Text
                  color="onInverted"
                  style={{ color: item.priority.color ? "white" : "black" }}
                >
                  {item.priority.text}
                </Text>
              </TableCell>
              <TableCell>
                <Text>
                  {item.timeTracking.reduce((prev, curr) => {
                    if (
                      curr.started_user_id === item.people.id &&
                      curr.ended_user_id === item.people.id
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