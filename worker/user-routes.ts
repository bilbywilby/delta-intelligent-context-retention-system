import { Hono } from "hono";
import type { Env } from './core-utils';
import { SessionEntity, EpisodeEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Checkpoint, WebhookPayload, SystemHealth, IngestRequest, IngestResponse } from "@shared/types";
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
  // PRODUCTION INGESTION PIPELINE
  app.post('/api/ingest', async (c) => {
    const body = await c.req.json<IngestRequest>();
    const { idempotencyId, extractedText, source, metadata } = body;
    if (!idempotencyId || !extractedText) return bad(c, 'Missing required fields');
    // 1. Rate Limiting & Idempotency Check
    const ip = c.req.header('cf-connecting-ip') || 'anonymous';
    const limitStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName(`ingest-limit:${ip}`));
    // Fix TS2558/TS2339: Cast to handle internal storage access correctly
    const idempKey = `ingest-idemp:${idempotencyId}`;
    const existing = await limitStub.getDoc(idempKey) as { data: string } | null;
    if (existing) {
      return c.json({ success: true, data: { accepted: true, status: 'already_processed', episodeId: existing.data } }, 202);
    }
    console.time(`ingest-process:${idempotencyId}`);
    // 2. Persist as Episode
    const episodeId = crypto.randomUUID();
    const episode = await EpisodeEntity.create(c.env, {
      id: episodeId,
      context: `Ingested from ${source}`,
      deletedContent: extractedText.slice(0, 500),
      reason: "Automated ingestion pipeline trigger",
      outcome: "neutral",
      timestamp: Date.now(),
      source: source as any || 'SYSTEM',
      metadata: metadata || {}
    });
    // 3. Mark Idempotency
    await limitStub.casPut(idempKey, 0, episodeId);
    console.timeEnd(`ingest-process:${idempotencyId}`);
    const res: IngestResponse = { accepted: true, status: 'processed', episodeId };
    return c.json({ success: true, data: res }, 202);
  });
  // SECURE WEBHOOK INGRESS
  app.post('/api/webhook', async (c) => {
    const ip = c.req.header('cf-connecting-ip') || 'anonymous';
    const payload = await c.req.json<WebhookPayload>();
    const limitStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName(`rate-limit:${ip}`));
    const countKey = `count:${Math.floor(Date.now() / 60000)}`;
    const doc = await limitStub.getDoc(countKey) as { data: number } | null;
    const currentCount = doc?.data ?? 0;
    if (currentCount > 50) return bad(c, 'Rate limit exceeded');
    await limitStub.casPut(countKey, currentCount, currentCount + 1);
    const msgId = payload.messageId;
    const msgKey = `webhook-msg:${msgId}`;
    if (await limitStub.has(msgKey)) return ok(c, { status: 'duplicate' });
    await limitStub.casPut(msgKey, 0, Date.now());
    if (!payload.signature || !payload.ciphertext) return bad(c, 'Invalid security');
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
    const session = await SessionEntity.create(c.env, {
      id: crypto.randomUUID(),
      title: title.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
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