import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Download, Music, Zap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MusicGeneratorProps {
  onGenerationStart: (id: string) => void;
  onGenerationComplete: () => void;
}

interface GenerationRequest {
  genre: string;
  tempo: number;
  length: number;
  temperature: number;
  top_k: number;
  key: string;
  mode: string;
}

interface GenerationStatus {
  id: string;
  status: string;
  progress: number;
  message: string;
}

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({
  onGenerationStart,
  onGenerationComplete,
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [params, setParams] = useState<GenerationRequest>({
    genre: 'classical',
    tempo: 120,
    length: 100,
    temperature: 0.8,
    top_k: 50,
    key: 'C',
    mode: 'free'
  });

  const genres = [
    { value: 'classical', label: 'Classical', color: 'genre-classical' },
    { value: 'jazz', label: 'Jazz', color: 'genre-jazz' },
    { value: 'rock', label: 'Rock', color: 'genre-rock' },
    { value: 'pop', label: 'Pop', color: 'genre-pop' },
    { value: 'electronic', label: 'Electronic', color: 'genre-electronic' }
  ];

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!currentGeneration) return;

    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.generation_id === currentGeneration) {
        setProgress(data.progress);
        setStatusMessage(data.message);
        
        if (data.status === 'completed') {
          setIsGenerating(false);
          onGenerationComplete();
          toast({
            title: "Music Generated!",
            description: "Your AI composition is ready to play.",
          });
        }
      }
    };

    return () => ws.close();
  }, [currentGeneration]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setStatusMessage('Starting generation...');

      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error('Generation failed');

      const result = await response.json();
      setCurrentGeneration(result.id);
      onGenerationStart(result.id);

      toast({
        title: "Generation Started",
        description: "AI is composing your music...",
      });
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStop = () => {
    setIsGenerating(false);
    setCurrentGeneration(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Music Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Genre Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Genre</label>
            <div className="grid grid-cols-5 gap-3">
              {genres.map((genre) => (
                <div
                  key={genre.value}
                  className={`genre-card text-center ${
                    params.genre === genre.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setParams({ ...params, genre: genre.value })}
                >
                  <div className="text-sm font-medium">{genre.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Parameters Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tempo */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center justify-between">
                Tempo
                <Badge variant="secondary">{params.tempo} BPM</Badge>
              </label>
              <Slider
                value={[params.tempo]}
                onValueChange={(value) => setParams({ ...params, tempo: value[0] })}
                min={60}
                max={200}
                step={5}
                className="w-full"
              />
            </div>

            {/* Length */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center justify-between">
                Length
                <Badge variant="secondary">{params.length} notes</Badge>
              </label>
              <Slider
                value={[params.length]}
                onValueChange={(value) => setParams({ ...params, length: value[0] })}
                min={50}
                max={500}
                step={10}
                className="w-full"
              />
            </div>

            {/* Creativity */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center justify-between">
                Creativity
                <Badge variant="secondary">{params.temperature.toFixed(1)}</Badge>
              </label>
              <Slider
                value={[params.temperature]}
                onValueChange={(value) => setParams({ ...params, temperature: value[0] })}
                min={0.1}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Key */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Key</label>
              <Select
                value={params.key}
                onValueChange={(value) => setParams({ ...params, key: value })}
              >
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {keys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key} Major
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generation Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isGenerating ? (
              <Button
                onClick={handleGenerate}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary-glow hover:to-secondary-glow"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Music
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Generation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};