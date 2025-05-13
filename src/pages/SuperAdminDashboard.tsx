
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Mail, User, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';

interface Admin {
  id: string;
  email: string;
  username?: string;
  created_at: string;
}

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewAdminOpen, setIsViewAdminOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  
  // Load admins
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setIsLoading(true);
        
        if (!user) return;
        
        // Get all admin relationships for this super admin
        const { data: relationshipsData, error: relationshipsError } = await supabase
          .from('admin_relationships')
          .select('admin_id')
          .eq('super_admin_id', user.id);
          
        if (relationshipsError) throw relationshipsError;
        
        if (relationshipsData && relationshipsData.length > 0) {
          // Get all admin IDs
          const adminIds = relationshipsData.map(rel => rel.admin_id);
          
          // Get admin details from profiles table
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, created_at')
            .in('id', adminIds);
            
          if (profilesError) throw profilesError;
          
          // Get emails from auth.users table via edge function
          const { data: usersData, error: usersError } = await supabase
            .functions.invoke('get-admin-emails', {
              body: { adminIds }
            });
            
          if (usersError) {
            console.error('Error fetching admin emails:', usersError);
            throw new Error('Failed to load admin emails');
          }
          
          // Combine the data
          const combinedAdmins = profilesData.map(profile => {
            const userInfo = usersData.find(u => u.id === profile.id);
            return {
              id: profile.id,
              email: userInfo?.email || 'Email não disponível',
              username: profile.username || 'Administrador sem nome',
              created_at: profile.created_at
            };
          });
          
          setAdmins(combinedAdmins);
        } else {
          setAdmins([]);
        }
      } catch (error) {
        console.error('Error loading admins:', error);
        toast({
          title: 'Erro ao carregar administradores',
          description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAdmins();
  }, [user, toast]);
  
  // Add a new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, informe um email válido',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Check if the user exists first
      const { data: userData, error: userError } = await supabase
        .functions.invoke('create-admin-user', {
          body: { email: newAdminEmail }
        });
        
      if (userError || !userData?.userId) {
        throw new Error(userError?.message || 'Erro ao criar usuário administrador');
      }
      
      // Create the admin relationship
      const { error: relationshipError } = await supabase
        .from('admin_relationships')
        .insert({
          super_admin_id: user!.id,
          admin_id: userData.userId
        });
        
      if (relationshipError) throw relationshipError;
      
      toast({
        title: 'Administrador adicionado',
        description: `${newAdminEmail} foi adicionado como administrador`
      });
      
      // Refresh the admin list
      const newAdmin = {
        id: userData.userId,
        email: newAdminEmail,
        username: 'Novo Administrador',
        created_at: new Date().toISOString()
      };
      
      setAdmins([...admins, newAdmin]);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: 'Erro ao adicionar administrador',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // View admin details
  const handleViewAdmin = async (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsViewAdminOpen(true);
  };
  
  // Confirm admin deletion
  const handleConfirmDelete = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsConfirmDeleteOpen(true);
  };
  
  // Delete an admin
  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    try {
      setIsSubmitting(true);
      
      // Delete the admin relationship
      const { error: relationshipError } = await supabase
        .from('admin_relationships')
        .delete()
        .eq('super_admin_id', user!.id)
        .eq('admin_id', adminToDelete.id);
        
      if (relationshipError) throw relationshipError;
      
      // Remove from local state
      setAdmins(admins.filter(a => a.id !== adminToDelete.id));
      
      toast({
        title: 'Administrador removido',
        description: `${adminToDelete.email} foi removido da sua lista de administradores`
      });
      
      setIsConfirmDeleteOpen(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: 'Erro ao remover administrador',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Administradores</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="admin-email">Email do Novo Administrador</Label>
              <Input 
                id="admin-email" 
                type="email" 
                placeholder="email@exemplo.com" 
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="mt-7"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Administradores Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4 text-muted-foreground">Carregando administradores...</p>
          ) : (
            <div className="space-y-4">
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <div 
                    key={admin.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{admin.username || 'Administrador'}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {admin.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewAdmin(admin)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleConfirmDelete(admin)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhum administrador encontrado
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Admin Dialog */}
      <Dialog open={isViewAdminOpen} onOpenChange={setIsViewAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Administrador</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label>Nome de Usuário</Label>
                  <div className="p-2 rounded bg-muted/50 mt-1">
                    {selectedAdmin.username || 'Não definido'}
                  </div>
                </div>
                
                <div>
                  <Label>Email</Label>
                  <div className="p-2 rounded bg-muted/50 mt-1">
                    {selectedAdmin.email}
                  </div>
                </div>
                
                <div>
                  <Label>ID</Label>
                  <div className="p-2 rounded bg-muted/50 mt-1 text-xs overflow-auto">
                    {selectedAdmin.id}
                  </div>
                </div>
                
                <div>
                  <Label>Data de Criação</Label>
                  <div className="p-2 rounded bg-muted/50 mt-1">
                    {new Date(selectedAdmin.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja remover o administrador{' '}
              <span className="font-semibold">{adminToDelete?.email}</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação não pode ser desfeita. O usuário perderá acesso aos jogos gerenciados por você.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAdmin}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Removendo...' : 'Remover Administrador'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;
