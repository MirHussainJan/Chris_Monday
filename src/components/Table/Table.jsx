import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import {
  Table as MondayTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Label,
  AvatarGroup,
  Avatar,
} from "monday-ui-react-core";
import SkeletonLoader from "./SkeletonLoader";
import "monday-ui-react-core/dist/main.css";
import "tailwindcss/tailwind.css";

import {
  getBoardsData,
  getPersonValues,
  getStatusValues,
  getDateValues,
  getTimeTrackingValues,
  getProfilePhotosfromResponse,
} from "../../MondayAPI/monday2";

const Table = ({
  boardIds,
  selectedPeopleColumns,
  enrichedData,
  setEnrichedData,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState({});
  const defaultColumns = [
    { id: "name", title: "Item Name" },
    { id: "group", title: "Group" },
    { id: "boardtitle", title: "Board" },
    { id: "people", title: "People" },
    { id: "date", title: "Date" },
    { id: "status", title: "Status" },
    { id: "priority", title: "Priority" },
    { id: "timeTracking", title: "Time Tracking" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const parsedColumns = selectedPeopleColumns.map((col) => {
    const [type, boardId, columnId] = col.split("@");
    return { type, boardId, columnId, title: columnId };
  });

  const columns = [...defaultColumns];

  useEffect(() => {
    const fetchData = async () => {
      if (boardIds.length > 0) {
        setLoading(true);
        try {
          const boardData = await getBoardsData(boardIds);
          const mergedData = boardData.reduce((acc, board) => {
            if (board.items_page) {
              acc.push(
                ...board.items_page.items.map((item) => ({
                  ...item,
                  boardId: board.id,
                  boardname: board.name,
                }))
              );
            }
            return acc;
          }, []);
          setData(mergedData);

          if (selectedPeopleColumns.length > 0) {
            const columnBoardMapping = parsedColumns.map(
              ({ type, boardId, columnId }) => ({
                type,
                boardId,
                columnId,
              })
            );

            const personColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("person")
            );
            const dateColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("date")
            );
            const timeTrackingColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("timeTracking")
            );
            const statusColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("status")
            );
            const priorityColumns = columnBoardMapping.filter(({ columnId }) =>
              columnId.includes("priority")
            );

            const personValues = personColumns.length
              ? await getPersonValues(
                  personColumns.map((c) => c.columnId),
                  personColumns.map((c) => c.boardId)
                )
              : [];

            const profilePhotosResponse = await getProfilePhotosfromResponse(
              personValues
            );

            const photos = profilePhotosResponse.reduce((acc, profile) => {
              acc[profile.id] = profile.photo_thumb_small;
              return acc;
            }, {});

            setPhotos(photos);

            const dateValues = dateColumns.length
              ? await getDateValues(
                  dateColumns.map((c) => c.columnId),
                  dateColumns.map((c) => c.boardId)
                )
              : [];

            const timeTrackingValues = timeTrackingColumns.length
              ? await getTimeTrackingValues(
                  timeTrackingColumns.map((c) => c.columnId),
                  timeTrackingColumns.map((c) => c.boardId)
                )
              : [];

            const statusValues = statusColumns.length
              ? await getStatusValues(
                  statusColumns.map((c) => c.columnId),
                  statusColumns.map((c) => c.boardId)
                )
              : [];

            const priorityValues = priorityColumns.length
              ? await getStatusValues(
                  priorityColumns.map((c) => c.columnId),
                  priorityColumns.map((c) => c.boardId)
                )
              : [];

            const mapping = {};

            personColumns.forEach(({ columnId, boardId }) => {
              console.log(personValues, "For now");
            
              personValues.forEach((board) => {
                board.items_page.items.forEach((item) => {
                  const itemId = item.id;
            
                  if (!mapping[itemId]) mapping[itemId] = {};
            
                  item.column_values.forEach((col) => {
                    if (col.id === columnId) {
                      const personIds = col.persons_and_teams || [];
            
                      const value = personIds.map((person) => ({
                        id: person.id,
                        name: col.text || person.name,
                        photo: photos[person.id] || null,
                      }));
            
                      mapping[itemId][`person@${boardId}@${columnId}`] = {
                        value,
                      };
                    }
                  });
                });
              });
            });
                       

            dateValues.forEach((board) => {
              board.items_page.items.forEach((item) => {
                const itemId = item.id;
                if (!mapping[itemId]) mapping[itemId] = {};
                item.column_values.forEach((col) => {
                  const key = `date@${board.id}@${col.id}`;
                  mapping[itemId][key] = col.text || "-";
                });
              });
            });

            timeTrackingValues.forEach((board) => {
              board.items_page.items.forEach((item) => {
                const itemId = item.id;
                if (!mapping[itemId]) mapping[itemId] = {};
                item.column_values.forEach((col) => {
                  const key = `timeTracking@${board.id}@${col.id}`;
                  mapping[itemId][key] = formatDuration(
                    col.additional_info?.tracked_seconds || 0
                  );
                });
              });
            });

            statusValues.forEach((board) => {
              board.items_page.items.forEach((item) => {
                const itemId = item.id;
                if (!mapping[itemId]) mapping[itemId] = {};
                item.column_values.forEach((col) => {
                  const key = `status@${board.id}@${col.id}`;
                  mapping[itemId][key] = col.text || "-";
                });
              });
            });

            priorityValues.forEach((board) => {
              board.items_page.items.forEach((item) => {
                const itemId = item.id;
                if (!mapping[itemId]) mapping[itemId] = {};
                item.column_values.forEach((col) => {
                  const key = `priority@${board.id}@${col.id}`;
                  mapping[itemId][key] = col.text || "-";
                });
              });
            });

            const enrichedData = mergedData.map((item) => ({
              ...item,
              enrichedColumns: mapping[item.id] || {},
            }));

            setEnrichedData(enrichedData);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [boardIds, selectedPeopleColumns]);

  const renderPersonCell = (enrichedColumns) => {
    const columnKeys = Object.keys(enrichedColumns).filter((key) =>
      key.startsWith("person@")
    );
    if (columnKeys.length > 0) {
      const persons = enrichedColumns[columnKeys[0]].value;
      console.log("Persons",persons)
      return (
        <AvatarGroup max={3} size="medium">
          {persons.map((person) => (
            <Avatar
              key={person.id}
              src={person.photo}
              ariaLabel={person.name || "Unknown"}
              type="img"
              fallbackIcon={<FaUsers />}
            />
          ))}
        </AvatarGroup>
      );
    }
    return "-";
  };

  const renderDateCell = (enrichedColumns) => {
    const columnKeys = Object.keys(enrichedColumns).filter((key) =>
      key.startsWith("date@")
    );
    const dateValue = columnKeys.length > 0 ? enrichedColumns[columnKeys[0]] : null;
    return dateValue ? <Label text={formatDate(dateValue)} /> : "-";
  };

  const renderTimeTrackingCell = (enrichedColumns) => {
    const columnKeys = Object.keys(enrichedColumns).filter((key) =>
      key.startsWith("time_tracking@")
    );
    return columnKeys.length > 0
      ? enrichedColumns[columnKeys[0]]
      : "-";
  };

  const renderStatusCell = (enrichedColumns) => {
    const columnKeys = Object.keys(enrichedColumns).filter((key) =>
      key.startsWith("status@")
    );
    return columnKeys.length > 0
      ? enrichedColumns[columnKeys[0]]
      : "-";
  };

  const renderPriorityCell = (enrichedColumns) => {
    const columnKeys = Object.keys(enrichedColumns).filter((key) =>
      key.startsWith("priority@")
    );
    return columnKeys.length > 0
      ? enrichedColumns[columnKeys[0]]
      : "-";
  };

  return (
    <div className="flex flex-col items-center">
      <MondayTable
        columns={columns}
        className="w-full border border-gray-300 rounded-lg overflow-hidden"
      >
        <TableHeader>
          {columns.map((col) => (
            <TableHeaderCell
              key={col.id}
              title={col.title}
              className="flex justify-center font-semibold text-sm"
            />
          ))}
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="bg-gray-50">
                  {defaultColumns.map((col) => (
                    <TableCell key={col.id} className="border-b border-r">
                      <SkeletonLoader />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((item, index) => {
                const enrichedColumns =
                  enrichedData.find((p) => p.id === item.id)?.enrichedColumns ||
                  {};
                return (
                  <TableRow
                    key={item.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <TableCell className="border border-gray flex justify-center">{item.name || "-"}</TableCell>
                    <TableCell className="border border-gray flex justify-center">
                      <Label text={item.group?.title || "-"} />
                    </TableCell>
                    <TableCell className="border border-gray flex justify-center">{item.boardname || "-"}</TableCell>
                    <TableCell className="border border-gray flex justify-center">{renderPersonCell(enrichedColumns)}</TableCell>
                    <TableCell className="border border-gray flex justify-center">{renderDateCell(enrichedColumns)}</TableCell>
                    <TableCell className="border border-gray flex justify-center">{renderStatusCell(enrichedColumns)}</TableCell>
                    <TableCell className="border border-gray flex justify-center">{renderPriorityCell(enrichedColumns)}</TableCell>
                    <TableCell className="border border-gray flex justify-center">{renderTimeTrackingCell(enrichedColumns)}</TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </MondayTable>
    </div>
  );
};

export default Table;