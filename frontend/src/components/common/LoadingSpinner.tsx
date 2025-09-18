// src/components/common/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="loading-spinner" />
    <p>Loading...</p>
  </div>
);

export default LoadingSpinner;
