import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      displayName
      bio
      avatarUrl
      isOnline
      lastSeen
    }
  }
`;

export const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
      id
      title
      isGroup
      createdAt
      updatedAt
      participants {
        id
        username
        displayName
        avatarUrl
        isOnline
      }
      messages {
        id
        conversationId
        senderId
        content
        createdAt
        sender {
          id
          username
          displayName
          avatarUrl
        }
      }
    }
  }
`;

export const GET_ACTIVITIES = gql`
  query GetActivities {
    activities {
      id
      subjectId
      verb
      objectType
      objectId
      objectContent
      createdAt
      subject {
        id
        username
        displayName
        avatarUrl
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        email
        displayName
        bio
        avatarUrl
        isOnline
        lastSeen
      }
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($conversationId: ID!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
      id
      conversationId
      senderId
      content
      createdAt
      sender {
        id
        username
        displayName
        avatarUrl
      }
    }
  }
`;
