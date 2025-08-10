import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Play, Download, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GenerationHistoryProps {
  onSelectGeneration: (id: string) => void;
}

interface Generation {
  id: string;
  status: string;
  created_at: string;
  music_data?: any[];
  duration?: number;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  onSelectGeneration,
}) => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGenerations();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchGenerations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchGenerations = async () => {
    try {
      const response = await fetch('http://localhost:8000/generations');
      const data = await response.json();
      setGenerations(data.generations || []);
    } catch (error) {
      console.error('Failed to fetch generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/generation/${id}`, {
        method: 'DELETE',
      });
      setGenerations(prev => prev.filter(gen => gen.id !== id));
    } catch (error) {
      console.error('Failed to delete generation:', error);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/download/${id}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai_music_${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-400/50';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/50';
      case 'queued':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-400/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/50';
    }
  };

  if (loading) {
    return (
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Generation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Generation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {generations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No generations yet. Start creating music!
            </div>
          ) : (
            <div className="space-y-3">
              {generations.map((generation) => (
                <div
                  key={generation.id}
                  className="glass rounded-lg p-4 space-y-3 hover:bg-glass/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {generation.id.substring(0, 12)}...
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(generation.status)}
                    >
                      {generation.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(generation.created_at))} ago
                    {generation.duration && (
                      <span className="ml-2">• {generation.duration.toFixed(1)}s</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectGeneration(generation.id)}
                      disabled={generation.status !== 'completed'}
                      className="flex-1 glass"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(generation.id)}
                      disabled={generation.status !== 'completed'}
                      className="glass"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(generation.id)}
                      className="glass hover:bg-destructive/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};