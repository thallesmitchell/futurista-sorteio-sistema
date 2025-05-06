
import React, { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TabsControllerProps {
  children: ReactNode;
  defaultValue?: string;
}

export const TabsController: React.FC<TabsControllerProps> = ({ 
  children,
  defaultValue = "players"
}) => {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4 md:mb-8">
        <TabsTrigger value="players" className={`${isMobile ? "text-sm py-2" : "text-lg py-3"}`}>
          <Users className={`${isMobile ? "mr-1 h-4 w-4" : "mr-2 h-5 w-5"}`} />
          Jogadores
        </TabsTrigger>
        <TabsTrigger value="draws" className={`${isMobile ? "text-sm py-2" : "text-lg py-3"}`}>
          <Calendar className={`${isMobile ? "mr-1 h-4 w-4" : "mr-2 h-5 w-5"}`} />
          Sorteios Diários
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};
