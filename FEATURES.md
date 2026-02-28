# 10 Implemented Features — Quick Reference

| # | Feature | Kya karta hai | Files |
|---|---------|---------------|-------|
| 1 | **Authentication** | Clerk se login/signup, user profile Convex mein store hota hai | `app/layout.tsx`, `components/user-sync.tsx`, `convex/users.ts` |
| 2 | **User List & Search** | Saare users dikhte hain, name se filter hota hai, click se chat shuru | `app/chat/layout.tsx`, `components/user-search.tsx`, `convex/users.ts` |
| 3 | **1-on-1 Direct Messages** | Private chat, real-time messages, sidebar mein last message preview | `app/chat/[id]/page.tsx`, `components/chat-list.tsx`, `convex/conversations.ts`, `convex/messages.ts` |
| 4 | **Message Timestamps** | Aaj → `4:34 PM`, is saal → `Feb 15, 4:34 PM`, alag saal → `Feb 15 2024, 4:34 PM` | `lib/utils.ts` |
| 5 | **Empty States** | Koi chat nahi / koi message nahi / search mein koi nahi — sab ko helpful message | `app/chat/page.tsx`, `app/chat/[id]/page.tsx`, `components/chat-list.tsx` |
| 6 | **Responsive Layout** | Desktop: sidebar + chat side-by-side. Mobile: ek waqt sirf ek, back button bhi | `app/chat/layout.tsx` (Tailwind `md:` breakpoints) |
| 7 | **Online/Offline Status** | 🟢 Green dot agar user last 30 sec mein active tha, har 15 sec mein heartbeat update | `components/presence-sync.tsx`, `convex/presence.ts`, `components/chat-list.tsx` |
| 8 | **Typing Indicator** | Doosra type kare toh bouncing dots dikhte hain, 2 sec baad ya message bhejne par band | `app/chat/[id]/page.tsx`, `convex/typing.ts` |
| 9 | **Unread Message Count** | Sidebar pe badge dikhta hai, chat kholte hi clear ho jaata hai, real-time update | `convex/conversations.ts`, `convex/messages.ts`, `components/chat-list.tsx` |
| 10 | **Smart Auto-Scroll** | Naya message aaye → bottom scroll. User upar tha → `↓ New messages` button dikhta hai | `app/chat/[id]/page.tsx` |
