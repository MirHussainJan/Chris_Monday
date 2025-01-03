import React from "react";
import {
  Dropdown,
  Text,
  Checkbox,
  Accordion,
  AccordionItem,
  Search,
  Button
} from "monday-ui-react-core";
import { FaCalendarAlt } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export default function CustomizationSidebar({ onClose }) {
  return (
    <div className="fixed top-0 right-0 w-[340px] h-full bg-white shadow-2xl p-4 z-50 overflow-y-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <Text type={Text.types.H4} weight={Text.weights.BOLD}>
          Customize
        </Text>
        <Button kind={Button.kinds.TERTIARY} onClick={onClose}>
          <RxCross2 />
        </Button>
      </div>

      {/* People Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="People">
            <Text>Whose items should we show?</Text>
            <Dropdown
              placeholder="Select a person"
              options={[]} // Map to the function returning people data dynamically
              onChange={() => {}} // Replace with desired onChange logic
              value={null}
            />
          </AccordionItem>
        </Accordion>
      </div>

      {/* Boards Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Boards">
            <Text className="text-md mb-4 font-bold">
              Which boards should we show?
            </Text>
            <div className="pl-3">
              {/* Map to the function returning boards dynamically */}
              {[].map((board) => (
                <div key={board.id} className="mb-2">
                  <Checkbox label={board.name} />
                </div>
              ))}
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Columns Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Date Column">
            <Text className="text-md mb-4 font-bold">
              Which board columns should we show?
            </Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={() => {}} // Replace with desired onChange logic
            />
            {[].map((board, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{board.name}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={[]} // Map to the function returning date columns dynamically
                  onChange={() => {}} // Replace with desired onChange logic
                  value={null}
                />
              </div>
            ))}
          </AccordionItem>
        </Accordion>
      </div>

      {/* Status Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Status Column">
            <Text className="text-md mb-4 font-bold">
              Which status column should we show?
            </Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={() => {}} // Replace with desired onChange logic
            />
            {[].map((board, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{board.name}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={[]} // Map to the function returning status columns dynamically
                  onChange={() => {}} // Replace with desired onChange logic
                  value={null}
                />
              </div>
            ))}
          </AccordionItem>
        </Accordion>
      </div>

      {/* Time Tracking Section */}
      <div className="mt-4">
        <Accordion>
          <AccordionItem title="Time Tracking Column">
            <Text className="text-md mb-4 font-bold">
              Which time tracking column should we show?
            </Text>
            <Search
              placeholder="Search Column"
              size="small"
              onChange={() => {}} // Replace with desired onChange logic
            />
            {[].map((board, index) => (
              <div key={index} className="mt-3">
                <Text type={Text.types.H6}>{board.name}</Text>
                <Dropdown
                  placeholder="Select a column"
                  options={[]} // Map to the function returning time tracking data dynamically
                  onChange={() => {}} // Replace with desired onChange logic
                  value={null}
                />
              </div>
            ))}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}