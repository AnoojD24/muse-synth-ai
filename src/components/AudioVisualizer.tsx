import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Music4 } from 'lucide-react';

interface AudioVisualizerProps {
  isActive: boolean;
  generationId: string | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  generationId,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);

  // Generate animated wave bars
  const waveBars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      height: Math.random() * 80 + 20,
      delay: Math.random() * 2,
    }));
  }, [generationId]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    if (!generationId) return;
    setIsPlaying(!isPlaying);
  };

  const handleDownload = async () => {
    if (!generationId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/download/${generationId}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai_music_${generationId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Card className="glass-strong">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 glass rounded-xl">
              <Music4 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Audio Visualizer</h3>
              <p className="text-sm text-muted-foreground">
                {generationId ? `Generation: ${generationId}` : 'No audio loaded'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Generating' : 'Ready'}
            </Badge>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="relative h-32 mb-6 glass rounded-xl p-4 overflow-hidden">
          <div className="flex items-end justify-center h-full gap-1">
            {waveBars.map((bar) => (
              <div
                key={bar.id}
                className={`wave-bar w-2 transition-all duration-300 ${
                  isActive || isPlaying ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${isActive || isPlaying ? bar.height : 20}%`,
                  animationDelay: `${bar.delay}s`,
                }}
              />
            ))}
          </div>
          
          {/* Playing indicator */}
          {isPlaying && (
            <div
              className="absolute top-0 left-0 h-full w-1 bg-primary-glow shadow-lg shadow-primary/50 transition-all duration-100"
              style={{
                left: `${(currentTime / duration) * 100}%`,
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              disabled={!generationId}
              className="glass"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!generationId}
              className="glass"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {generationId ? `${currentTime}s / ${duration}s` : 'No audio'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};