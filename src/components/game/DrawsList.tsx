
import React, { useState } from 'react';
import { DailyDraw } from '@/contexts/GameContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NumberBadge } from './NumberBadge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, X } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface DrawsListProps {
  draws: DailyDraw[];
  isReadOnly?: boolean;
}

export const DrawsList: React.FC<DrawsListProps> = ({ 
  draws,
  isReadOnly = false
}) => {
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<DailyDraw | null>(null);

  // This would need to be implemented in the GameProvider with a function like deleteDraw
  const handleDeleteDraw = async (drawId: string) => {
    try {
      // Logic for deleting draw would be here
      toast({
        title: "Sorteio excluído",
        description: "O sorteio diário foi removido com sucesso",
        variant: "default",
      });
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir o sorteio",
        variant: "destructive",
      });
    }
  };

  const openDeleteModal = (draw: DailyDraw) => {
    setSelectedDraw(draw);
    setIsDeleteModalOpen(true);
  };

  return (
    <Card className="futuristic-card">
      <CardHeader>
        <CardTitle>Histórico de Sorteios</CardTitle>
        <CardDescription>
          {draws.length} sorteios realizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {draws.length > 0 ? (
          <div className="space-y-4">
            {draws
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(draw => (
                <Card key={draw.id} className="overflow-hidden border border-border/30">
                  <CardHeader className="bg-muted/20 p-4 flex flex-row justify-between items-center">
                    <CardTitle className="text-lg">
                      Sorteio do dia {new Date(draw.date).toLocaleDateString()}
                    </CardTitle>
                    {!isReadOnly && (
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 rounded-full"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full text-destructive hover:text-destructive"
                          onClick={() => openDeleteModal(draw)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {draw.numbers.sort((a, b) => a - b).map(number => (
                        <NumberBadge 
                          key={number} 
                          number={number} 
                          isHit={true} 
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum sorteio registrado.</p>
            <p className="mt-2">Adicione sorteios usando o formulário acima.</p>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Tem certeza que deseja excluir o sorteio do dia {selectedDraw ? new Date(selectedDraw.date).toLocaleDateString() : ''}?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedDraw && handleDeleteDraw(selectedDraw.id)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DrawsList;
