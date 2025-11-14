import { useQuery } from "@tanstack/react-query";
import { ActivityWithSubject } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";
import { useApiMode } from "@/lib/api-mode-context";
import { ActivityItem } from "@/components/activity-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function Feed() {
  const { token } = useAuth();
  const { apiMode } = useApiMode();

  const {
    data: activities,
    isLoading,
    error,
  } = useQuery<ActivityWithSubject[]>({
    queryKey: ["/api/activities", apiMode],
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="h-full overflow-hidden">
        <div className="p-6 border-b">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load activity feed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/activities"] })}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground">
            When users in your network post, like, or share content, it will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-card">
        <h2 className="text-2xl font-semibold mb-1" data-testid="text-feed-header">Activity Feed</h2>
        <p className="text-sm text-muted-foreground">
          {activities.length} recent activit{activities.length !== 1 ? "ies" : "y"}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4 max-w-3xl mx-auto">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
