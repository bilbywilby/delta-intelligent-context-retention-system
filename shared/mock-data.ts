import type { User, Session, DeletionEpisode, Checkpoint } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Husky Admin' }
];
export const MOCK_SESSIONS: Session[] = [
  { id: 's1', title: 'Refactoring Auth Module', createdAt: Date.now() - 86400000, updatedAt: Date.now() - 3600000 },
  { id: 's2', title: 'Legacy Cleanup Phase 1', createdAt: Date.now() - 172800000, updatedAt: Date.now() - 7200000 }
];
export const MOCK_CHECKPOINTS: Checkpoint[] = [
  { id: 'ch1', sessionId: 's1', content: 'Initial boilerplate removal', timestamp: Date.now() - 3600000, label: 'Base' }
];
export const MOCK_EPISODES: DeletionEpisode[] = [
  {
    id: 'e1',
    context: 'Cleanup of redundant utility functions in the core library.',
    deletedContent: 'function deprecatedLogger() { ... }',
    reason: 'Function was no longer used after v2.0 update.',
    outcome: 'success',
    timestamp: Date.now() - 604800000
  },
  {
    id: 'e2',
    context: 'Database migration scripts from 2022.',
    deletedContent: 'DROP TABLE legacy_users;',
    reason: 'Legacy table finally cleared for production.',
    outcome: 'success',
    timestamp: Date.now() - 259200000
  }
];