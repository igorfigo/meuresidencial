
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Building, Calendar, CheckCircle2, Coins, FileText, Key, Lock, MessageSquare, Shield, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlans } from '@/hooks/use-plans';

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
    <FadeInSection delay={delay} className="flex flex-col items-start p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-100 text-brand-600 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </FadeInSection>
  );
};

const PlanCard = ({ plan, featured = false, delay }) => {
  return (
    <FadeInSection delay={delay} className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${featured ? 'border-2 border-brand-500 transform scale-105' : 'border border-gray-200'}`}>
      <div className={`p-6 ${featured ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white' : 'bg-white text-gray-800'}`}>
        <h3 className="text-xl font-bold mb-2">{plan.nome}</h3>
        <div className="text-3xl font-bold mb-4">{plan.valor}</div>
        <p className="mb-4 text-sm">{plan.descricao || 'Ideal para condomínios de pequeno porte.'}</p>
      </div>
      <div className="bg-white p-6">
        <ul className="space-y-3">
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Até {plan.max_moradores || '50'} moradores</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Gestão financeira completa</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Comunicados e avisos</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Reserva de áreas comuns</span>
          </li>
          {featured && (
            <>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Controle de dedetizações</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Gestão de documentos</span>
              </li>
            </>
          )}
        </ul>
        <Link to="/login" className="w-full">
          <Button className={`w-full mt-6 ${featured ? 'bg-brand-600 hover:bg-brand-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
            Escolher Plano
          </Button>
        </Link>
      </div>
    </FadeInSection>
  );
};

const LandingPage = () => {
  const { plans, isLoading } = usePlans();
  const [activePlans, setActivePlans] = useState([]);
  const heroRef = useRef(null);
  
  // Create sample plans if API doesn't return any
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
            descricao: "Ideal para condomínios de pequeno porte.",
            valor: "R$ 99,90",
            max_moradores: 50
          },
          {
            id: "2",
            codigo: "PADRAO",
            nome: "Plano Padrão",
            descricao: "Para condomínios de médio porte com mais recursos.",
            valor: "R$ 199,90",
            max_moradores: 150
          },
          {
            id: "3",
            codigo: "PREMIUM",
            nome: "Plano Premium",
            descricao: "Solução completa para condomínios de grande porte.",
            valor: "R$ 299,90",
            max_moradores: 300
          }
        ]);
      }
    }
  }, [isLoading, plans]);
  
  // Parallax effect for hero section
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

  return (
    <div className="w-full overflow-x-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-r from-brand-800/30 to-brand-600/30"
          ref={heroRef}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <FadeInSection delay={0}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Gestão de condomínios <span className="text-brand-600">simplificada</span>
                </h1>
              </FadeInSection>
              
              <FadeInSection delay={200}>
                <p className="text-xl text-gray-700 mb-8">
                  Ofereça aos síndicos total autonomia para uma gestão eficiente e transparente, com todas as ferramentas necessárias em um único lugar.
                </p>
              </FadeInSection>
              
              <FadeInSection delay={400}>
                <Link to="/login">
                  <Button size="lg" className="group bg-brand-600 hover:bg-brand-700 text-white">
                    Acessar Meu Residencial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </FadeInSection>
            </div>
            
            <div className="lg:w-1/2 relative">
              <FadeInSection delay={600} className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-200 rounded-full filter blur-3xl opacity-40 animate-pulse" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-200 rounded-full filter blur-3xl opacity-40 animate-pulse" />
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
      
      {/* Features Section */}
      <section className="py-20 bg-white">
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
      
      {/* Plans Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Planos que se Adaptam às Suas Necessidades</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O Que Nossos Clientes Dizem</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Síndicos que transformaram a gestão de seus condomínios com nossa plataforma
              </p>
            </div>
          </FadeInSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FadeInSection delay={100} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "O MeuResidencial transformou completamente a gestão do nosso condomínio. Antes era tudo manual e agora temos controle total com muito mais transparência."
              </p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-bold">RP</span>
                </div>
                <div>
                  <h4 className="font-bold">Ricardo Pereira</h4>
                  <p className="text-sm text-gray-500">Síndico - Edifício Aurora</p>
                </div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={200} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "A facilidade de comunicação com os moradores e o controle financeiro são extraordinários. Economizamos tempo e dinheiro com essa plataforma."
              </p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-bold">MS</span>
                </div>
                <div>
                  <h4 className="font-bold">Mariana Silva</h4>
                  <p className="text-sm text-gray-500">Síndica - Condomínio Parque Verde</p>
                </div>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={300} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Os moradores adoraram a transparência que o sistema proporciona. As reservas de áreas comuns funcionam perfeitamente e sem conflitos."
              </p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-bold">CA</span>
                </div>
                <div>
                  <h4 className="font-bold">Carlos Almeida</h4>
                  <p className="text-sm text-gray-500">Síndico - Residencial Montanha</p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <FadeInSection className="mb-8 lg:mb-0 lg:w-2/3">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para transformar a gestão do seu condomínio?</h2>
              <p className="text-xl text-blue-100">
                Comece hoje mesmo e descubra como é fácil ter o controle total do seu condomínio em suas mãos.
              </p>
            </FadeInSection>
            
            <FadeInSection delay={200}>
              <Link to="/login">
                <Button size="lg" className="bg-white text-brand-600 hover:bg-blue-50 group">
                  Acessar Meu Residencial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </FadeInSection>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center mb-4">
                <Building className="h-7 w-7 text-brand-400" />
                <h3 className="text-2xl font-bold text-white ml-2">MeuResidencial</h3>
              </div>
              <p className="text-gray-400 max-w-md">
                A solução completa para a gestão eficiente do seu condomínio, proporcionando transparência e facilidade para síndicos e moradores.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Plataforma</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Funcionalidades</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Planos</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Depoimentos</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre nós</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidade</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} MeuResidencial. Todos os direitos reservados.
            </p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
