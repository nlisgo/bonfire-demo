# Bonfire Integration Demo

## Overview
A full-stack web application demonstrating seamless integration with Bonfire's GraphQL API. Features both a mock GraphQL server for development and the ability to connect to the real Bonfire API at discussions.sciety.org.

## Purpose
- Showcase how to integrate Bonfire chat and social features into any web application
- Provide a development-friendly mock API for prototyping and UX testing
- Allow easy switching between mock and production APIs
- Demonstrate JWT authentication, real-time chat, and activity feeds

## Current State
**Status**: Active Development - Phase 1 (Schema & Frontend) Complete

**MVP Features Implemented (Frontend)**:
- ✅ Complete data schemas for Users, Messages, Conversations, Activities
- ✅ Authentication system with JWT token management
- ✅ Login page with API mode toggle (mock/real)
- ✅ Chat interface with conversation list and message bubbles
- ✅ Activity feed displaying user actions (posts, likes, shares, follows)
- ✅ User profile page with account details
- ✅ Sidebar navigation with app structure
- ✅ API mode context for switching between mock and real endpoints
- ✅ Beautiful loading states, error handling, and empty states
- ✅ Fully responsive design following Linear-inspired aesthetic

**Next**: Backend implementation with mock GraphQL server and real API proxy

## Recent Changes
- **2025-11-14**: Initial project setup with comprehensive frontend implementation
  - Defined all data models and TypeScript interfaces
  - Configured design tokens (Inter font, JetBrains Mono for code)
  - Built all React components with exceptional attention to UX
  - Implemented context providers for auth and API mode management
  - Created chat, feed, and profile pages with beautiful UI

## User Preferences
- **Design Approach**: Linear-inspired clean productivity aesthetic + Slack chat patterns
- **Focus**: Technical demonstration with functional clarity and modern polish
- **Key Requirement**: Seamless switching between mock and real Bonfire GraphQL APIs
- **Visual Priority**: Exceptional frontend quality is paramount

## Project Architecture

### Technology Stack
- **Frontend**: React, TypeScript, Wouter (routing), TanStack Query, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Apollo Server (mock GraphQL), JWT authentication
- **Design System**: Inter font family, Linear-inspired spacing, Clean card-based layouts
- **Data**: In-memory storage (MemStorage) for mock data

### Directory Structure
```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Shadcn UI primitives
│   │   ├── app-sidebar.tsx
│   │   ├── api-mode-toggle.tsx
│   │   ├── message-bubble.tsx
│   │   ├── conversation-list-item.tsx
│   │   ├── message-input.tsx
│   │   └── activity-item.tsx
│   ├── lib/               # Utilities and contexts
│   │   ├── api-mode-context.tsx
│   │   ├── auth-context.tsx
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/             # Route components
│   │   ├── login.tsx
│   │   ├── chat.tsx
│   │   ├── feed.tsx
│   │   ├── profile.tsx
│   │   └── not-found.tsx
│   ├── App.tsx            # Main app with routing
│   └── index.css          # Global styles
server/
├── index.ts               # Express server entry
├── routes.ts              # API routes (to be implemented)
├── storage.ts             # In-memory storage interface
└── vite.ts                # Vite dev server config
shared/
└── schema.ts              # Shared TypeScript types and Zod schemas
```

### Data Model
**User**: id, username, email, displayName, bio, avatarUrl, isOnline, lastSeen
**Conversation**: id, title, isGroup, participants, messages, timestamps
**Message**: id, conversationId, senderId, content, createdAt
**Activity**: id, subjectId, verb, objectType, objectId, objectContent, createdAt

### API Endpoints (To Be Implemented)
- `POST /api/auth/login?mode=mock|real` - Authenticate user, return JWT token
- `GET /api/conversations?mode=mock|real` - Fetch all conversations with messages
- `POST /api/conversations/:id/messages?mode=mock|real` - Send a message
- `GET /api/activities?mode=mock|real` - Fetch activity feed
- `POST /api/graphql/mock` - Mock GraphQL endpoint (Apollo Server)
- GraphQL proxy to `https://discussions.sciety.org/api/graphql` for real API

### Key Features
1. **Dual API Mode**
   - Mock: Development mode using local Apollo Server with faker.js data
   - Real: Production mode proxying to discussions.sciety.org
   - Seamless switching via toggle in header
   - Separate JWT token storage per mode

2. **Authentication Flow**
   - Login with username/password
   - JWT token issued and stored in localStorage
   - Token sent in Authorization header for all requests
   - Automatic logout on mode switch

3. **Chat Interface**
   - Conversation list with last message preview
   - Real-time message display with sender avatars
   - Message input with multi-line support
   - Own messages styled differently (right-aligned, primary color)
   - Empty states for no conversations/messages

4. **Activity Feed**
   - ActivityStreams-inspired structure (subject/verb/object)
   - Visual icons for different activity types (like, share, follow, post)
   - Time-relative formatting ("2 hours ago")
   - Content preview for posts/comments

5. **Profile Page**
   - User avatar, display name, username, bio
   - Online/offline status indicator
   - Account details (email, user ID, last seen)
   - Current API configuration display
   - Direct link to Bonfire (for real mode)

### Design Guidelines
- **Typography**: Inter for UI, JetBrains Mono for code/endpoints
- **Colors**: Primary blue (217 91% 35%), subtle grays, status colors
- **Spacing**: Consistent padding (p-4, p-6), gaps (gap-2, gap-4)
- **Components**: Shadcn UI components throughout
- **Interactions**: Subtle hover elevation, smooth transitions
- **Responsive**: Mobile-first with sidebar collapse

### Development Workflow
1. Schema-first approach: Define types in `shared/schema.ts`
2. Build frontend components with full UX
3. Implement backend with mock and real API support
4. Integrate frontend with backend APIs
5. Test all flows in both mock and real modes

## Integration Notes
- **Bonfire GraphQL**: Uses JWT Bearer tokens in Authorization header
- **Mock Service**: Mimics real Bonfire API structure for seamless testing
- **Data Generator**: Faker.js creates realistic user profiles and messages
- **Session Management**: LocalStorage for token persistence
- **Error Handling**: Comprehensive toast notifications for all failures

## Environment Variables
- `SESSION_SECRET`: Express session secret (already configured)
- Future: May need Bonfire API credentials for real mode testing

## Running the Application
- Start: `npm run dev` (Express + Vite dev servers)
- Frontend: Served on port 5000
- Backend: API routes on same port (/api/*)
- Mock GraphQL: Will be at /api/graphql/mock
- Auto-restart on file changes

## Demo Credentials
**Mock API**:
- Username: demo
- Password: demo123

**Real API**: User must have actual Bonfire account at discussions.sciety.org
