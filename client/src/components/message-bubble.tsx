import { MessageWithSender } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
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
    <div
      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"} mb-4`}
      data-testid={`message-${message.id}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.sender.avatarUrl || undefined} alt={message.sender.displayName} />
        <AvatarFallback>{getInitials(message.sender.displayName)}</AvatarFallback>
      </Avatar>

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        <div
          className={`px-4 py-2 ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
              : "bg-muted text-foreground rounded-2xl rounded-bl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words" data-testid="text-message-content">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-muted-foreground" data-testid="text-message-sender">
            {message.sender.displayName}
          </span>
          <span className="text-xs text-muted-foreground opacity-70">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
