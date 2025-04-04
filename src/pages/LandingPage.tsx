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

const WhatsAppButton = () => {
  const phoneNumber = "5511914420166"; // Format for WhatsApp API
  const whatsappUrl = `https://wa.me/${phoneNumber}`;
  
  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center animate-pulse-whatsapp"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
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
        
        {mobileMenuOpen && (
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
        )}
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
                  Gestão Eficiente do seu Condomínio
                </h1>
              </FadeInSection>
              
              <FadeInSection delay={200}>
                <p className="text-xl text-white mb-8">
                  Síndicos com autonomia para uma gestão eficiente e transparente, com todas as ferramentas necessárias em um único lugar.
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
      
      <section id="testimonials" className="py-16 bg-gradient-to-b from-white to-[#EFEFEF] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection>
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-6 py-2 rounded-full bg-custom-primary/10 text-custom-dark">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-semibold">Depoimentos</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#103381] to-[#295AC3]">
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
      
      <section id="faq" className="py-16 bg-gradient-to-b from-[#EFEFEF] via-[#295AC3] to-[#2151B9] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-6 py-2 rounded-full bg-white/20 text-white backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span className="font-semibold text-[#295AC3]">Perguntas Frequentes</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#295AC3] mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-xl text-[#295AC3] max-w-3xl mx-auto mb-8">
                Encontre respostas para as dúvidas mais comuns sobre nossos serviços
              </p>
            </div>
          </FadeInSection>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-white/30">
            <FadeInSection delay={100}>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-800 hover:text-brand-700 border-b border-gray-100">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-700 bg-brand-50/30">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeInSection>
          </div>
        </div>
      </section>
      
      <footer className="bg-[#103381] text-custom-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Building className="h-7 w-7 text-white" />
              <h3 className="text-2xl font-bold text-custom-white ml-2">MeuResidencial</h3>
            </div>
            
            <div className="text-white text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end mb-2">
                <MapPin className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                <p className="text-white/90">Av. João Machado, 849, João Pessoa - PB</p>
              </div>
              <p className="text-white/90">Email: contato@meuresidencial.com</p>
              <p className="text-white/70 text-sm mt-4">
                © {new Date().getFullYear()} MeuResidencial. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      <WhatsAppButton />
    </div>
  );
};

export default LandingPage;
