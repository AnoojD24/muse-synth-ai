import React from 'react';
import { Music, Github, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navigation = () => {
  return (
    <nav className="glass-subtle border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 glass rounded-xl">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Music Studio
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="glass-subtle">
              <Github className="h-4 w-4 mr-2" />
              Source
            </Button>
            <Button variant="ghost" size="sm" className="glass-subtle">
              <Heart className="h-4 w-4 mr-2 text-red-400" />
              Support
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};