
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConfirmCloseModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export const ConfirmCloseModal: React.FC<ConfirmCloseModalProps> = ({
  isOpen,
  setIsOpen,
  onConfirm
}) => {
  const isMobile = useIsMobile();

  const renderContent = () => (
    <div className="py-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Ao encerrar o jogo, não será possível adicionar novos jogadores ou registrar sorteios.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderFooter = () => (
    <div className="mt-4 flex gap-2 w-full">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(false)}
        className="flex-1"
      >
        Cancelar
      </Button>
      <Button 
        variant="destructive" 
        onClick={onConfirm}
        className="flex-1"
      >
        Encerrar Jogo
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="px-4">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle>Encerrar Jogo</DrawerTitle>
            <DrawerDescription>
              Tem certeza que deseja encerrar este jogo? Esta ação não pode ser desfeita.
            </DrawerDescription>
          </DrawerHeader>
          {renderContent()}
          {renderFooter()}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encerrar Jogo</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja encerrar este jogo? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
};
