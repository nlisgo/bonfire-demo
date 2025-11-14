# Bonfire Integration App - Design Guidelines

## Design Approach
**Selected Approach**: Design System + Reference-Based Hybrid
- **Primary Influence**: Linear's clean productivity aesthetic + Slack's chat interface patterns
- **Rationale**: Technical demonstration app requiring functional clarity with modern, professional polish
- **Key Principle**: Prioritize usability and clear information hierarchy while maintaining visual sophistication

## Typography System
- **Primary Font**: Inter (Google Fonts) - clean, highly legible for interfaces
- **Headings**: 
  - H1: text-2xl/text-3xl font-semibold
  - H2: text-xl font-semibold
  - H3: text-lg font-medium
- **Body**: text-sm/text-base font-normal
- **Chat Messages**: text-sm font-normal
- **UI Labels**: text-xs font-medium uppercase tracking-wide
- **Monospace** (API endpoints, tokens): 'JetBrains Mono' - text-xs/text-sm

## Layout System
**Spacing Primitives**: Tailwind units of 2, 3, 4, 6, 8, 12, 16
- **Component Padding**: p-4, p-6, p-8
- **Gaps/Margins**: gap-2, gap-4, gap-6, space-y-4, space-y-6
- **Section Spacing**: py-8, py-12, py-16

**Layout Structure**:
- **Container**: max-w-7xl mx-auto px-4
- **Two-Column Main Layout**: 
  - Sidebar (w-64): User profile, navigation, API toggle
  - Main Content (flex-1): Chat interface, feeds
- **Chat Area**: Full height with fixed header and input

## Component Library

### Navigation & Controls
- **Top Bar**: Fixed header with app branding, user menu, API mode indicator
- **API Toggle**: Prominent switch (mock/real) with clear visual state (badge with icon)
- **Sidebar Navigation**: Clean vertical nav with icons + labels
- **Developer Indicator**: Small badge showing active mode (green for mock, blue for real)

### Authentication
- **Login Form**: Centered card (max-w-md) with simple email/password fields
- **Input Fields**: h-10, rounded-lg, border focus:ring-2 treatment
- **Primary Button**: h-10 px-6 rounded-lg font-medium
- **Form Layout**: space-y-4 between fields

### Chat Interface
- **Message List**: Scrollable flex-col-reverse with overflow-y-auto
- **Message Bubbles**: 
  - Own messages: ml-auto, max-w-[70%], rounded-2xl rounded-br-md
  - Other messages: mr-auto, max-w-[70%], rounded-2xl rounded-bl-md
  - Padding: px-4 py-2
- **Avatar**: h-8 w-8 rounded-full next to messages
- **Timestamp**: text-xs opacity-70 below messages
- **Chat Input**: Fixed bottom, h-12, rounded-full with send button integrated
- **Conversation List**: Left sidebar with recent chats, unread indicators

### User Profiles
- **Profile Card**: Avatar (h-16 w-16), name (text-lg font-semibold), username (text-sm opacity-70)
- **User Status**: Small dot indicator (online/offline)
- **Profile Actions**: Compact button group

### Data Display
- **Activity Feed**: Card-based layout with ActivityStreams structure
- **Feed Item**: Border-b treatment, py-4 spacing, flex with avatar + content
- **Metadata**: text-xs opacity-70 for timestamps, usernames
- **Empty States**: Centered with icon, heading, description

### Overlays
- **Modals**: max-w-lg centered, rounded-xl, shadow-2xl
- **Dropdowns**: rounded-lg shadow-lg, py-1
- **Tooltips**: Minimal, text-xs rounded-md

## Interaction Patterns
- **Button States**: Subtle hover brightness, active scale-95
- **Links**: Underline on hover for text links
- **Form Validation**: Inline error messages (text-xs text-red-600)
- **Loading States**: Skeleton screens for chat, spinner for buttons
- **Transitions**: transition-all duration-200 for smooth interactions

## Images
**Profile Avatars**: Generated placeholder avatars using UI Avatars or similar service (https://ui-avatars.com/api/)
**Empty State Illustrations**: Use Heroicons or similar for simple iconography, no complex illustrations needed

## Accessibility
- Semantic HTML throughout (nav, main, article for chat messages)
- aria-labels for icon-only buttons
- Focus visible states with ring-2 ring-offset-2
- Keyboard navigation for chat (arrow keys for message history)
- ARIA live regions for new messages

## Critical Layout Details
- **Chat Height**: Use calc(100vh - header - input) for proper scrolling
- **Responsive**: 
  - Mobile: Stack sidebar below chat, hamburger menu
  - Desktop: Side-by-side layout
- **Fixed Elements**: Header and chat input stay fixed during scroll
- **Z-index**: Header (50), Modals (100), Dropdowns (90)

## Special Considerations
- **API Toggle Visibility**: Always visible in header or sidebar, never buried
- **Link to Bonfire**: Clear external link icon, opens in new tab
- **Session Indicator**: Show JWT status (logged in/out) with token expiry
- **GraphQL Endpoint Display**: Show active endpoint URL in footer or dev panel (monospace, text-xs)