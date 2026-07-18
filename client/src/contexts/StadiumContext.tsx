/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface StadiumContextType {
  activeStadiumId: string | null;
  setActiveStadiumId: (id: string | null) => void;
}

const StadiumContext = createContext<StadiumContextType | undefined>(undefined);

export const StadiumProvider = ({ children }: { children: ReactNode }) => {
  const [activeStadiumId, setActiveStadiumId] = useState<string | null>(null);

  return (
    <StadiumContext.Provider value={{ activeStadiumId, setActiveStadiumId }}>
      {children}
    </StadiumContext.Provider>
  );
};

export const useStadium = () => {
  const context = useContext(StadiumContext);
  if (context === undefined) {
    throw new Error('useStadium must be used within a StadiumProvider');
  }
  return context;
};
