
import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/components/game/GameFinancialCards';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinancialProjection } from '@/contexts/game/types';
import { Input } from '@/components/ui/input';

const FinancialView = () => {
  const { loadFinancialProjections } = useGame();
  const { toast } = useToast();
  const [activeFinancialData, setActiveFinancialData] = useState<FinancialProjection[]>([]);
  const [allFinancialData, setAllFinancialData] = useState<FinancialProjection[]>([]);
  const [filteredData, setFilteredData] = useState<FinancialProjection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate totals
  const calculateTotals = (data: FinancialProjection[]) => {
    return data.reduce(
      (acc, curr) => {
        acc.totalCollected += curr.totalCollected || 0;
        acc.adminProfit += curr.adminProfit || 0;
        acc.totalPrize += curr.totalPrize || 0;
        return acc;
      },
      { totalCollected: 0, adminProfit: 0, totalPrize: 0 }
    );
  };

  const activeTotals = calculateTotals(activeFinancialData);
  const allTotals = calculateTotals(filteredData.length > 0 ? filteredData : allFinancialData);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load financial data
        const start_date = undefined; // No date filtering initially
        const end_date = undefined;
        const financialData = await loadFinancialProjections(start_date, end_date) || [];
        
        // Filter active games
        const activeGames = financialData.filter(g => g.status === 'active');
        setActiveFinancialData(activeGames);
        
        // All games
        setAllFinancialData(financialData);
        setFilteredData(financialData);
      } catch (error) {
        console.error('Error loading financial data:', error);
        toast({
          title: 'Erro ao carregar dados financeiros',
          description: 'Não foi possível carregar as projeções financeiras.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadFinancialProjections, toast]);

  // Apply filters when date range or search term changes
  useEffect(() => {
    let filtered = [...allFinancialData];

    // Apply date filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(game => {
        const gameDate = new Date(game.start_date);
        return gameDate >= dateRange.from! && gameDate <= dateRange.to!;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        game => game.name && game.name.toLowerCase().includes(term)
      );
    }

    setFilteredData(filtered);
  }, [dateRange, searchTerm, allFinancialData]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const start_date = undefined;
      const end_date = undefined;
      const financialData = await loadFinancialProjections(start_date, end_date) || [];
      const activeGames = financialData.filter(g => g.status === 'active');
      setActiveFinancialData(activeGames);
      setAllFinancialData(financialData);
      setFilteredData(financialData);
      toast({
        title: 'Dados atualizados',
        description: 'As projeções financeiras foram atualizadas.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar dados',
        description: 'Não foi possível atualizar as projeções financeiras.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'P', { locale: ptBR })} - ${format(
        dateRange.to,
        'P',
        { locale: ptBR }
      )}`;
    }
    return 'Selecionar período';
  };

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Projeções Financeiras</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active">Jogos Ativos</TabsTrigger>
          <TabsTrigger value="all">Todos os Jogos</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Valor Arrecadado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(activeTotals.totalCollected)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Lucro do Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(activeTotals.adminProfit)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Prêmios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(activeTotals.totalPrize)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes por Jogo Ativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Jogo</TableHead>
                      <TableHead>Data de Início</TableHead>
                      <TableHead>Sequências</TableHead>
                      <TableHead>Valor Arrecadado</TableHead>
                      <TableHead>Lucro Admin</TableHead>
                      <TableHead>Prêmios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeFinancialData.length > 0 ? (
                      activeFinancialData.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell className="font-medium">{game.name}</TableCell>
                          <TableCell>{format(new Date(game.start_date), 'P', { locale: ptBR })}</TableCell>
                          <TableCell>{game.totalSequences}</TableCell>
                          <TableCell>{formatCurrency(game.totalCollected || 0)}</TableCell>
                          <TableCell>{formatCurrency(game.adminProfit || 0)}</TableCell>
                          <TableCell>{formatCurrency(game.totalPrize || 0)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          {isLoading ? 'Carregando dados...' : 'Nenhum jogo ativo encontrado.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar jogos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 space-y-3">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range as any)}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={clearDateRange}>
                        Limpar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Valor Arrecadado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(allTotals.totalCollected)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Lucro do Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(allTotals.adminProfit)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Prêmios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(allTotals.totalPrize)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes de Todos os Jogos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Jogo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Início</TableHead>
                      <TableHead>Sequências</TableHead>
                      <TableHead>Valor Arrecadado</TableHead>
                      <TableHead>Lucro Admin</TableHead>
                      <TableHead>Prêmios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell className="font-medium">{game.name}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${game.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {game.status === 'active' ? 'Ativo' : 'Encerrado'}
                            </span>
                          </TableCell>
                          <TableCell>{format(new Date(game.start_date), 'P', { locale: ptBR })}</TableCell>
                          <TableCell>{game.totalSequences}</TableCell>
                          <TableCell>{formatCurrency(game.totalCollected || 0)}</TableCell>
                          <TableCell>{formatCurrency(game.adminProfit || 0)}</TableCell>
                          <TableCell>{formatCurrency(game.totalPrize || 0)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          {isLoading ? 'Carregando dados...' : 'Nenhum jogo encontrado.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialView;
