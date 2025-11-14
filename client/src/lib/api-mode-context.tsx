import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApiMode } from "@shared/schema";

interface ApiModeContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
  isRealApi: boolean;
  isMockApi: boolean;
}

const ApiModeContext = createContext<ApiModeContextType | undefined>(undefined);

export function ApiModeProvider({ children }: { children: ReactNode }) {
  const [apiMode, setApiModeState] = useState<ApiMode>(() => {
    const stored = localStorage.getItem("bonfire_api_mode");
    return (stored === "real" || stored === "mock") ? stored : "mock";
  });

  useEffect(() => {
    localStorage.setItem("bonfire_api_mode", apiMode);
  }, [apiMode]);

  const setApiMode = (mode: ApiMode) => {
    setApiModeState(mode);
    localStorage.removeItem("bonfire_jwt_token");
  };

  return (
    <ApiModeContext.Provider
      value={{
        apiMode,
        setApiMode,
        isRealApi: apiMode === "real",
        isMockApi: apiMode === "mock",
      }}
    >
      {children}
    </ApiModeContext.Provider>
  );
}

export function useApiMode() {
  const context = useContext(ApiModeContext);
  if (!context) {
    throw new Error("useApiMode must be used within ApiModeProvider");
  }
  return context;
}
