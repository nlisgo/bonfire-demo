import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApiMode } from "@shared/schema";

interface ApiModeContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
  isRealApi: boolean;
  isMockApi: boolean;
}

const ApiModeContext = createContext<ApiModeContextType | undefined>(undefined);

export function ApiModeProvider({ 
  children, 
  initialMode,
  onModeChange 
}: { 
  children: ReactNode; 
  initialMode: ApiMode;
  onModeChange?: (mode: ApiMode) => void;
}) {
  const [apiMode, setApiModeState] = useState<ApiMode>(initialMode);

  useEffect(() => {
    localStorage.setItem("bonfire_api_mode", apiMode);
  }, [apiMode]);

  const setApiMode = (mode: ApiMode) => {
    setApiModeState(mode);
    localStorage.removeItem("bonfire_jwt_token");
    // Call external mode change handler if provided
    if (onModeChange) {
      onModeChange(mode);
    }
    // Force page reload to ensure clean state
    window.location.reload();
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
