import React, { useState, useEffect } from 'react';
import { MusicGenerator } from '@/components/MusicGenerator';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { GenerationHistory } from '@/components/GenerationHistory';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const [currentGeneration, setCurrentGeneration] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <Navigation />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            AI Music Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create beautiful music with advanced AI. Choose your style, set your parameters, 
            and let our neural network compose your next masterpiece.
          </p>
        </div>

        {/* Audio Visualizer */}
        <div className="mb-12">
          <AudioVisualizer 
            isActive={isGenerating} 
            generationId={currentGeneration}
          />
        </div>

        {/* Main Generator Interface */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MusicGenerator 
              onGenerationStart={(id) => {
                setCurrentGeneration(id);
                setIsGenerating(true);
              }}
              onGenerationComplete={() => {
                setIsGenerating(false);
              }}
            />
          </div>
          
          <div>
            <GenerationHistory 
              onSelectGeneration={(id) => setCurrentGeneration(id)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;