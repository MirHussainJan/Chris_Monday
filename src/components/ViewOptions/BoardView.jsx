import React, { useState } from "react";
import "monday-ui-react-core/dist/main.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import Text from "monday-ui-react-core/dist/Text";
import Table from "../Table/Table";

const BoardView = ({ data }) => {
  const [expandedBoard, setExpandedBoard] = useState(null);

  const toggleBoard = (boardName) => {
    setExpandedBoard(expandedBoard === boardName ? null : boardName);
  };

  // Get unique boards from the data
  const uniqueBoards = [...new Set(data.map((item) => item.board.name))];

  return (
    <div className="p-6">
      {uniqueBoards.map((boardName, index) => {
        // Filter items for the current board
        const boardData = data.filter((item) => item.board.name === boardName);

        return (
          <div key={index} className="pb-4 mb-4">
            {/* Board Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleBoard(boardName)}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`${
                    expandedBoard === boardName ? "rotate-90" : ""
                  } transform text-xl text-gray-700`}
                >
                  <MdKeyboardArrowRight />
                </span>
                <Text
                  size="lg"
                  className={`${
                    expandedBoard === boardName
                      ? "font-bold text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {boardName}
                </Text>
                <Text size="sm" className="text-gray-500">
                  {`${boardData.length} items`}
                </Text>
              </div>
            </div>

            {/* Expanded Board Details */}
            {expandedBoard === boardName && (
              <div className="mt-4">
                <Table data={boardData} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BoardView;
