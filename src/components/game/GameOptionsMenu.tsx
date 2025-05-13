
import React, { useState, useRef } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  EllipsisVertical, 
  Download, 
  Upload,
  FileJson,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/contexts/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GameOptionsMenuProps {
  gameId: string;
}

export const GameOptionsMenu: React.FC<GameOptionsMenuProps> = ({ gameId }) => {
  const { exportGame, importGame } = useGame();
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleExportGame = async () => {
    try {
      const jsonData = await exportGame(gameId);
      
      // Create a blob and download it
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jogo-${gameId.substring(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Jogo exportado com sucesso",
        description: "O arquivo JSON foi baixado no seu dispositivo",
      });
    } catch (error) {
      console.error('Error exporting game:', error);
      toast({
        title: "Erro ao exportar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (!event.target?.result || typeof event.target.result !== 'string') {
            throw new Error('Falha ao ler o arquivo');
          }

          if (!user?.id) {
            throw new Error('Usuário não autenticado');
          }
          
          // Attempt to parse the JSON to validate it before importing
          JSON.parse(event.target.result);
          
          await importGame(event.target.result, user.id);
          
          toast({
            title: "Jogo importado com sucesso",
            description: "O jogo foi importado e está disponível no dashboard",
          });
          
          setIsImportDialogOpen(false);
        } catch (parseError) {
          console.error('Error parsing JSON file:', parseError);
          toast({
            title: "Erro ao importar jogo",
            description: "O arquivo não contém um formato JSON válido",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing game:', error);
      toast({
        title: "Erro ao importar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportGame} className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Exportar Jogo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleImportClick} className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Importar Jogo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileJson className="mr-2 h-5 w-5" /> 
              Importar Jogo
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary/50 rounded-lg p-6 text-center space-y-2">
              <FileJson className="h-8 w-8 mx-auto text-primary/70" />
              <p className="text-sm">Selecione um arquivo JSON de jogo para importar</p>
              <p className="text-xs text-muted-foreground">Somente arquivos exportados pelo sistema são válidos</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Selecionar arquivo
              </Button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept=".json" 
                onChange={handleFileChange}
              />
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 flex items-start">
              <AlertTriangle className="text-amber-600 dark:text-amber-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                A importação criará um novo jogo com os dados contidos no arquivo. O jogo terá um novo ID, mas manterá todas as informações de jogadores, sequências e sorteios.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameOptionsMenu;
