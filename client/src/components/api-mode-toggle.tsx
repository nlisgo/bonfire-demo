import { useApiMode } from "@/lib/api-mode-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Database } from "lucide-react";

export function ApiModeToggle() {
  const { apiMode, setApiMode, isMockApi } = useApiMode();

  return (
    <div className="flex items-center gap-2">
      <Button
        data-testid="button-toggle-api-mode"
        size="sm"
        variant={isMockApi ? "default" : "outline"}
        onClick={() => setApiMode(isMockApi ? "real" : "mock")}
        className="gap-2"
      >
        {isMockApi ? <Database className="h-4 w-4" /> : <Server className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {isMockApi ? "Mock API" : "Real API"}
        </span>
      </Button>
      <Badge
        data-testid="badge-api-status"
        variant={isMockApi ? "secondary" : "default"}
        className="hidden md:flex gap-1.5"
      >
        <span className={`h-2 w-2 rounded-full ${isMockApi ? "bg-status-online" : "bg-primary"}`} />
        {isMockApi ? "Development Mode" : "Production Mode"}
      </Badge>
    </div>
  );
}
