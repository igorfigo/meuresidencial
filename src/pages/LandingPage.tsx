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
  HelpCircle,
  Menu,
  X
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
import { useIsMobile } from '@/hooks/use-mobile';

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
    <FadeInSection delay={delay} className="flex flex-col items-start p-3 bg-custom-accent text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-white/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-x-6 -translate-y-6 opacity-0 group-hover:opacity-50 transition-all duration-500"></div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-white/60 to-white/20 group-hover:w-full transition-all duration-300"></div>
      
      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white/20 text-white mb-2 z-10 group-hover:scale-110 transition-transform duration-300">
        <Icon size={16} className="group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-base font-semibold mb-1 text-white">{title}</h3>
      <p className="text-xs text-white/80 z-10">{description}</p>
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
    <FadeInSection delay={delay} className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${topBorderClass} ${featured ? 'border-2 border-custom-primary transform scale-105 md:transform md:scale-105' : 'border border-gray-200'}`}>
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
                  ? "Até 200 moradores" 
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
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
            max_moradores: 200
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
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
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
          
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/login">
              <Button size="sm" className="bg-custom-primary hover:bg-custom-dark text-custom-white">
                Acessar
              </Button>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-custom-primary"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        <div className="md:hidden bg-white shadow-lg animate-slide-in-top">
          <div className="px-4 py-3 space-y-3">
            <button 
              onClick={() => scrollToSection('features')}
              className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700 hover:text-custom-primary font-medium transition-colors"
            >
              Funcionalidades
            </button>
            <button 
              onClick={() => scrollToSection('plans')}
              className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700 hover:text-custom-primary font-medium transition-colors"
            >
              Planos
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700 hover:text-custom-primary font-medium transition-colors"
            >
              Clientes
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700 hover:text-custom-primary font-medium transition-colors"
            >
              FAQ
            </button>
          </div>
        </div>
      </header>
      
      <section className="relative overflow-hidden pt-24 bg-gradient-to-b from-brand-700 to-brand-800">
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-b from-brand-700 to-brand-800"
          ref={heroRef}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 relative z-10">
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
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full -translate-x-16 -translate-y-16 opacity-30"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full filter blur-3xl opacity-30"></div>
                
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="white" fillOpacity="1" d="M0,32L48,26.7C96,21,192,11,288,10.7C384,11,480,21,576,32C672,43,768,53,864,53.3C960,53,1056,43,1152,37.3C1248,32,1344,32,1392,32L1440,32L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z"></path>
          </svg>
        </div>
      </section>
      
      <section id="features" className="py-16 bg-custom-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Funcionalidades Completas</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tudo o que o síndico precisa para uma gestão transparente e eficiente em um único sistema
              </p>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
            <Feature 
              icon={Wallet}
              title="Gestão Financeira" 
              description="Controle completo de receitas, despesas e prestação de contas."
              delay={100}
            />
            <Feature 
              icon={Users}
              title="Cadastro de Moradores" 
              description="Gerencie facilmente os moradores com informações atualizadas."
              delay={200}
            />
            <Feature 
              icon={MessageSquare}
              title="Comunicados" 
              description="Envie avisos importantes para todos os moradores."
              delay={300}
            />
            <Feature 
              icon={Calendar}
              title="Reserva de Áreas" 
              description="Sistema para agendamento de áreas comuns."
              delay={400}
            />
            <Feature 
              icon={FileText}
              title="Documentos" 
              description="Armazenamento e compartilhamento de documentos."
              delay={500}
            />
            <Feature 
              icon={Shield}
              title="Segurança" 
              description="Controle de acesso para diferentes perfis."
              delay={600}
            />
            <Feature 
              icon={Coins}
              title="Recebimento PIX" 
              description="Recebimento de pagamentos via PIX integrado."
              delay={700}
            />
            <Feature 
              icon={Key}
              title="Controle de Vagas" 
              description="Gerenciamento de vagas de garagem."
              delay={900}
            />
          </div>
        </div>
      </section>
      
      <section id="plans" className="py-16 bg-gradient-to-b from-brand-700 to-brand-800 relative">
        <div className="absolute -top-1 left-0 right-0 transform rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="white" fillOpacity="1" d="M0,32L48,26.7C96,21,192,11,288,10.7C384,11,480,21,576,32C672,43,768,53,864,53.3C960,53,1056,43,1152,37.3C1248,32,1344,32,1392,32L1440,32L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z"></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative z-10">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos que se Adaptam às Suas Necessidades</h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Escolha o plano ideal para o seu condomínio, com preços acessíveis e funcionalidades completas
              </p>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="white" fillOpacity="1" d="M0,32L48,26.7C96,21,192,11,288,10.7C384,11,480,21,576,32C672,43,768,53,864,53.3C960,53,1056,43,1152,37.3C1248,32,1344,32,1392,32L1440,32L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z"></path>
          </svg>
        </div>
      </section>
      
      <section id="testimonials" className="py-16 bg-custom-white relative overflow-hidden">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      
      <section id="faq" className="py-16 bg-custom-light">
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
      
      <section className="py-16 md:py-20 bg-gradient-to-r from-custom-dark to-custom-primary text-custom-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Pronto para transformar a gestão do seu condomínio?</h2>
            <p className="text-lg md:text-xl text-custom-light max-w-3xl mx-auto mb-8">
              Comece hoje mesmo e descubra como é fácil ter o controle total do seu condomínio em suas mãos.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-white text-custom-primary hover:bg-white/90 font-semibold">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </FadeInSection>
        </div>
      </section>
      
      <footer className="bg-gradient-to-r from-[#2151B9] to-[#103381] text-custom-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="mb-8 md:mb-0 col-span-1 lg:col-span-1">
              <div className="flex items-center mb-4">
                <Building className="h-7 w-7 text-white" />
                <h3 className="text-2xl font-bold text-custom-white ml-2">MeuResidencial</h3>
              </div>
              <div className="text-white max-w-md">
                <p className="text-white font-semibold">GESTAO EFICIENTE SOLUCOES TECNOLOGICAS LTDA</p>
                <p className="text-white/80 text-sm mb-2">CNPJ: 60112929000134</p>
                <div className="flex items-start mb-2">
                  <MapPin className="h-5 w-5 text-white mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-white/80">Av. João Machado, 849, João Pessoa - PB</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8 md:mb-0">
              <h4 className="font-bold text-lg mb-4 text-white">Links Rápidos</h4>
              <ul className="space-y-2 text-white/80">
                <li>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className="hover:text-white hover:underline transition-colors"
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('plans')}
                    className="hover:text-white hover:underline transition-colors"
                  >
                    Planos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('testimonials')}
                    className="hover:text-white hover:underline transition-colors"
                  >
                    Clientes
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-white hover:underline transition-colors"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="mb-8 md:mb-0">
              <h4 className="font-bold text-lg mb-4 text-white">Contato</h4>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contato@meuresidencial.com.br" className="hover:text-white transition-colors">contato@meuresidencial.com.br</a>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+553122334455" className="hover:text-white transition-colors">(31) 2233-4455</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Redes Sociais</h4>
              <div className="flex space-x-4">
                <a href="#" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </a>
                <a href="#" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
                <a href="#" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 text-sm mb-4 md:mb-0">&copy; 2025 MeuResidencial. Todos os direitos reservados.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-white/70 hover:text-white text-sm">Termos de Uso</a>
              <a href="#" className="text-white/70 hover:text-white text-sm">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
