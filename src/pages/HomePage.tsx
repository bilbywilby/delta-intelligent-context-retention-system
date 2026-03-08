import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Session } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, HardDrive, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
export function HomePage() {
  const { data: sessionsResponse } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api<{ items: Session[] }>('/api/sessions'),
  });
  const sessions = sessionsResponse?.items ?? [];
  return (
    <AppLayout container>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 border-2 border-primary bg-secondary px-3 py-1 text-sm font-bold shadow-hard-sm">
            <Sparkles className="h-4 w-4" />
            <span>Mascot Delta is Online</span>
          </div>
          <h1 className="text-6xl font-display font-black leading-none">
            Welcome back, <br />
            <span className="text-secondary drop-shadow-[2px_2px_0px_rgba(15,23,42,1)]">Workspace Sentinel.</span>
          </h1>
          <p className="max-w-2xl text-xl text-muted-foreground font-medium italic">
            "I've been keeping watch. Your semantic memory bank has grown by 12% since Tuesday. Ready to prune?"
          </p>
        </section>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="illustrative-card bg-white flex flex-col justify-between h-40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm uppercase tracking-wider opacity-60">Active Sessions</span>
              <HardDrive className="h-5 w-5" />
            </div>
            <span className="text-5xl font-display font-black">{sessions.length}</span>
          </div>
          <div className="illustrative-card bg-secondary flex flex-col justify-between h-40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm uppercase tracking-wider opacity-80">Memory Episodes</span>
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-5xl font-display font-black">42</span>
          </div>
          <div className="illustrative-card bg-white border-dashed flex flex-col items-center justify-center h-40 group cursor-pointer hover:bg-accent">
            <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm">New Session</span>
          </div>
        </div>
        {/* Recent Activity */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-display font-black">Recent Episodes</h2>
            <Link to="/sessions" className="text-sm font-bold underline underline-offset-4 decoration-2">View All Sessions</Link>
          </div>
          <div className="space-y-4">
            {sessions.map((session) => (
              <Link to={`/sessions/${session.id}`} key={session.id} className="block">
                <div className="illustrative-card bg-white hover:translate-x-1 hover:-translate-y-1 transition-transform flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{session.title}</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase">
                      Updated {formatDistanceToNow(session.updatedAt)} ago
                    </p>
                  </div>
                  <ArrowRight className="h-6 w-6" />
                </div>
              </Link>
            ))}
            {sessions.length === 0 && (
              <div className="illustrative-card border-dashed py-12 text-center text-muted-foreground italic font-bold">
                No active sessions found. Delta is waiting for a command.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}