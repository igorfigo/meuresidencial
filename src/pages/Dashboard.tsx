
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, FileText, Calendar, Bell, DollarSign, Activity, TrendingUp, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

const Dashboard = () => {
  const { user } = useApp();
  const firstName = user?.nome?.split(' ')[0] || 'Usuário';

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 pb-6 animate-fade-in">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-2">
              <span className="mr-2">👋</span>
              <span>Bem-vindo de volta</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Olá, {firstName}</h1>
            <p className="text-muted-foreground">Aqui está um resumo do seu condomínio hoje.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-brand-600 hover:bg-brand-700 shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Unidades</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">
                38 ocupadas, 4 vagas
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Moradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">
                12 novos nos últimos 30 dias
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 32.450</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 font-medium">↑ 8.2%</span> comparado ao mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Inadimplência</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 font-medium">↓ 1.1%</span> comparado ao mês anterior
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-4 card-hover">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Ações e eventos recentes no condomínio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    icon: <Users className="h-4 w-4 text-blue-600" />, 
                    title: "Novo morador cadastrado", 
                    description: "Apartamento 302", 
                    time: "Hoje, 14:45" 
                  },
                  { 
                    icon: <Calendar className="h-4 w-4 text-green-600" />, 
                    title: "Reserva de salão de festas", 
                    description: "Sábado, 15/07", 
                    time: "Hoje, 10:23" 
                  },
                  { 
                    icon: <Bell className="h-4 w-4 text-orange-600" />, 
                    title: "Notificação enviada", 
                    description: "Manutenção no elevador", 
                    time: "Ontem, 16:50" 
                  },
                  { 
                    icon: <DollarSign className="h-4 w-4 text-green-600" />, 
                    title: "Pagamento recebido", 
                    description: "Taxa condominial - Apt 105", 
                    time: "Ontem, 09:12" 
                  },
                  { 
                    icon: <Building className="h-4 w-4 text-purple-600" />, 
                    title: "Atualização de cadastro", 
                    description: "Dados do condomínio", 
                    time: "15/06, 11:30" 
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <div className="rounded-full p-2 bg-gray-100 mr-3">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3 card-hover">
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>
                Agendamentos e manutenções programadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    date: "20 JUN", 
                    title: "Assembleia Geral", 
                    time: "19:00", 
                    location: "Salão de Festas" 
                  },
                  { 
                    date: "25 JUN", 
                    title: "Manutenção na Piscina", 
                    time: "08:00", 
                    location: "Área de Lazer" 
                  },
                  { 
                    date: "30 JUN", 
                    title: "Vencimento Taxa Condominial", 
                    time: "Todo o dia", 
                    location: "" 
                  },
                  { 
                    date: "05 JUL", 
                    title: "Dedetização", 
                    time: "09:00", 
                    location: "Todo o condomínio" 
                  }
                ].map((event, i) => (
                  <div key={i} className="flex items-start">
                    <div className="mr-4 text-center">
                      <p className="font-bold text-brand-600">{event.date}</p>
                      <p className="text-xs">{event.time}</p>
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Calendário Completo
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Resumo Financeiro
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Receitas</span>
                  <span className="font-medium">R$ 32.450,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Despesas</span>
                  <span className="font-medium">R$ 28.120,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fundo Reserva</span>
                  <span className="font-medium">R$ 45.650,00</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Saldo</span>
                    <span className="text-green-600">R$ 4.330,00</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                <FileText className="h-4 w-4 mr-2" />
                Ver Relatório Completo
              </Button>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Notificações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    title: "Lembrete de Vencimento", 
                    description: "O vencimento da taxa condominial é em 5 dias.",
                    priority: "Média"
                  },
                  { 
                    title: "Manutenção Programada", 
                    description: "Elevador 2 ficará indisponível amanhã das 9h às 12h.",
                    priority: "Alta"
                  },
                  { 
                    title: "Documentos Pendentes", 
                    description: "Há 3 documentos pendentes para aprovação.",
                    priority: "Baixa"
                  }
                ].map((notification, i) => (
                  <div key={i} className="pb-3 last:pb-0 border-b last:border-b-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          notification.priority === "Alta" 
                            ? "bg-red-100 text-red-800" 
                            : notification.priority === "Média"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                <Bell className="h-4 w-4 mr-2" />
                Ver Todas Notificações
              </Button>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Users className="h-5 w-5" />, label: "Moradores" },
                  { icon: <Building className="h-5 w-5" />, label: "Cadastro Gestor" },
                  { icon: <DollarSign className="h-5 w-5" />, label: "Financeiro" },
                  { icon: <Calendar className="h-5 w-5" />, label: "Reservas" },
                  { icon: <Bell className="h-5 w-5" />, label: "Comunicados" },
                  { icon: <FileText className="h-5 w-5" />, label: "Relatórios" }
                ].map((item, i) => (
                  <Button 
                    key={i}
                    variant="outline" 
                    className="flex flex-col h-auto py-4 items-center justify-center"
                  >
                    <div className="rounded-full bg-gray-100 p-2 mb-2">
                      {item.icon}
                    </div>
                    <span className="text-xs">{item.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
