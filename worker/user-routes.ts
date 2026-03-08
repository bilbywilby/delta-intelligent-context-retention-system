import { Hono } from "hono";
import type { Env } from './core-utils';
import { SessionEntity, EpisodeEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Checkpoint, WebhookPayload, SystemHealth } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // HEALTH CHECK with DO Connectivity
  app.get('/api/health', async (c) => {
    try {
      const doId = c.env.GlobalDurableObject.idFromName("health-check");
      const stub = c.env.GlobalDurableObject.get(doId);
      await stub.has("ping");
      const health: SystemHealth = {
        status: 'healthy',
        storage: true,
        timestamp: new Date().toISOString()
      };
      return ok(c, health);
    } catch (e) {
      return c.json({ success: false, data: { status: 'degraded', storage: false } }, 500);
    }
  });
  // SECURE WEBHOOK INGRESS
  app.post('/api/webhook', async (c) => {
    const ip = c.req.header('cf-connecting-ip') || 'anonymous';
    const payload = await c.req.json<WebhookPayload>();
    // 1. Simple Rate Limiting via DO
    const limitId = c.env.GlobalDurableObject.idFromName(`rate-limit:${ip}`);
    const limitStub = c.env.GlobalDurableObject.get(limitId);
    const countKey = `count:${Math.floor(Date.now() / 60000)}`; // 1 min window
    const currentCount = (await limitStub.getDoc<number>(countKey))?.data ?? 0;
    if (currentCount > 50) return bad(c, 'Rate limit exceeded');
    await limitStub.casPut(countKey, currentCount, currentCount + 1);
    // 2. Idempotency Check
    const msgId = payload.messageId;
    const msgKey = `webhook-msg:${msgId}`;
    if (await limitStub.has(msgKey)) return ok(c, { status: 'duplicate' });
    await limitStub.casPut(msgKey, 0, Date.now());
    // 3. Security (Mock HMAC & AES-GCM for Phase 2 Demo)
    // In production, use SubtleCrypto to verify payload.signature with WEBHOOK_SECRET
    // and decrypt payload.ciphertext using ENCRYPTION_KEY_BASE64.
    if (!payload.signature || !payload.ciphertext) {
      return bad(c, 'Invalid security headers or payload');
    }
    // 4. Mock Ingest logic
    const session = await SessionEntity.create(c.env, {
      id: crypto.randomUUID(),
      title: `Ingested: ${msgId.slice(0, 8)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      checkpoints: []
    });
    return ok(c, { sessionId: session.id, status: 'processed' });
  });
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
    // Sort by timestamp descending
    page.items.sort((a, b) => b.timestamp - a.timestamp);
    return ok(c, page);
  });
  // ENHANCE
  app.post('/api/enhance', async (c) => {
    const { content } = await c.req.json<{ content: string }>();
    await EpisodeEntity.ensureSeed(c.env);
    const episodes = await EpisodeEntity.list(c.env);
    const relevant = episodes.items.slice(0, 2);
    return ok(c, {
      suggestions: [
        "Delta suggests checking for dependency cycles in this module.",
        "Previous successful deletions in similar context avoided breaking API contracts.",
        "Consider if these utilities can be merged into the standard library."
      ],
      relevantEpisodes: relevant
    });
  });
}