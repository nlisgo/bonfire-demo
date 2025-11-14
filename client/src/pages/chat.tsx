import { useState, useEffect, useRef } from "react";
import * as ApolloClientReact from "@apollo/client/react/index.js";
const { useQuery, useMutation } = ApolloClientReact;
import { ConversationWithMessages } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";
import { ConversationListItem } from "@/components/conversation-list-item";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GET_CONVERSATIONS, SEND_MESSAGE_MUTATION } from "@/lib/graphql/queries";

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data,
    loading: conversationsLoading,
    error: conversationsError,
    refetch,
  } = useQuery<{ conversations: ConversationWithMessages[] }>(GET_CONVERSATIONS);

  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE_MUTATION, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const conversations = data?.conversations || [];
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const handleSendMessage = (content: string) => {
    if (selectedConversationId) {
      sendMessage({
        variables: {
          conversationId: selectedConversationId,
          content,
        },
      });
    }
  };

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  if (conversationsLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r">
          <div className="p-4 border-b">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load conversations</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {conversationsError.message || "Please try again later"}
          </p>
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start chatting with other users to see your conversations here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold" data-testid="text-conversations-header">Messages</h2>
          <p className="text-sm text-muted-foreground">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === selectedConversationId}
              onClick={() => setSelectedConversationId(conversation.id)}
              currentUserId={user?.id || ""}
            />
          ))}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b bg-card">
              <h3 className="font-semibold" data-testid="text-conversation-header">
                {selectedConversation.isGroup
                  ? selectedConversation.title || "Group Chat"
                  : selectedConversation.participants.find((p) => p.id !== user?.id)?.displayName || "Chat"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.isGroup
                  ? `${selectedConversation.participants.length} participants`
                  : selectedConversation.participants.find((p) => p.id !== user?.id)?.isOnline
                  ? "Online"
                  : "Offline"}
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedConversation.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === user?.id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <MessageInput
              onSend={handleSendMessage}
              disabled={sendingMessage}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
