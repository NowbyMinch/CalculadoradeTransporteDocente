"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

type FeriadosContextType = {
  feriados: Array<{ date: string; name: string }>;
  setFeriados: Dispatch<SetStateAction<Array<{ date: string; name: string }>>>;
  type?: string;
};

const FeriadosContext = createContext<FeriadosContextType | null>(null);

export function FeriadosProvider({ children }: { children: ReactNode }) {
  const [feriados, setFeriados] = useState<
    Array<{ date: string; name: string; type?: string }>
  >([]);

  return (
    <FeriadosContext.Provider value={{ feriados, setFeriados }}>
      {children}
    </FeriadosContext.Provider>
  );
}

export function useFeriados() {
  const context = useContext(FeriadosContext);

  if (!context) {
    throw new Error("useFeriados must be used inside FeriadosProvider");
  }

  return context;
}
