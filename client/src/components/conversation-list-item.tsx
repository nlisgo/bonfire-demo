import { ConversationWithMessages } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Users } from "lucide-react";

interface ConversationListItemProps {
  conversation: ConversationWithMessages;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}

export function ConversationListItem({
  conversation,
  isActive,
  onClick,
  currentUserId,
}: ConversationListItemProps) {
  const otherParticipants = conversation.participants.filter((p) => p.id !== currentUserId);
  const displayUser = otherParticipants[0] || conversation.participants[0];
  const lastMessage = conversation.messages[conversation.messages.length - 1];

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

  return (
    <button
      data-testid={`conversation-${conversation.id}`}
      onClick={onClick}
      className={`w-full p-4 flex items-start gap-3 hover-elevate active-elevate-2 border-b transition-colors ${
        isActive ? "bg-accent" : ""
      }`}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={displayUser?.avatarUrl || undefined} alt={displayUser?.displayName} />
        <AvatarFallback>{displayUser ? getInitials(displayUser.displayName) : "?"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm truncate" data-testid="text-conversation-title">
              {conversation.isGroup ? (
                <>
                  <Users className="h-3 w-3 inline mr-1" />
                  {conversation.title || "Group Chat"}
                </>
              ) : (
                displayUser?.displayName || "Unknown"
              )}
            </span>
            {conversation.isGroup && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {conversation.participants.length}
              </Badge>
            )}
          </div>
          {lastMessage && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        {lastMessage && (
          <p className="text-sm text-muted-foreground truncate" data-testid="text-last-message">
            {lastMessage.sender.id === currentUserId ? "You: " : ""}
            {lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}
