import React, { createContext, useState } from "react";

export const DataStatusContext = createContext();

export const DataStatusProvider = ({ children }) => {
  const [matchHasData, setMatchHasData] = useState(true);
  const [rankingHasData, setRankingHasData] = useState(true);

  return (
    <DataStatusContext.Provider
      value={{
        matchHasData,
        setMatchHasData,
        rankingHasData,
        setRankingHasData,
      }}
    >
      {children}
    </DataStatusContext.Provider>
  );
};
