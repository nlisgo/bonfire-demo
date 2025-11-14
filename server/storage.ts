import {
  type User,
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Activity,
  type InsertActivity,
  type ConversationWithMessages,
  type MessageWithSender,
  type ActivityWithSubject,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: string, isOnline: boolean): Promise<void>;

  // Conversation operations
  getConversations(userId: string): Promise<ConversationWithMessages[]>;
  getConversation(id: string): Promise<ConversationWithMessages | undefined>;
  createConversation(conversation: InsertConversation, participantIds: string[]): Promise<Conversation>;

  // Message operations
  createMessage(message: InsertMessage): Promise<MessageWithSender>;
  getMessagesByConversation(conversationId: string): Promise<MessageWithSender[]>;

  // Activity operations
  getActivities(userId: string): Promise<ActivityWithSubject[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private activities: Map<string, Activity>;
  private conversationParticipants: Map<string, Set<string>>; // conversationId -> Set of userIds

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.activities = new Map();
    this.conversationParticipants = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      lastSeen: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStatus(id: string, isOnline: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
      this.users.set(id, user);
    }
  }

  // Conversation operations
  async getConversations(userId: string): Promise<ConversationWithMessages[]> {
    const userConversations: ConversationWithMessages[] = [];

    for (const [convId, conv] of this.conversations.entries()) {
      const participants = this.conversationParticipants.get(convId);
      if (participants && participants.has(userId)) {
        const messages = await this.getMessagesByConversation(convId);
        const participantUsers = await Promise.all(
          Array.from(participants).map((pId) => this.getUser(pId))
        );

        userConversations.push({
          ...conv,
          messages,
          participants: participantUsers.filter((u): u is User => u !== undefined),
        });
      }
    }

    return userConversations.sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  async getConversation(id: string): Promise<ConversationWithMessages | undefined> {
    const conv = this.conversations.get(id);
    if (!conv) return undefined;

    const messages = await this.getMessagesByConversation(id);
    const participants = this.conversationParticipants.get(id);
    const participantUsers = await Promise.all(
      Array.from(participants || []).map((pId) => this.getUser(pId))
    );

    return {
      ...conv,
      messages,
      participants: participantUsers.filter((u): u is User => u !== undefined),
    };
  }

  async createConversation(
    insertConversation: InsertConversation,
    participantIds: string[]
  ): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(id, conversation);
    this.conversationParticipants.set(id, new Set(participantIds));
    return conversation;
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<MessageWithSender> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);

    // Update conversation updatedAt
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
      this.conversations.set(insertMessage.conversationId, conversation);
    }

    const sender = await this.getUser(insertMessage.senderId);
    if (!sender) {
      throw new Error("Sender not found");
    }

    return {
      ...message,
      sender,
    };
  }

  async getMessagesByConversation(conversationId: string): Promise<MessageWithSender[]> {
    const messages = Array.from(this.messages.values()).filter(
      (msg) => msg.conversationId === conversationId
    );

    const messagesWithSenders = await Promise.all(
      messages.map(async (msg) => {
        const sender = await this.getUser(msg.senderId);
        if (!sender) {
          throw new Error(`Sender ${msg.senderId} not found`);
        }
        return {
          ...msg,
          sender,
        };
      })
    );

    return messagesWithSenders.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });
  }

  // Activity operations
  async getActivities(userId: string): Promise<ActivityWithSubject[]> {
    const allActivities = Array.from(this.activities.values());

    const activitiesWithSubjects = await Promise.all(
      allActivities.map(async (activity) => {
        const subject = await this.getUser(activity.subjectId);
        if (!subject) {
          throw new Error(`Subject ${activity.subjectId} not found`);
        }
        return {
          ...activity,
          subject,
        };
      })
    );

    return activitiesWithSubjects.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
