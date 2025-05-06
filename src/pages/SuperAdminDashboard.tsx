
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from "@/components/ui/use-toast";
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Trash2, UserPlus, Eye, Users, Activity, User } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  created_at: string;
  username: string | null;
  role: string;
}

interface AdminRelationship {
  id: string;
  super_admin_id: string;
  admin_id: string;
  created_at: string;
  admin?: Admin;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminRelationship[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalGames: 0,
    totalPlayers: 0
  });
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      username: '',
    },
  });

  // Redirecionar se não for super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard');
    }
  }, [isSuperAdmin, navigate]);

  // Carregar administradores
  useEffect(() => {
    const fetchAdmins = async () => {
      if (!user) return;
      
      setIsLoadingAdmins(true);
      try {
        // Buscar relações administrador-superadmin
        const { data: relationships, error: relError } = await supabase
          .from('admin_relationships')
          .select('*')
          .eq('super_admin_id', user.id);
          
        if (relError) throw relError;
        
        if (relationships) {
          // Para cada relação, buscar detalhes do perfil do administrador
          const adminDetails = await Promise.all(
            relationships.map(async (rel) => {
              // Buscar o usuário através das tabelas auth.users e profiles
              const { data: userData } = await supabase.auth.admin.getUserById(rel.admin_id);
              
              // Buscar perfil
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', rel.admin_id)
                .single();
                
              return {
                ...rel,
                admin: {
                  id: rel.admin_id,
                  email: userData?.user?.email || 'Email não disponível',
                  created_at: userData?.user?.created_at || new Date().toISOString(),
                  username: profileData?.username,
                  role: profileData?.role || 'admin'
                }
              };
            })
          );
          
          setAdmins(adminDetails);
        }
      } catch (error) {
        console.error('Erro ao carregar administradores:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de administradores.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingAdmins(false);
      }
    };
    
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Contar administradores
        const { count: adminCount } = await supabase
          .from('admin_relationships')
          .select('*', { count: 'exact', head: true })
          .eq('super_admin_id', user.id);
          
        // Contar jogos (diretos e de administradores)
        const { count: gamesCount } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true })
          .or(`owner_id.eq.${user.id},owner_id.in.(${admins.map(a => a.admin_id).join(',')})`);
          
        // Contar jogadores em todos os jogos
        const { count: playersCount } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .filter('game_id', 'in', '(select id from games where owner_id = ${user.id} or owner_id in (select admin_id from admin_relationships where super_admin_id = ${user.id}))');
          
        setStats({
          totalAdmins: adminCount || 0,
          totalGames: gamesCount || 0,
          totalPlayers: playersCount || 0
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };
    
    if (user && isSuperAdmin) {
      fetchAdmins();
      fetchStats();
    }
  }, [user, isSuperAdmin, navigate, toast]);

  // Adicionar um novo administrador
  const onAddAdmin = form.handleSubmit(async (data) => {
    try {
      // 1. Criar usuário no Authentication
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { username: data.username }
      });

      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }
      
      // 2. Criar relação super_admin -> admin
      const { error: relError } = await supabase
        .from('admin_relationships')
        .insert({
          super_admin_id: user!.id,
          admin_id: authData.user.id
        });
        
      if (relError) throw relError;
      
      // Atualizar lista de administradores
      setAdmins(prev => [...prev, {
        id: crypto.randomUUID(),
        super_admin_id: user!.id,
        admin_id: authData.user.id,
        created_at: new Date().toISOString(),
        admin: {
          id: authData.user.id,
          email: data.email,
          created_at: new Date().toISOString(),
          username: data.username,
          role: 'admin'
        }
      }]);
      
      // Resetar formulário e fechar diálogo
      form.reset();
      setIsAddDialogOpen(false);
      
      toast({
        title: "Administrador adicionado",
        description: `${data.username} (${data.email}) foi adicionado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao adicionar administrador:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível adicionar o administrador.",
        variant: "destructive"
      });
    }
  });

  // Remover um administrador
  const handleDeleteAdmin = async (adminId: string) => {
    try {
      // 1. Remover relação
      const { error } = await supabase
        .from('admin_relationships')
        .delete()
        .eq('super_admin_id', user!.id)
        .eq('admin_id', adminId);
        
      if (error) throw error;
      
      // 2. Atualizar lista local
      setAdmins(prev => prev.filter(admin => admin.admin_id !== adminId));
      
      toast({
        title: "Administrador removido",
        description: "O administrador foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover administrador:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o administrador.",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Painel Super Administrador</h1>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Administrador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={onAddAdmin}>
                <DialogHeader>
                  <DialogTitle>Adicionar Administrador</DialogTitle>
                  <DialogDescription>
                    Crie uma conta para um novo administrador do sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right col-span-1">
                      Nome
                    </Label>
                    <Input
                      id="username"
                      placeholder="Nome do administrador"
                      className="col-span-3"
                      {...form.register('username', { required: true })}
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right col-span-1">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      className="col-span-3"
                      {...form.register('email', { required: true })}
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right col-span-1">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="col-span-3"
                      {...form.register('password', { required: true })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Adicionar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAdmins}</div>
              <p className="text-xs text-muted-foreground">
                Administradores ativos sob sua gestão
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jogos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <p className="text-xs text-muted-foreground">
                Total de jogos criados por você e seus administradores
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jogadores</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
              <p className="text-xs text-muted-foreground">
                Total de jogadores em todos os jogos
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
            <TabsTrigger value="admins">Administradores</TabsTrigger>
            <TabsTrigger value="games">Jogos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="admins">
            <Card className="futuristic-card">
              <CardHeader>
                <CardTitle>Gerenciar Administradores</CardTitle>
                <CardDescription>
                  Administre os usuários que podem gerenciar jogos sob sua supervisão.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAdmins ? (
                  <div className="text-center py-8">Carregando administradores...</div>
                ) : admins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Você ainda não adicionou nenhum administrador.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Administrador
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((relation) => (
                        <TableRow key={relation.id}>
                          <TableCell className="font-medium">{relation.admin?.username || 'N/A'}</TableCell>
                          <TableCell>{relation.admin?.email}</TableCell>
                          <TableCell>{new Date(relation.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="destructive"
                              size="sm" 
                              onClick={() => handleDeleteAdmin(relation.admin_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/view/${relation.admin_id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="games">
            <Card className="futuristic-card">
              <CardHeader>
                <CardTitle>Todos os Jogos</CardTitle>
                <CardDescription>
                  Visualize todos os jogos gerenciados por você e seus administradores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Funcionalidade de visualização consolidada de jogos em implementação.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
