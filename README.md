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
  - Create modal global store for opening and closing of dialogs using zustand

- /chat/chatId dynamic route -> ChatMessage + ChatInput

  - Flow:
    - User Message (useSubscription) (optimistic ui update)
    - Server-side rate limit check (sending bad request and displaying toast on frontend)
    - Creating a user message record in db (role = "user")
    - fetching all chat messages in the chat to provide context to llm (using chatId and userId -> chat.messages)
    - Making api call to LLM (with prompt, all messages) using vercel ai sdk (await StreamText)
    - No response: return error and display toast on frontend
    - Loading on the frontend
    - Getting the response and streaming it on the frontend
    - Once response has arrived, create a message record (role="ai")
    - Update user message with responseId (ai message)
    - UseScroll hook scrolls as response is streamed
    - All real time using useSubscription from tRPC
  - ChatMessage component will be responsible from rendering complex responses from LLMs such as code blocks (with copy code button and beautiful minimal theme), emojis, bullets, tables, headings, bold text, italics, underlined text, links, separators etc (basically rendering beautiful content) (maybe by using tailwind typography classes (prose) or any other solution)
  - When streaming the response on frontend, animate using TypeWriter component
  - Only display those user messages where (role === "user" and responseId exists, else don't render)
  - Each message will also have imageUrl, imageKey field (both being optional, if image generation is selected in text-area, that info will passed to procedure call and based on that the imageUrl will be sent as a response (1 image per prompt and when response finised then increment user's images field, when mode (input to procedure) is image-gen, then besides message rate-limit check user's total images count before making api call and send "BAD_REQUEST" and display corresponding toast on frontend))
  - For image-gen, extract image from response, uploaded to uploadthing, then retrieve uploadthing url and create message (role="ai", imageUrl: uploadthingUrl, imageKey: uploadthingKey)
  - In ChatMessage Component, if returned chat.imageUrl exists, then render the image and display separate skeleton for image response
  - Each ChatMessage Component will have a copy button, a retry button (if user prompt -> make another llm call but this time dont append user message again, send responseId and update existing response for that user prompt, and stream response back again)
  - future: add edit button to ChatMessage Component (only for user message) (when editing, ChatMessage becomes a text-area/input with send and cancel buttons) (on send will basically update the response (with corresponding response id) but keeps the user prompt)
  - Server-side: if procedure call has a responseId, then update existing response, else create a new message record with new updated prompt
  - Invalidate messages.getMany
  - Provide a detailed SYSTEM_PROMPT in llm call

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
    - create handleChatSubmit that replaces history state in browser on initial submit
    - get handleSubmit, messages, loading-state, etc from the hook and pass to Messages Component and ChatInput component

- Flow:

  - One ChatView component and one unified api
  - generate chatId and pass into ChatView and empty initialMessages array
  - user on home page -> render ChatView -> render Suggestions (since no messages)
  - submit prompt
  - url changes to /chat/chatId
  - api call
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

Todo:

- /chat/chatId page with plain text (getting response and displaying stuff)✅
- resumable streams
- Code generation and syntax highlighting, structured outputs
- Image Generation, multi model setup, scroll hooks (scroll to bottom, auto-scroll)
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
