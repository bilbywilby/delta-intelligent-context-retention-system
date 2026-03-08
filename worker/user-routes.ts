import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, SessionEntity, EpisodeEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Checkpoint } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SESSIONS
  app.get('/api/sessions', async (c) => {
    await SessionEntity.ensureSeed(c.env);
    const page = await SessionEntity.list(c.env);
    return ok(c, page);
  });
  app.get('/api/sessions/:id', async (c) => {
    const session = new SessionEntity(c.env, c.req.param('id'));
    if (!await session.exists()) return notFound(c, 'Session not found');
    return ok(c, await session.getState());
  });
  app.post('/api/sessions', async (c) => {
    const { title } = await c.req.json<{ title?: string }>();
    if (!title?.trim()) return bad(c, 'Title required');
    const now = Date.now();
    const session = await SessionEntity.create(c.env, {
      id: crypto.randomUUID(),
      title: title.trim(),
      createdAt: now,
      updatedAt: now,
      checkpoints: []
    });
    return ok(c, session);
  });
  app.post('/api/sessions/:id/checkpoint', async (c) => {
    const { content, label } = await c.req.json<{ content: string; label?: string }>();
    const session = new SessionEntity(c.env, c.req.param('id'));
    if (!await session.exists()) return notFound(c, 'Session not found');
    const checkpoint: Checkpoint = {
      id: crypto.randomUUID(),
      sessionId: c.req.param('id'),
      content,
      label,
      timestamp: Date.now()
    };
    await session.addCheckpoint(checkpoint);
    return ok(c, checkpoint);
  });
  // EPISODES (Memory)
  app.get('/api/episodes', async (c) => {
    await EpisodeEntity.ensureSeed(c.env);
    const page = await EpisodeEntity.list(c.env);
    return ok(c, page);
  });
  // ENHANCE (Mock Logic)
  app.post('/api/enhance', async (c) => {
    const { content } = await c.req.json<{ content: string }>();
    await EpisodeEntity.ensureSeed(c.env);
    const episodes = await EpisodeEntity.list(c.env);
    // Deterministic mock selection based on text length/keywords
    const relevant = episodes.items.slice(0, 2);
    return ok(c, {
      suggestions: [
        "Consider extracting common logic into a separate utility.",
        "Ensure all references to the deleted code are updated.",
        "Previous sessions suggests keeping a backup of the legacy configuration."
      ],
      relevantEpisodes: relevant
    });
  });
}