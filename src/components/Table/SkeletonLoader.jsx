import React from 'react';
import '../../index.css'; // Add styles for the skeleton effect

const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = '4px' }) => {
  return (
    <div
      className="skeleton-loader"
      style={{
        width,
        height,
        borderRadius,
      }}
    ></div>
  );
};

export default SkeletonLoader;