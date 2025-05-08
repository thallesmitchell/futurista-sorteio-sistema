import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HexColorPicker } from 'react-colorful';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { primaryColor, setPrimaryColor, siteName, setSiteName } = useTheme();
  const [selectedColor, setSelectedColor] = useState<string>(primaryColor || '#39FF14');
  const [isUploading, setIsUploading] = useState(false);
  const [username, setUsername] = useState('');
  const [defaultGameName, setDefaultGameName] = useState('');
  const [siteNameInput, setSiteNameInput] = useState(siteName || 'SorteioFutura');
  const [logoWidth, setLogoWidth] = useState<string>('200');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const isSuperAdmin = userProfile?.role === 'super_admin';

  useEffect(() => {
    if (userProfile) {
      setSelectedColor(userProfile.theme_color || '#39FF14');
      setUsername(userProfile.username || '');
      setDefaultGameName(userProfile.default_game_name || '');
      setSiteNameInput(userProfile.site_name || siteName || 'SorteioFutura');
      if (userProfile.logo_width) {
        setLogoWidth(userProfile.logo_width.toString());
      }
    }
  }, [userProfile, siteName]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updateData: Record<string, any> = {
        username,
        theme_color: selectedColor,
        default_game_name: defaultGameName
      };
      
      // Apenas super admin pode alterar nome do site
      if (isSuperAdmin) {
        updateData.site_name = siteNameInput;
        updateData.logo_width = logoWidth ? parseInt(logoWidth) : 200;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
      
      // Aplica a cor imediatamente
      setPrimaryColor(selectedColor);
      
      // Atualiza o nome do site se é super admin
      if (isSuperAdmin) {
        setSiteName(siteNameInput);
      }
      
      // Atualizar perfil no contexto
      await refreshUserProfile();
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-logo.${fileExt}`;
    const filePath = `logos/${fileName}`;
    
    setIsUploading(true);
    try {
      // Enviar arquivo para o Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      // Obter URL pública
      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
      
      // Salvar URL no perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          logo_url: data.publicUrl
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Atualizar perfil no contexto
      await refreshUserProfile();
      
      toast({
        title: "Logo atualizado",
        description: "Seu logo foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao enviar logo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar seu logo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Configurações do Perfil</h1>
        
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
            <TabsTrigger value="appearance" className="px-4">Aparência</TabsTrigger>
            <TabsTrigger value="account" className="px-4">Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Personalização de Tema</CardTitle>
                <CardDescription>
                  Personalize a aparência do seu painel administrativo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <Label>Cor Principal</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <HexColorPicker 
                        color={selectedColor} 
                        onChange={handleColorChange} 
                        className="w-full" 
                      />
                      <Input 
                        type="text" 
                        value={selectedColor} 
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="mt-4"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 rounded-lg border" style={{ background: `linear-gradient(135deg, ${selectedColor}22, ${selectedColor}44)` }}>
                        <div 
                          className="h-16 w-full rounded-lg mb-4"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <div className="h-8 w-full rounded-lg mb-4 opacity-80" 
                          style={{ backgroundColor: selectedColor }}
                        />
                        <div className="h-8 w-1/2 rounded-lg" 
                          style={{ backgroundColor: selectedColor }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Visualização da cor selecionada aplicada ao tema.
                      </p>
                    </div>
                  </div>
                </div>
                
                {isSuperAdmin && (
                  <div className="space-y-4 pt-4 border-t">
                    <Label>Nome do Site</Label>
                    <Input
                      value={siteNameInput}
                      onChange={(e) => setSiteNameInput(e.target.value)}
                      placeholder="Nome do site"
                    />
                    <p className="text-sm text-muted-foreground">
                      Este é o nome que aparecerá no cabeçalho do site.
                    </p>
                  </div>
                )}
                
                <div className="space-y-4 pt-4 border-t">
                  <Label>Logo Personalizado</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                      <p className="text-sm text-muted-foreground">
                        Tamanho recomendado: 200x60 pixels
                      </p>
                      
                      {isSuperAdmin && (
                        <div className="pt-2">
                          <Label htmlFor="logo-width">Largura do Logo (px)</Label>
                          <Input
                            id="logo-width"
                            type="number"
                            value={logoWidth}
                            onChange={(e) => setLogoWidth(e.target.value)}
                            min="50"
                            max="300"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            A altura será ajustada proporcionalmente
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="border rounded-lg p-4 flex items-center justify-center bg-background">
                      {userProfile?.logo_url ? (
                        <img 
                          src={userProfile.logo_url} 
                          alt="Logo" 
                          style={{
                            maxWidth: isSuperAdmin && logoWidth ? `${logoWidth}px` : '200px',
                            height: 'auto'
                          }}
                        />
                      ) : (
                        <p className="text-muted-foreground">Nenhum logo enviado</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e preferências.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Para alterar o email, entre em contato com o suporte.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultGameName">Nome Padrão do Jogo</Label>
                  <Input
                    id="defaultGameName"
                    value={defaultGameName}
                    onChange={(e) => setDefaultGameName(e.target.value)}
                    placeholder="Ex: KM80"
                  />
                  <p className="text-sm text-muted-foreground">
                    Este nome será usado como padrão ao criar novos jogos.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Input
                    id="role"
                    value={userProfile?.role === 'super_admin' ? 'Super Administrador' : 'Administrador'}
                    disabled
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Atualizar Informações"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
