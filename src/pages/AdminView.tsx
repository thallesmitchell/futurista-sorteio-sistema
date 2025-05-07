
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, User, CalendarDays, Mail, Shield } from 'lucide-react';

interface AdminProfile {
  id: string;
  username: string | null;
  email: string | null;
  role: string;
  created_at: string;
  theme_color: string | null;
  logo_url: string | null;
}

export default function AdminView() {
  const { adminId } = useParams<{ adminId: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const { toast } = useToast();
  
  // Redirect if not super admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard');
    }
  }, [isSuperAdmin, navigate]);

  // Load admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        if (!adminId) return;
        
        setIsLoading(true);
        
        // Fetch profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', adminId)
          .single();
          
        if (error) throw error;
        
        // Fetch email from auth.users (if available)
        const { data: userData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', adminId)
          .single();
          
        setAdminProfile({
          ...data,
          email: userData?.username || data.username
        } as AdminProfile);
      } catch (error) {
        console.error('Error loading admin profile:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do administrador.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminProfile();
  }, [adminId, toast]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/super-admin')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Detalhes do Administrador</h1>
          </div>
        </div>
        
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </CardContent>
          </Card>
        ) : adminProfile ? (
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{adminProfile.username || 'Administrador'}</span>
              </CardTitle>
              <CardDescription>
                {adminProfile.role === 'admin' ? 'Administrador' : 'Super Administrador'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ID do Usuário</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded">{adminProfile.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {adminProfile.email || 'Não disponível'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nível de Acesso</p>
                  <p className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {adminProfile.role === 'super_admin' ? 'Super Administrador' : 'Administrador'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {new Date(adminProfile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Administrador não encontrado</CardTitle>
              <CardDescription>
                Não foi possível encontrar os detalhes deste administrador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/super-admin')}>
                Voltar para o painel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
