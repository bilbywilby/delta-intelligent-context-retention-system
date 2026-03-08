import { IndexedEntity } from "./core-utils";
import type { SessionState, Checkpoint, DeletionEpisode, User } from "@shared/types";
import { MOCK_SESSIONS, MOCK_EPISODES, MOCK_USERS, MOCK_CHECKPOINTS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export class SessionEntity extends IndexedEntity<SessionState> {
  static readonly entityName = "session";
  static readonly indexName = "sessions";
  static readonly initialState: SessionState = {
    id: "",
    title: "",
    createdAt: 0,
    updatedAt: 0,
    checkpoints: []
  };
  static seedData = MOCK_SESSIONS.map(s => ({
    ...s,
    checkpoints: MOCK_CHECKPOINTS.filter(c => c.sessionId === s.id)
  }));
  async addCheckpoint(checkpoint: Checkpoint): Promise<void> {
    await this.mutate(s => ({
      ...s,
      updatedAt: Date.now(),
      lastCheckpointId: checkpoint.id,
      checkpoints: [...s.checkpoints, checkpoint]
    }));
  }
}
export class EpisodeEntity extends IndexedEntity<DeletionEpisode> {
  static readonly entityName = "episode";
  static readonly indexName = "episodes";
  static readonly initialState: DeletionEpisode = {
    id: "",
    context: "",
    deletedContent: "",
    reason: "",
    outcome: "neutral",
    timestamp: 0,
    source: "MANUAL",
    metadata: {}
  };
  static seedData = MOCK_EPISODES.map(ep => ({
    ...ep,
    source: (ep as any).source || 'MANUAL',
    metadata: (ep as any).metadata || {}
  }));
}