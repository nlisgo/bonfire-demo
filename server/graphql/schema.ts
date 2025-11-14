import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    username: String!
    email: String!
    displayName: String!
    bio: String
    avatarUrl: String
    isOnline: Boolean!
    lastSeen: DateTime
  }

  type Message {
    id: ID!
    conversationId: ID!
    senderId: ID!
    sender: User!
    content: String!
    createdAt: DateTime!
  }

  type Conversation {
    id: ID!
    title: String
    isGroup: Boolean!
    participants: [User!]!
    messages: [Message!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Activity {
    id: ID!
    subjectId: ID!
    subject: User!
    verb: String!
    objectType: String!
    objectId: ID!
    objectContent: String
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    user(id: ID!): User
    conversations: [Conversation!]!
    conversation(id: ID!): Conversation
    activities: [Activity!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    sendMessage(conversationId: ID!, content: String!): Message!
  }
`;
