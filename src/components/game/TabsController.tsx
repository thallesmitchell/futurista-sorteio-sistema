
import React, { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TabsControllerProps {
  children: ReactNode;
  defaultValue?: string;
  tabsList?: {
    id: string;
    label: string;
    icon: React.ElementType;
  }[];
}

export const TabsController: React.FC<TabsControllerProps> = ({ 
  children,
  defaultValue = "players",
  tabsList = [
    { id: "players", label: "Jogadores", icon: Users },
    { id: "draws", label: "Sorteios Diários", icon: Calendar }
  ]
}) => {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className={`grid grid-cols-${tabsList.length} mb-4 md:mb-8`}>
        {tabsList.map(tab => (
          <TabsTrigger 
            key={tab.id}
            value={tab.id} 
            className={`${isMobile ? "text-sm py-2" : "text-lg py-3"}`}
          >
            <tab.icon className={`${isMobile ? "mr-1 h-4 w-4" : "mr-2 h-5 w-5"}`} />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {children}
    </Tabs>
  );
};
