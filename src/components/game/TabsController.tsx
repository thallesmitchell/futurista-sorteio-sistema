
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
      <TabsList 
        className={`grid w-full grid-cols-${tabsList.length} mb-6 p-1 rounded-xl border border-primary/20 bg-muted/30 backdrop-blur-sm`}
      >
        {tabsList.map(tab => (
          <TabsTrigger 
            key={tab.id}
            value={tab.id} 
            className={`${isMobile ? "text-xs py-2" : "text-sm py-3"} data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300`}
          >
            <tab.icon className={`${isMobile ? "mr-1 h-3.5 w-3.5" : "mr-2 h-4 w-4"}`} />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <div className="transition-all duration-300">
        {children}
      </div>
    </Tabs>
  );
};
