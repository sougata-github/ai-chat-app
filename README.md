## Features (MVP)

- Auth (Better Auth) ✅

  - can chat without sign-in (guest mode)
  - based on `isAnonymous` status, we will have rate limits
  - 8 user messages in total across all chats when anonymous
  - 20 user messages when not anonymous
  - 2 images for both logged-in or not
  - message limit resets everyday at 5:30am
  - auth logic in tRPC Context
  - if no session (logged-out), then new anon session will be created everytime
  - anon and logged-in sessions will be different so chat info won't be retained across the two
  - anon sessions will be destroyed once logged-in
  - If user never logs in then chat info for anon session will be retained
  - once logged-in the new chat info will be retained thereafter forever
  - chat useMutation will return limit status on every message when not logged-in (prompt to log in)
  - chat useMutation will return limit status after only after limit is reached when logged-in
  - Rate limit check in a separate middleware (in case of mutation)

- User Button (bottom of sidebar - for logged in else render login button)

  - Display message limit info with progress bar
  - Display user avatar, name and email (only if logged in)
  - Shortcuts: Ctrl+K to open search (Command component)
  - Sign Out button

- Sidebar ✅

  - Logo at the top
  - Create Chat Button -> navigates to `/chat` (no mutation until form is submitted)
  - Search Chats Button -> opens a dialog with list of 5 recently created chats and when seached displays with chats with searched title
    (same chats.getMany procedure but if there is search then use that to filter chats)
  - Archived Chats Button -> opens a dialog with list of Archived chats (Clicking on each chat goes to that specific chat page, but the page will have a header of "This page currently archived, restore button", when restore clicked then update mutation (archived = true ) and invalidate chats.getMany -> gets displayed on sidebar again)
  - Infinite loading of chats (client-component in layout.tsx) (not prefetched) (sorted on the basis of today, last 7 days, older)
  - Separator
  - Will have beautiful loading skeleton
  - Each message will have dropdown with options:
    - Archive
    - Delete (Alert Dialog component)
    - Rename (The chat will become a input component and then onClick will trigger update chat mutation)
  - Clicking on each chat will navigate to `/chat/chatId`
  - When a chat gets deleted, the chat below should animate-in (AnimatePresence popLayout)
  - Render chats which are not `archived=true (server-side)`

- home page

  - generate a uuid()
  - pass the generated id to ChatView (this is so that we can create a new chat record and route to /chat/chatId)
  - pass initial messages as empty array since this is the starting point
  - Render ChatView
  - Inside ChatView render ChatSuggestions and ChatInput
  - ChatView is a resuable component
  - Display ChatSuggestions if no messages else Messages component
  - /api/chat is a unified api endpoint that checks for an existing chat else creates one
  - use useChat (but make api call to /api/chat -> for chat creation)

- /chat/chatId

  - Check for existing chat using params id, if not present redirect to /
  - Fetch existing messages in the chat (server action)
  - Convert to ai sdk messages
  - Pass both chatId and ai sdk messages (as initial messages) into ChatView
  - In ChatView:
    - use useChat hook for chat interface and making llm calls
    - since now there are messages, map over them and display MessageItem
    - looks for changes in chatId to always ensure fresh state
    - create handleChatSubmit that replaces history state in browser on initial submit
    - get handleSubmit, messages, loading-state, etc from the hook and pass to Messages Component and ChatInput component

- Flow:

  - One ChatView component and one unified api
  - will use a combination of useChat and streamText
  - generate chatId and pass into ChatView and empty initialMessages array
  - user on home page -> render ChatView -> render Suggestions (since no messages)
  - submit prompt
  - url changes to /chat/chatId
  - api call
    - check for id, check for messages (at least one should exist (user message))
    - check for user session
    - get last message (user prompt)
    - check if chat exists with the id
    - if chat does not exist
      - generate title using generateText
      - create new chat record with the id, userId and title
    - if chat exists -> proceed
    - create user message
    - convert uiMessages to coreMessages to provide context
    - stream response using streamText
    - onFinish -> update db with response
    - return streamed response
  - onFinish -> invalidate chats.getMany
  - messages.length get updated
  - user message gets appended
  - response starts streaming
  - Render Messages and continue chatting
  - on going to /chat/chatId -> fetch exisiting chat and it's messages
  - pass to ChatView
  - Render Messages and continue chatting

- Header (layout.tsx)

- Display theme selection with light and dark mode toggles as well as basic shadcn theme colors (Popover)
- Share Chat button that generates link -> /domain/share/chatId, copying it displays a toast (Link copied)
- Share Chat button only for those chats that are not archived
- /share/chatId page

  - Navigating to shared page will only have the shared chat messages and no textarea (just preview of shared chat)

- Multi-model flow:
  - use zustand to store current model
  - store current model in cookies
  - use cookies to fetch current model/provider in api endpoint
  - when in image-gen or web-search mode -> disable model selection and default to corresponding models

Todo:

- /chat/chatId page with plain text (getting response and displaying stuff)✅
- resumable streams
- Code generation and syntax highlighting, structured outputs
- Image Generation, Web Search tool, Check Weather tool, multi model setup, scroll hooks (scroll to bottom, auto-scroll)
- Rate limiting (messages and chats for logged in and guest users)
- Share page
- Refinements (Animations, UX improvement)
- Future updates (tool calling, edit message)

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Better Auth
- tRPC
- Shadcn-ui
- Framer Motion
- Upstash
- Uploadthing
- Vercel AI SDK
- Gemini API
- Vercel
