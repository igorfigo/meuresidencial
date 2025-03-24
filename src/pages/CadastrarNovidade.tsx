
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileEdit } from 'lucide-react';
import { useNews } from '@/hooks/use-news';
import AdminOnly from '@/components/AdminOnly';
import { useEffect } from 'react';

const CadastrarNovidade = () => {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullContent, setFullContent] = useState('');
  const { saveNewsItem, fetchNews, news, isLoading } = useNews();

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !shortDescription || !fullContent) {
      return;
    }

    const result = await saveNewsItem({
      title,
      short_description: shortDescription,
      full_content: fullContent,
      is_active: true
    });

    if (result) {
      setTitle('');
      setShortDescription('');
      setFullContent('');
      fetchNews();
    }
  };

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Cadastrar Novidade</h1>
            <p className="text-muted-foreground">
              Cadastre novidades que serão exibidas no dashboard para todos os gestores.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5" />
                  Nova Novidade
                </CardTitle>
                <CardDescription>
                  Preencha os campos para cadastrar uma nova novidade
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      placeholder="Título da novidade"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Descrição Breve</Label>
                    <Input
                      id="shortDescription"
                      placeholder="Breve descrição da novidade"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullContent">Conteúdo Completo</Label>
                    <Textarea
                      id="fullContent"
                      placeholder="Conteúdo completo da novidade"
                      value={fullContent}
                      onChange={(e) => setFullContent(e.target.value)}
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Salvar Novidade"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Novidades Recentes</CardTitle>
                <CardDescription>
                  Lista das últimas novidades cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <p>Carregando novidades...</p>
                  ) : news.length > 0 ? (
                    news.map((item) => (
                      <div key={item.id} className="border rounded-md p-4 space-y-2">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.short_description}</p>
                        <div className="flex justify-end">
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nenhuma novidade cadastrada ainda.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AdminOnly>
  );
};

export default CadastrarNovidade;
