# Cloudflare Workers Chat Demo

[![[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bilbywilby/delta-intelligent-context-retention-system)]](https://workers.cloudflare.com)

A production-ready full-stack chat application built with Cloudflare Workers, Durable Objects, and React. Demonstrates scalable user management, chat boards, and real-time messaging using a single Durable Object namespace for efficient storage and indexing.

## Features

- **Multi-tenant Storage**: Global Durable Object acts as a KV-like store for multiple entity types (Users, Chats).
- **Indexed Entities**: Automatic pagination, listing, create/delete with indexes.
- **Real-time Chats**: Per-chat Durable Object instances store messages with optimistic mutations.
- **Type-safe API**: Shared types between frontend and worker; Hono routes with Zod validation ready.
- **Modern UI**: shadcn/ui components, Tailwind CSS, dark mode, responsive design.
- **State Management**: TanStack Query for data fetching/caching/mutations.
- **Development Workflow**: Hot reload for both frontend (Vite) and worker; Bun-powered.
- **Production Deploy**: Single `bun deploy` for worker + static assets.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack React Query, React Router, Lucide Icons, Sonner (toasts)
- **Backend**: Cloudflare Workers, Hono, Durable Objects, Cloudflare Storage API
- **Tools**: Bun, Wrangler, ESLint, TypeScript 5, PostCSS
- **UI/UX**: Framer Motion (animations), Headless UI, Radix Primitives

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (package manager & runtime)
- [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install/)
- Cloudflare account (free tier sufficient)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. (Optional) Generate Worker types:
   ```bash
   bun run cf-typegen
   ```

## Development

Start the development server with hot reload for both frontend and worker:

```bash
bun dev
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api/*` (proxied via Worker)

**Scripts**:
- `bun dev` - Development server
- `bun build` - Build for production
- `bun lint` - Lint codebase
- `bun preview` - Preview production build locally

### Project Structure

```
├── src/              # React frontend
├── worker/           # Cloudflare Worker (Hono API)
├── shared/           # Shared types & mock data
├── tailwind.config.js # UI theming
└── wrangler.jsonc    # Worker config (DO NOT MODIFY)
```

**Key Files to Customize**:
- `src/pages/HomePage.tsx` - Main UI
- `worker/user-routes.ts` - Add API routes
- `worker/entities.ts` - Extend entities (Users, Chats, etc.)

## Usage Examples

### API Endpoints (via `api-client.ts`)

```typescript
// List users (paginated)
const { items: users, next } = await api<{ items: User[]; next: string | null }>('/api/users?limit=10')

// Create chat
const chat = await api<Chat>('/api/chats', {
  method: 'POST',
  body: JSON.stringify({ title: 'New Chat' })
})

// Send message
await api('/api/chats/:chatId/messages', {
  method: 'POST',
  body: JSON.stringify({ userId: 'u1', text: 'Hello!' })
})
```

### Frontend Data Fetching (TanStack Query)

All API calls use `api()` helper with automatic error handling and Query integration.

## Deployment

Deploy to Cloudflare Workers (free, global edge network):

1. **Login**:
   ```bash
   wrangler login
   ```

2. **Deploy** (builds + deploys worker + assets):
   ```bash
   bun deploy
   ```

   Or:
   ```bash
   wrangler deploy
   ```

**[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bilbywilby/delta-intelligent-context-retention-system)**

### Post-Deploy

- Custom domain: `wrangler deploy --var ASSETS_SUBDOMAIN=your-subdomain`
- Preview deployments: Use Cloudflare Dashboard > Workers > Deployments
- Observability: Real-time logs/metrics in Cloudflare Dashboard

**Customizations**:
- Edit `wrangler.jsonc` for bindings/migrations (rarely needed)
- Assets SPA-routed: All `/` paths serve `index.html` after Worker

## Local Testing

Mock seed data auto-populates on first API call:

```bash
curl http://localhost:3000/api/users
# => [{ id: "u1", name: "User A" }, ...]
```

## Contributing

1. Fork & clone
2. `bun install`
3. `bun dev`
4. Add features/PRs to `user-routes.ts` & `HomePage.tsx`
5. Follow TypeScript/shadcn conventions

## License

MIT - see [LICENSE](LICENSE) (or add your own).