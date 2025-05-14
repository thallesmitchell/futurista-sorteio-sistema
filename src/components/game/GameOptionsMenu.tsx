
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { MoreVertical, FileJson, Upload, Download } from 'lucide-react';
import { useGame } from '@/contexts/game';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GameOptionsMenuProps {
  gameId: string;
}

export const GameOptionsMenu: React.FC<GameOptionsMenuProps> = ({ gameId }) => {
  const { exportGame, importGame } = useGame();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportClick = async () => {
    try {
      setIsExporting(true);
      const data = await exportGame(gameId);
      setExportData(data);
      setIsExportDialogOpen(true);
    } catch (error) {
      toast({
        title: "Erro ao exportar jogo",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
    toast({
      title: "Copiado!",
      description: "Dados do jogo copiados para a área de transferência."
    });
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-export-${gameId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download iniciado",
      description: "O arquivo JSON está sendo baixado."
    });
  };

  const handleImportSubmit = async () => {
    if (!importData.trim()) {
      toast({
        title: "Erro ao importar",
        description: "Dados de importação vazios",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      JSON.parse(importData); // Validate JSON

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const importedGame = await importGame(importData, user.id);
      
      setIsImportDialogOpen(false);
      setImportData('');
      
      toast({
        title: "Jogo importado com sucesso",
        description: `O jogo "${importedGame.name}" foi importado.`
      });
      
      // Navigate to the newly imported game
      navigate(`/game/${importedGame.id}`);
    } catch (error) {
      toast({
        title: "Erro ao importar jogo",
        description: error instanceof Error 
          ? `Formato inválido: ${error.message}` 
          : "O arquivo não está no formato correto",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleExportClick}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Jogo
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleImportClick}
            disabled={isImporting}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Jogo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exportar Jogo</DialogTitle>
            <DialogDescription>
              Copie os dados abaixo ou faça o download do arquivo JSON.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-xs">
                {exportData}
              </pre>
              
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCopyToClipboard}>
                  <FileJson className="mr-2 h-4 w-4" /> Copiar
                </Button>
                <Button onClick={handleDownloadJson}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar Jogo</DialogTitle>
            <DialogDescription>
              Cole os dados do jogo no formato JSON ou envie um arquivo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">Upload de arquivo</Label>
              <Input 
                id="import-file" 
                type="file" 
                accept=".json" 
                onChange={handleFileUpload} 
                className="mt-1" 
              />
            </div>
            
            <div>
              <Label htmlFor="import-text">Ou cole os dados JSON</Label>
              <textarea
                id="import-text"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full min-h-32 p-2 border rounded-md mt-1"
                placeholder='{"game": {...}, "players": [...], ...}'
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleImportSubmit} 
                disabled={isImporting || !importData.trim()}
              >
                {isImporting ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameOptionsMenu;
