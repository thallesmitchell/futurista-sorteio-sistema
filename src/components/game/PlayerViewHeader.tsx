
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';

interface PlayerViewHeaderProps {
  gameName: string;
  playersCount: number;
  drawsCount: number;
  handleGeneratePDF: () => void;
  isGenerating: boolean;
  gameId: string;
}

export const PlayerViewHeader: React.FC<PlayerViewHeaderProps> = ({
  gameName,
  playersCount,
  drawsCount,
  handleGeneratePDF,
  isGenerating,
  gameId,
}) => {
  return (
    <div className="py-4 px-4 md:px-0 flex items-center justify-between border-b border-border/30 mb-4">
      <div>
        <h1 className="text-2xl font-bold">{gameName}</h1>
        <p className="text-muted-foreground">
          {playersCount} players | {drawsCount} draws
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
        >
          <Link to={`/admin/${gameId}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button 
          onClick={handleGeneratePDF} 
          variant="outline"
          size="sm"
          disabled={isGenerating}
        >
          <FileText className="mr-1 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Save as PDF'}
        </Button>
      </div>
    </div>
  );
};
