
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
  const { user, isSuperAdmin, session } = useAuth();
  const [admins, setAdmins] = useState<AdminRelationship[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard');
    }
  }, [isSuperAdmin, navigate]);

  // Load administrators
  useEffect(() => {
    const fetchAdmins = async () => {
      if (!user) return;
      
      setIsLoadingAdmins(true);
      try {
        // Fetch admin-superadmin relationships
        const { data: relationships, error: relError } = await supabase
          .from('admin_relationships')
          .select('*')
          .eq('super_admin_id', user.id);
          
        if (relError) throw relError;
        
        if (relationships && relationships.length > 0) {
          // For each relationship, fetch the admin's profile details
          const adminDetails = await Promise.all(
            relationships.map(async (rel) => {
              // Fetch profile
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', rel.admin_id)
                .single();
                
              return {
                ...rel,
                admin: {
                  id: rel.admin_id,
                  email: profileData?.username || 'Email não disponível',
                  created_at: profileData?.created_at || new Date().toISOString(),
                  username: profileData?.username,
                  role: profileData?.role || 'admin'
                }
              };
            })
          );
          
          setAdmins(adminDetails);
        } else {
          setAdmins([]);
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
        // Count administrators
        const { count: adminCount } = await supabase
          .from('admin_relationships')
          .select('*', { count: 'exact', head: true })
          .eq('super_admin_id', user.id);
          
        // Count games (direct and from administrators)
        const { count: gamesCount } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true })
          .or(`owner_id.eq.${user.id},owner_id.in.(${admins.map(a => a.admin_id).join(',')})`);
          
        // Count players in all games
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

  // Add a new administrator using Edge Function
  const onAddAdmin = form.handleSubmit(async (data) => {
    if (!session) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para realizar esta ação.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`https://stwogjmlokgpkdliizxf.supabase.co/functions/v1/create-admin-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: data.username
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao adicionar administrador');
      }
      
      if (result.warning) {
        console.warn('Warning:', result.warning);
      }
      
      // Update local admins list temporarily
      if (result.user) {
        const newAdminRelationship = {
          id: result.relationshipId || crypto.randomUUID(),
          super_admin_id: user!.id,
          admin_id: result.user.id,
          created_at: new Date().toISOString(),
          admin: {
            id: result.user.id,
            email: data.email,
            created_at: new Date().toISOString(),
            username: data.username,
            role: 'admin'
          }
        };
        
        setAdmins(prev => [...prev, newAdminRelationship]);
      }
      
      // Reset form and close dialog
      form.reset();
      setIsAddDialogOpen(false);
      
      toast({
        title: "Administrador adicionado",
        description: `${data.username} (${data.email}) foi adicionado com sucesso.`,
      });
      
      // Refresh the admins list after adding a new admin
      window.setTimeout(() => {
        if (user && isSuperAdmin) {
          fetchAdmins();
        }
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao adicionar administrador:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível adicionar o administrador.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  // Fetch admins function to be called after adding a new admin
  const fetchAdmins = async () => {
    if (!user) return;
    
    setIsLoadingAdmins(true);
    try {
      // Fetch admin-superadmin relationships
      const { data: relationships, error: relError } = await supabase
        .from('admin_relationships')
        .select('*')
        .eq('super_admin_id', user.id);
        
      if (relError) throw relError;
      
      if (relationships && relationships.length > 0) {
        // For each relationship, fetch the admin's profile details
        const adminDetails = await Promise.all(
          relationships.map(async (rel) => {
            // Fetch profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', rel.admin_id)
              .single();
              
            return {
              ...rel,
              admin: {
                id: rel.admin_id,
                email: profileData?.username || 'Email não disponível',
                created_at: profileData?.created_at || new Date().toISOString(),
                username: profileData?.username || 'Administrador sem nome',
                role: profileData?.role || 'admin'
              }
            };
          })
        );
        
        setAdmins(adminDetails);
      } else {
        setAdmins([]);
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

  // Remove an administrator
  const handleDeleteAdmin = async (adminId: string) => {
    try {
      // 1. Remove relationship
      const { error } = await supabase
        .from('admin_relationships')
        .delete()
        .eq('super_admin_id', user!.id)
        .eq('admin_id', adminId);
        
      if (error) throw error;
      
      // 2. Update local list
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adicionando..." : "Adicionar"}
                  </Button>
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
                          <TableCell className="font-medium">
                            {relation.admin?.username || 'Administrador sem nome'}
                          </TableCell>
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
