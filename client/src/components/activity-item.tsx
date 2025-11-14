import { ActivityWithSubject } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  activity: ActivityWithSubject;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  const getVerbIcon = (verb: string) => {
    switch (verb) {
      case "liked":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "shared":
        return <Share2 className="h-4 w-4 text-blue-500" />;
      case "followed":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "commented":
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getVerbText = (verb: string, objectType: string) => {
    const verbMap: Record<string, string> = {
      posted: "posted a",
      liked: "liked a",
      shared: "shared a",
      followed: "followed",
      commented: "commented on a",
    };
    return `${verbMap[verb] || verb} ${objectType}`;
  };

  return (
    <Card className="p-4 hover-elevate" data-testid={`activity-${activity.id}`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={activity.subject.avatarUrl || undefined} alt={activity.subject.displayName} />
          <AvatarFallback>{getInitials(activity.subject.displayName)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm" data-testid="text-activity-subject">
                {activity.subject.displayName}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                {getVerbIcon(activity.verb)}
                {getVerbText(activity.verb, activity.objectType)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(activity.createdAt)}
            </span>
          </div>

          {activity.objectContent && (
            <div className="bg-muted/50 rounded-md p-3 mt-2">
              <p className="text-sm" data-testid="text-activity-content">
                {activity.objectContent}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
