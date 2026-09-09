# StudyOS Project Notes

## Product principles

- Calm, fluid, focused and minimal. The interface should disappear and let the user focus on learning.
- Every page answers one primary question. Secondary information lives deeper in the information architecture.
- Interactions are light and natural; never refresh a whole page when one region changes.
- Responsive from mobile to desktop. Mobile reorganizes content, it does not merely compress it.

## Engineering rules

- Follow the repository `AGENTS.md`: commit after each completed change and add or update tests before delivery.
- Business logic lives in `lib/services`, validators in `lib/validators`, UI state in components.
- Server Actions and Route Handlers never trust client-supplied `userId` or duration values.
- Every user-owned query is scoped by the authenticated user id.
- UI components stay reusable and single-purpose: Button, Surface, Badge, Progress, Skeleton, EmptyState.

## Current phase

Phase 0: project bootstrap, design tokens, UI primitives, test tooling, documentation.

Next planned phases follow the outline: database/auth, semester, goal, course, task, plan, focus, dashboard, knowledge, review, analytics.
