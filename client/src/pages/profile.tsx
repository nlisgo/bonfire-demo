import * as ApolloClientReact from "@apollo/client/react/index.js";
const { useQuery } = ApolloClientReact;
import { User } from "@shared/schema";
import { useApiMode } from "@/lib/api-mode-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, User as UserIcon, AtSign, Calendar, ExternalLink, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { GET_ME } from "@/lib/graphql/queries";

export default function Profile() {
  const { apiMode, isMockApi } = useApiMode();
  const { data, loading, error, refetch } = useQuery<{ me: User }>(GET_ME);

  const user = data?.me;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "Never";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Card>
            <CardHeader>
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load profile</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "Please try again later"}
          </p>
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No user data available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Profile</h2>
          <p className="text-sm text-muted-foreground">Your Bonfire account information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                  <AvatarFallback className="text-2xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl mb-1" data-testid="text-profile-name">
                    {user.displayName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <AtSign className="h-3 w-3" />
                    <span data-testid="text-profile-username">{user.username}</span>
                  </CardDescription>
                  <div className="mt-2">
                    <Badge variant={user.isOnline ? "default" : "secondary"} className="gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          user.isOnline ? "bg-status-online" : "bg-status-offline"
                        }`}
                      />
                      {user.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          {user.bio && (
            <>
              <Separator />
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-profile-bio">
                  {user.bio}
                </p>
              </CardContent>
            </>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground" data-testid="text-profile-email">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono" data-testid="text-profile-id">
                  {user.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Last Seen</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(user.lastSeen)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Current connection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">API Mode</p>
              <Badge variant={isMockApi ? "secondary" : "default"} className="gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isMockApi ? "bg-status-online" : "bg-primary"}`} />
                {isMockApi ? "Mock API (Development)" : "Real API (Production)"}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">GraphQL Endpoint</p>
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all">
                {isMockApi
                  ? `${window.location.origin}/api/graphql`
                  : "https://discussions.sciety.org/api/graphql"}
              </code>
            </div>

            {!isMockApi && (
              <div className="pt-2">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a
                    href="https://discussions.sciety.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-bonfire-external"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Bonfire Directly
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
