import { GraphQLScalarType, Kind } from "graphql";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const JWT_SECRET = process.env.SESSION_SECRET || "bonfire-demo-secret-key";

interface JwtPayload {
  userId: string;
  username: string;
}

interface Context {
  user?: JwtPayload;
}

// Custom DateTime scalar
const dateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "DateTime custom scalar type",
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      const user = await storage.getUser(context.user.userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },

    user: async (_: any, { id }: { id: string }) => {
      return await storage.getUser(id);
    },

    conversations: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      return await storage.getConversations(context.user.userId);
    },

    conversation: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      return await storage.getConversation(id);
    },

    activities: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }
      return await storage.getActivities(context.user.userId);
    },
  },

  Mutation: {
    login: async (_: any, { username, password }: { username: string; password: string }) => {
      // Demo account: demo/demo123
      if (username === "demo" && password === "demo123") {
        let user = await storage.getUserByUsername("demo");

        if (!user) {
          // Create demo user if it doesn't exist
          user = await storage.createUser({
            username: "demo",
            email: "demo@bonfire.local",
            displayName: "Demo User",
            bio: "This is the demo account for testing Bonfire integration",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
            isOnline: true,
          });
        }

        // Update user status to online
        await storage.updateUserStatus(user.id, true);

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, username: user.username } as JwtPayload,
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        return { token, user };
      }

      throw new Error("Invalid credentials. Use demo/demo123");
    },

    sendMessage: async (
      _: any,
      { conversationId, content }: { conversationId: string; content: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      return await storage.createMessage({
        conversationId,
        senderId: context.user.userId,
        content: content.trim(),
      });
    },
  },

  Conversation: {
    participants: async (conversation: any) => {
      // Participants are already loaded in the storage layer
      return conversation.participants || [];
    },
    messages: async (conversation: any) => {
      // Messages are already loaded in the storage layer
      return conversation.messages || [];
    },
  },

  Message: {
    sender: async (message: any) => {
      // Sender is already loaded in the storage layer
      return message.sender || (await storage.getUser(message.senderId));
    },
  },

  Activity: {
    subject: async (activity: any) => {
      // Subject is already loaded in the storage layer
      return activity.subject || (await storage.getUser(activity.subjectId));
    },
  },
};
