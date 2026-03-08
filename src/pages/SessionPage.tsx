import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import type { SessionState, Checkpoint, EnhanceResponse } from '@shared/types';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Save, Sparkles, History, ArrowLeft, CheckCircle2, Loader2, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
export function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const { data: session, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => api<SessionState>(`/api/sessions/${id}`),
    enabled: !!id,
  });
  const { data: enhanceData, mutate: enhance, isPending: isEnhancing } = useMutation({
    mutationFn: (text: string) => api<EnhanceResponse>('/api/enhance', {
      method: 'POST',
      body: JSON.stringify({ content: text }),
    }),
  });
  const { mutate: saveCheckpoint, isPending: isSaving } = useMutation({
    mutationFn: (text: string) => api<Checkpoint>(`/api/sessions/${id}/checkpoint`, {
      method: 'POST',
      body: JSON.stringify({ content: text }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      toast.success('Checkpoint Saved', { icon: <Save className="h-4 w-4" /> });
    },
  });
  if (isLoading) {
    return (
      <AppLayout container>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-secondary" />
          <h2 className="font-display text-2xl font-black italic">Delta is waking up the workspace...</h2>
        </div>
      </AppLayout>
    );
  }
  if (!session) return <AppLayout container>Session not found</AppLayout>;
  return (
    <AppLayout className="bg-paper min-h-screen">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden border-t-2 border-primary">
        {/* Left Pane: Editor */}
        <div className="flex-1 flex flex-col bg-white border-r-2 border-primary">
          <header className="p-4 border-b-2 border-primary flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 hover:bg-accent rounded-none border-2 border-transparent hover:border-primary transition-all">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h2 className="text-2xl font-display font-black">{session.title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => saveCheckpoint(content)}
                disabled={isSaving || !content}
                className="illustrative-button bg-white text-sm"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2 inline" /> : <Save className="h-4 w-4 mr-2 inline" />}
                Save Checkpoint
              </button>
              <button
                onClick={() => enhance(content)}
                disabled={isEnhancing || !content}
                className="illustrative-button bg-secondary text-sm"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                    Syncing with Delta...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 inline" />
                    Enhance
                  </>
                )}
              </button>
            </div>
          </header>
          <div className="flex-1 p-6 relative">
            <Textarea
              className="w-full h-full resize-none border-none p-0 text-lg font-mono focus-visible:ring-0 leading-relaxed placeholder:italic"
              placeholder="Enter deletion context or code block here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {!content && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <Brain className="h-64 w-64" />
              </div>
            )}
          </div>
        </div>
        {/* Right Pane: Intelligence & History */}
        <div className="w-96 flex flex-col bg-paper overflow-y-auto border-l-2 border-primary">
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-secondary" />
                <h3 className="font-display font-black text-xl italic uppercase">Memory Console</h3>
              </div>
              {isEnhancing ? (
                <div className="illustrative-card border-dashed bg-white p-6 text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-secondary" />
                  <p className="text-xs font-bold uppercase animate-pulse italic">Scanning neural pathways...</p>
                </div>
              ) : enhanceData ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="illustrative-card bg-secondary/20 border-secondary">
                    <p className="font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Suggestions:
                    </p>
                    <ul className="space-y-2 text-sm italic list-disc list-inside">
                      {enhanceData.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  {enhanceData.relevantEpisodes.map((ep) => (
                    <div key={ep.id} className="illustrative-card bg-white text-sm space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase opacity-60">
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {ep.source || 'HISTORY'}
                        </span>
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <p className="font-bold line-clamp-2">"{ep.context}"</p>
                      <div className="p-2 bg-paper border-l-2 border-primary text-[10px] italic">
                        Outcome: <span className="font-black uppercase">{ep.outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="illustrative-card border-dashed bg-white text-center text-muted-foreground p-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase">Click Enhance to see Delta's memory</p>
                </div>
              )}
            </section>
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 opacity-60" />
                <h3 className="font-display font-black text-xl italic uppercase">Checkpoints</h3>
              </div>
              <div className="space-y-3">
                {session.checkpoints && session.checkpoints.length > 0 ? (
                  session.checkpoints.slice().reverse().map((cp) => (
                    <div
                      key={cp.id}
                      className="illustrative-card bg-white p-3 hover:bg-accent cursor-pointer transition-colors group"
                      onClick={() => setContent(cp.content)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[10px] bg-primary text-white px-2">v{cp.id.slice(0, 4)}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">{formatDistanceToNow(cp.timestamp)} ago</span>
                      </div>
                      <p className="text-xs line-clamp-1 font-mono italic opacity-60">
                        {cp.content.slice(0, 50)}...
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-center font-bold text-muted-foreground uppercase py-4">No checkpoints yet</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}