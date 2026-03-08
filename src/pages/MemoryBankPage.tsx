import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { DeletionEpisode } from '@shared/types';
import { Brain, Search, Trash2, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
export function MemoryBankPage() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: episodesResponse, isLoading } = useQuery({
    queryKey: ['episodes'],
    queryFn: () => api<{ items: DeletionEpisode[] }>('/api/episodes'),
  });
  const episodes = episodesResponse?.items ?? [];
  const filtered = episodes.filter(e =>
    e.context.toLowerCase().includes(search.toLowerCase()) ||
    e.reason.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(e.metadata || {}).toLowerCase().includes(search.toLowerCase())
  );
  const OutcomeIcon = ({ outcome }: { outcome: DeletionEpisode['outcome'] }) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reverted': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-amber-600" />;
    }
  };
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 border-2 border-primary bg-secondary shadow-hard-sm">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-black">Memory Bank</h1>
              <p className="text-muted-foreground italic font-medium">"My records of every deletion episode Delta has witnessed."</p>
            </div>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search semantic history or metadata..."
              className="illustrative-input w-full pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="illustrative-card h-64 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ep) => (
              <div key={ep.id} className="illustrative-card flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {format(ep.timestamp, 'MMM dd, yyyy')}
                    </span>
                    <div className="flex gap-2">
                      <div className="px-2 py-0.5 border-2 border-primary bg-white text-[10px] font-black uppercase shadow-hard-sm">
                        {ep.source || 'MANUAL'}
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 border-2 border-primary text-[10px] font-black uppercase shadow-hard-sm",
                        ep.outcome === 'success' ? 'bg-green-100' : ep.outcome === 'reverted' ? 'bg-red-100' : 'bg-amber-100'
                      )}>
                        {ep.outcome}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight mb-2">"{ep.context}"</h3>
                    <div className="p-3 bg-primary text-white font-mono text-xs overflow-hidden">
                      <code className="line-clamp-3">{ep.deletedContent}</code>
                    </div>
                  </div>
                  <p className="text-sm italic text-muted-foreground">
                    <span className="font-bold uppercase text-[10px] not-italic block mb-1">Reason:</span>
                    {ep.reason}
                  </p>
                  {ep.metadata && Object.keys(ep.metadata).length > 0 && (
                    <div className="pt-2">
                      <button 
                        onClick={() => setExpandedId(expandedId === ep.id ? null : ep.id)}
                        className="flex items-center gap-1 text-[10px] font-black uppercase hover:underline"
                      >
                        <Database className="h-3 w-3" />
                        {expandedId === ep.id ? 'Hide Metadata' : 'Show Metadata'}
                        {expandedId === ep.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      {expandedId === ep.id && (
                        <div className="mt-2 p-2 bg-accent/50 border-2 border-primary text-[10px] font-mono whitespace-pre overflow-x-auto">
                          {JSON.stringify(ep.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t-2 border-dashed border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <OutcomeIcon outcome={ep.outcome} />
                    <span className="text-xs font-bold uppercase">Verified Episode</span>
                  </div>
                  <Trash2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-not-allowed" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="illustrative-card border-dashed py-20 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-display text-xl font-bold italic text-muted-foreground">
              "Delta has no record of that specific episode. Perhaps we should create a new one?"
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}