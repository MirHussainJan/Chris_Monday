// import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Search Bar Skeleton */}
      <div className="h-10 w-full max-w-md bg-gray-300 rounded-md animate-pulse"></div>

      {/* Dropdown Skeleton */}
      <div className="flex items-center justify-between p-2">
          <div className="h-10 w-48 bg-gray-300 rounded-md animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-300 rounded-md animate-pulse"></div>
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-1/4 bg-gray-300 rounded-md animate-pulse"></div> {/* Heading */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 bg-gray-200 p-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-5 bg-gray-300 rounded-md animate-pulse"
              ></div>
            ))}
          </div>

          {/* Table Rows */}
          {Array.from({ length: 8 }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="grid grid-cols-6 gap-4 p-3 border-t border-gray-200"
            >
              {Array.from({ length: 6 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="h-5 bg-gray-300 rounded-md animate-pulse"
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
