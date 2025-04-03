import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { 
  ArrowRight, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Coins, 
  FileText, 
  Key, 
  Lock, 
  MapPin,
  MessageSquare, 
  Quote, 
  Shield, 
  Star, 
  Users, 
  Wallet,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlans } from '@/hooks/use-plans';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FadeInSection = ({ children, delay = 0, className = '' }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Feature = ({ icon, title, description, delay }) => {
  const Icon = icon;
  
  return (
    <FadeInSection delay={delay} className="flex flex-col items-start p-6 bg-custom-accent text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-white/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-50 transition-all duration-500"></div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-white/60 to-white/20 group-hover:w-full transition-all duration-300"></div>
      
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 text-white mb-4 z-10 group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} className="group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-white/80 z-10">{description}</p>
    </FadeInSection>
  );
};

const PlanCard = ({ plan, featured = false, delay }) => {
  const commonFeatures = [
    "Gestão financeira completa",
    "Comunicados e avisos",
    "Reserva de áreas comuns",
    "Controle de dedetizações",
    "Gestão de documentos",
    "Recebimento via PIX",
    "Controle de vagas",
    "Suporte técnico"
  ];

  const topBorderClass = plan.codigo === "BASICO" || plan.codigo === "PREMIUM" 
    ? "border-t-4 border-t-custom-secondary" 
    : featured ? "border-t-4 border-t-custom-primary" : "";

  return (
    <FadeInSection delay={delay} className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${topBorderClass} ${featured ? 'border-2 border-custom-primary transform scale-105' : 'border border-gray-200'}`}>
      <div className={`p-6 ${featured ? 'bg-gradient-to-r from-custom-dark to-custom-primary text-custom-white' : 'bg-custom-white text-gray-800'}`}>
        <h3 className="text-xl font-bold mb-2">{plan.nome}</h3>
        <div className="text-3xl font-bold mb-4">{plan.valor}</div>
      </div>
      <div className="bg-custom-white p-6">
        <ul className="space-y-3">
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <div className="flex">
              <span className="font-bold px-3 py-1 bg-custom-primary/10 text-custom-dark rounded-full">
                {plan.codigo === "PREMIUM" 
                  ? "Até 50 moradores" 
                  : plan.codigo === "PADRAO" 
                    ? "Até 50 moradores"
                    : `Até ${plan.max_moradores || '30'} moradores`}
              </span>
            </div>
          </li>
          
          {commonFeatures.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link to="/login" className="w-full">
          <Button className={`w-full mt-6 ${featured ? 'bg-custom-primary hover:bg-custom-dark' : 'bg-custom-light text-custom-dark hover:bg-custom-light/80'}`}>
            Escolher Plano
          </Button>
        </Link>
      </div>
    </FadeInSection>
  );
};

const TestimonialCard = ({ author, role, company, content, stars = 5, delay = 0 }) => {
  return (
    <FadeInSection delay={delay}>
      <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-t-4 border-t-custom-primary overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-custom-primary/10 rounded-full -translate-x-16 -translate-y-16 opacity-30"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-custom-secondary/10 rounded-full opacity-30"></div>
            
            <div className="relative p-6">
              <div className="mb-4 flex text-yellow-400">
                {[...Array(stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              
              <div className="relative">
                <Quote className="absolute -left-2 -top-2 text-custom-primary/30 w-8 h-8 opacity-40" />
                <p className="text-gray-600 mb-6 pl-5 relative z-10">
                  "{content}"
                </p>
              </div>
              
              <div className="flex items-center mt-2">
                <div className="mr-4 h-12 w-12 rounded-full bg-custom-primary/10 flex items-center justify-center">
                  <span className="text-custom-primary font-bold">{author.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{author}</h4>
                  <p className="text-sm text-custom-primary">{role} - {company}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeInSection>
  );
};

const LandingPage = () => {
  const { plans, isLoading } = usePlans();
  const [activePlans, setActivePlans] = useState([]);
  const heroRef = useRef(null);
  
  useEffect(() => {
    if (!isLoading) {
      if (plans.length > 0) {
        setActivePlans(plans);
      } else {
        setActivePlans([
          {
            id: "1",
            codigo: "BASICO",
            nome: "Plano Básico",
            valor: "R$ 99,90",
            max_moradores: 30
          },
          {
            id: "2",
            codigo: "PADRAO",
            nome: "Plano Padrão",
            valor: "R$ 199,90",
            max_moradores: 50
          },
          {
            id: "3",
            codigo: "PREMIUM",
            nome: "Plano Premium",
            valor: "R$ 299,90",
            max_moradores: 50
          }
        ]);
      }
    }
  }, [isLoading, plans]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollPosition * 0.4}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const faqItems = [
    {
      question: "Como funciona o plano de gestão de condomínios?",
      answer: "Nosso plano de gestão oferece uma plataforma completa para síndicos e moradores, com ferramentas para controle financeiro, comunicação, reserva de áreas comuns, gestão de documentos e muito mais, tudo em um único lugar."
    },
    {
      question: "Quanto custa o serviço?",
      answer: "Oferecemos diferentes planos com preços que variam de acordo com o tamanho do condomínio e recursos desejados. Consulte a seção de planos para mais detalhes sobre os valores."
    },
    {
      question: "É necessário instalar algum aplicativo?",
      answer: "Não é necessário instalar nenhum aplicativo. Nossa plataforma é totalmente baseada na web e pode ser acessada através de qualquer navegador de internet, seja em computadores, tablets ou smartphones."
    },
    {
      question: "Como é feito o suporte técnico?",
      answer: "Oferecemos suporte técnico por e-mail, chat e telefone em horário comercial para todos os clientes."
    },
    {
      question: "É possível migrar dados de outro sistema?",
      answer: "Sim, oferecemos serviço de migração de dados para facilitar a transição de outros sistemas para o MeuResidencial, mantendo todo o histórico do seu condomínio."
    }
  ];

  return (
    <div className="w-full overflow-x-hidden bg-gradient-to-b from-custom-light to-custom-white">
      <header className="fixed top-0 left-0 right-0 bg-custom-white/90 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Building className="h-7 w-7 text-custom-primary" />
            <span className="text-xl font-bold ml-2">MeuResidencial</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6 mr-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-custom-primary font-medium transition-colors"
              >
                Funcionalidades
              </button>
              <button 
                onClick={() => scrollToSection('plans')}
                className="text-gray-700 hover:text-custom-primary font-medium transition-colors"
              >
                Planos
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-custom-primary font-medium transition-colors"
              >
                Clientes
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-gray-700 hover:text-custom-primary font-medium transition-colors"
              >
                FAQ
              </button>
            </nav>
            
            <Link to="/login">
              <Button size="sm" className="group bg-custom-primary hover:bg-custom-dark text-custom-white">
                Acessar Meu Residencial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Link to="/login">
              <Button size="sm" className="bg-custom-primary hover:bg-custom-dark text-custom-white">
                Acessar
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <section className="relative overflow-hidden pt-24 bg-gradient-to-b from-brand-700 to-brand-800">
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-b from-brand-700 to-brand-800"
          ref={heroRef}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <FadeInSection delay={0}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-custom-white leading-tight mb-6">
                  Gestão de condomínios <span className="text-white">simplificada</span>
                </h1>
              </FadeInSection>
              
              <FadeInSection delay={200}>
                <p className="text-xl text-white mb-8">
                  Ofereça aos síndicos total autonomia para uma gestão eficiente e transparente, com todas as ferramentas necessárias em um único lugar.
                </p>
              </FadeInSection>
            </div>
            
            <div className="lg:w-1/2 relative">
              <FadeInSection delay={600} className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full filter blur-3xl opacity-40 animate-pulse" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full filter blur-3xl opacity-40 animate-pulse" />
                <img 
                  src="/placeholder.svg"
                  alt="Gestão de condomínios" 
                  className="relative z-10 rounded-xl shadow-2xl w-full max-w-lg mx-auto"
                />
              </FadeInSection>
            </div>
          </div>
        </div>
        
        <div className="absolute -bottom-1 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="white" fillOpacity="1" d="M0,96L48,106.7C96,117,192,139,288,128C384,117,480,75,576,80C672,85,768,139,864,138.7C960,139,1056,85,1152,64C1248,43,1344,53,1392,58.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      <section id="features" className="py-20 bg-custom-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Funcionalidades Completas</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tudo o que o síndico precisa para uma gestão transparente e eficiente em um único sistema
              </p>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature 
              icon={Wallet}
              title="Gestão Financeira" 
              description="Controle completo de receitas, despesas e prestação de contas com relatórios detalhados."
              delay={100}
            />
            <Feature 
              icon={Users}
              title="Cadastro de Moradores" 
              description="Gerencie facilmente os moradores do condomínio com informações completas e atualizadas."
              delay={200}
            />
            <Feature 
              icon={MessageSquare}
              title="Comunicados" 
              description="Envie avisos e comunicados importantes para todos os moradores com facilidade."
              delay={300}
            />
            <Feature 
              icon={Calendar}
              title="Reserva de Áreas" 
              description="Sistema para agendamento e reserva de áreas comuns do condomínio."
              delay={400}
            />
            <Feature 
              icon={FileText}
              title="Documentos" 
              description="Armazenamento e compartilhamento de documentos importantes do condomínio."
              delay={500}
            />
            <Feature 
              icon={Shield}
              title="Segurança" 
              description="Controle de acesso e permissões para diferentes perfis de usuários."
              delay={600}
            />
            <Feature 
              icon={Coins}
              title="Recebimento PIX" 
              description="Facilidade para recebimento de pagamentos via PIX integrado ao sistema."
              delay={700}
            />
            <Feature 
              icon={Building}
              title="Gestão Empresarial" 
              description="Ferramentas para gestão completa da administração do condomínio."
              delay={800}
            />
            <Feature 
              icon={Key}
              title="Controle de Vagas" 
              description="Gerenciamento de vagas de garagem e espaços privativos."
              delay={900}
            />
          </div>
        </div>
      </section>
      
      <section id="plans" className="py-20 bg-gradient-to-b from-brand-700 to-brand-800 relative">
        <div className="absolute -top-1 left-0 right-0 transform rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="white" fillOpacity="1" d="M0,96L48,106.7C96,117,192,139,288,128C384,117,480,75,576,80C672,85,768,139,864,138.7C960,139,1056,85,1152,64C1248,43,1344,53,1392,58.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos que se Adaptam às Suas Necessidades</h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Escolha o plano ideal para o seu condomínio, com preços acessíveis e funcionalidades completas
              </p>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activePlans.map((plan, index) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                featured={index === 1} 
                delay={index * 200}
              />
            ))}
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="white" fillOpacity="1" d="M0,96L48,106.7C96,117,192,139,288,128C384,117,480,75,576,80C672,85,768,139,864,138.7C960,139,1056,85,1152,64C1248,43,1344,53,1392,58.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      <section id="testimonials" className="py-20 bg-custom-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-custom-light to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-custom-primary/10 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-custom-secondary/10 rounded-full filter blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-6 py-2 rounded-full bg-custom-primary/10 text-custom-dark">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-semibold">Depoimentos</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-custom-primary to-custom-dark">
                O Que Nossos Clientes Dizem
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Síndicos que transformaram a gestão do nosso condomínio com nossa plataforma
              </p>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              author="Ricardo Pereira"
              role="Síndico"
              company="Edifício Aurora"
              content="O MeuResidencial transformou completamente a gestão do nosso condomínio. Antes era tudo manual e agora temos controle total com muito mais transparência."
              delay={100}
            />
            
            <TestimonialCard 
              author="Mariana Silva"
              role="Síndica"
              company="Condomínio Parque Verde"
              content="A facilidade de comunicação com os moradores e o controle financeiro são extraordinários. Economizamos tempo e dinheiro com essa plataforma."
              delay={200}
            />
            
            <TestimonialCard 
              author="Carlos Almeida"
              role="Síndico"
              company="Residencial Montanha"
              content="Os moradores adoraram a transparência que o sistema proporciona. As reservas de áreas comuns funcionam perfeitamente e sem conflitos."
              delay={300}
            />
          </div>
        </div>
      </section>
      
      <section id="faq" className="py-20 bg-custom-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-6 py-2 rounded-full bg-custom-primary/10 text-custom-dark">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span className="font-semibold">Perguntas Frequentes</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Encontre respostas para as dúvidas mais comuns sobre nossos serviços
              </p>
            </div>
          </FadeInSection>
          
          <div className="bg-custom-white rounded-xl shadow-md overflow-hidden">
            <FadeInSection delay={100}>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:text-custom-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeInSection>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gradient-to-r from-custom-dark to-custom-primary text-custom-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para transformar a gestão do seu condomínio?</h2>
            <p className="text-xl text-custom-light max-w-3xl mx-auto">
              Comece hoje mesmo e descubra como é fácil ter o controle total do seu condomínio em suas mãos.
            </p>
          </FadeInSection>
        </div>
      </section>
      
      <footer className="bg-custom-black text-custom-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center mb-4">
                <Building className="h-7 w-7 text-custom-primary" />
                <h3 className="text-2xl font-bold text-custom-white ml-2">MeuResidencial</h3>
              </div>
              <div className="text-gray-400 max-w-md">
                <p className="text-custom-light font-semibold">GESTAO EFICIENTE SOLUCOES TECNOLOGICAS LTDA</p>
                <p className="text-gray-400 text-sm mb-2">CNPJ: 60112929000134</p>
                <div className="flex items-start mb-2">
                  <MapPin className="h-5 w-5 text-custom-primary mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm">
                    Av. João Machado, 849, João Pessoa/PB, CEP: 58.013-520
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Plataforma</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-custom-white transition-colors">Funcionalidades</button></li>
                  <li><button onClick={() => scrollToSection('plans')} className="text-gray-400 hover:text-custom-white transition-colors">Planos</button></li>
                  <li><button onClick={() => scrollToSection('testimonials')} className="text-gray-400 hover:text-custom-white transition-colors">Depoimentos</button></li>
                  <li><button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-custom-white transition-colors">FAQ</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-custom-white transition-colors">Sobre nós</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-custom-white transition-colors">Contato</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-custom-white transition-colors">Blog</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-custom-white transition-colors">Termos de Uso</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-custom-white transition-colors">Privacidade</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} MeuResidencial. Todos os direitos reservados.
              </p>
              
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-custom-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                
                <a href="#" className="text-gray-400 hover:text-custom-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.045-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.08c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
