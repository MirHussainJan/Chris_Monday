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
    title: "Item Name",
    width: {
      min: 120,
    },
  },
  {
    id: "group",
    infoContent: "Group Name",
    loadingStateType: "medium-text",
    title: "Group",
    width: {
      max: 142,
      min: 84,
    },
  },
  {
    id: "board",
    infoContent: "Board Name",
    loadingStateType: "circle",
    title: "Board",
    width: {
      max: 185,
      min: 84,
    },
  },
  {
    id: "people",
    infoContent: "People Name",
    loadingStateType: "medium-text",
    title: "People",
    width: {
      max: 200,
      min: 96,
    },
  },
  {
    id: "date",
    infoContent: "Date",
    loadingStateType: "medium-text",
    title: "Date",
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
    title: "Priority",
    width: {
      max: 200,
      min: 96,
    },
  },
  {
    id: "timeTracking",
    infoContent: "Time Tracking",
    loadingStateType: "medium-text",
    title: "Time Tracking",
    width: {
      max: 200,
      min: 96,
    },
  },
];

const Table = ({ data }) => {
  useEffect(() => {
    console.log("From Table:", data);
  }, [data]);

  return (
    <MondayTable
      columns={columns}
      emptyState={<TableEmptyState />}
      errorState={<TableErrorState />}
    >
      <TableHeader>
        {columns.map((col) => (
          <TableHeaderCell
            key={col.id}
            title={col.title}
            onSortClicked={() => {}}
          />
        ))}
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
              <AvatarGroup size={Avatar.sizes.SMALL} max={4}>
                {item.people.map((person) => (
                  <Avatar
                    key={person.id}
                    type={Avatar.types.IMG}
                    src={person.profile_picture}
                    ariaLabel={person.name}
                    tooltipProps={{
                      content: <span>{person.name}</span>,
                      position: Tooltip.positions.BOTTOM,
                    }}
                  />
                ))}
              </AvatarGroup>
            </TableCell>
            <TableCell>
              <Label
                text={new Date(item.date).toDateString()}
                color="primary"
              />
            </TableCell>
            {/* Status Column */}
            <TableCell
              style={{
                backgroundColor: item.status?.color || "#f0f0f0", // Default color if no color is provided
              }}
              className="padding-status"
            >
              <Text
                color={item.status?.color}
                style={{
                  backgroundColor: item.status?.color || "#f0f0f0", // Default color if no color is provided
                }}
              >
                {item.status?.text || "No Status"}
              </Text>
            </TableCell>

            {/* Priority Column */}
            <TableCell
              style={{
                backgroundColor: item.priority?.color || "#000000", // Default color if no color is provided
              }}
              className="padding-status"
            >
              <Text
                color="onInverted"
                style={{ color: item.priority?.color ? "white" : "black" }}
              >
                {item.priority?.text || "No Priority"}
              </Text>
            </TableCell>

            <TableCell>
              <Text>
                {(
                  item.timeTracking.reduce((prev, curr) => {
                    if (
                      curr.started_user_id === item.people[0]?.id &&
                      curr.ended_user_id === item.people[0]?.id
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
                  60
                ).toFixed(2)}{" "}
                Hours
              </Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </MondayTable>
  );
};

export default Table;