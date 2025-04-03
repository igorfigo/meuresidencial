
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, CheckCircle, Building, Users, CreditCard, Calendar, Shield, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Hero section
const Hero = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="w-full flex flex-col md:flex-row py-6 sm:py-16 px-6 sm:px-16">
      <div className={`flex-1 flex flex-col justify-center items-start ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
        <div className="flex flex-row items-center py-[6px] px-4 bg-blue-100 rounded-[10px] mb-2">
          <p className="text-brand-600 font-medium text-[18px] leading-[23px] mr-2">
            <span className="text-brand-800">Nova</span> Geração de Gestão
          </p>
        </div>
        
        <div className="w-full">
          <h1 className="font-display font-semibold text-[52px] text-gray-800 leading-[75px] sm:leading-[100px]">
            A Plataforma <br className="sm:block hidden" /> de 
            <span className="text-brand-600"> Gestão</span> Completa
          </h1>
          
          <p className="font-normal text-gray-600 text-[18px] leading-[30.8px] max-w-[470px] mt-5">
            Uma ferramenta completa para síndicos profissionais administrarem 
            condomínios de forma eficiente e moderna, com todas as funcionalidades necessárias
            para uma gestão transparente.
          </p>
        </div>
        
        <Button 
          className="mt-10 py-6 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-[10px] outline-none text-lg"
          asChild
        >
          <Link to="/login">
            Acessar Meu Residencial <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
      
      <div className={`flex-1 flex justify-center items-center md:ml-10 mt-10 md:mt-0 relative ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
        <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
        <div className="absolute z-[1] w-[80%] h-[80%] rounded-full white__gradient bottom-40" />
        <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
        
        <div className="w-full h-full relative z-[5] rounded-[20px] overflow-hidden">
          <img src="/placeholder.svg" alt="Gestão de condomínios" className="w-full h-full object-contain relative z-[5]" />
        </div>
      </div>
    </section>
  );
};

// Stats section
const Stats = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const stats = [
    { value: '300+', title: 'Condomínios' },
    { value: '15k+', title: 'Usuários Ativos' },
    { value: 'R$50M+', title: 'Transações' },
  ];

  return (
    <section ref={ref} className={`w-full flex justify-center items-center flex-row flex-wrap sm:mb-20 mb-6 ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
      {stats.map((stat, index) => (
        <div key={index} className="flex-1 flex justify-start items-center flex-row m-3">
          <h4 className="font-display font-semibold text-[30px] sm:text-[40px] leading-[43px] sm:leading-[53px] text-brand-600">
            {stat.value}
          </h4>
          <p className="font-normal text-gray-600 text-[15px] sm:text-[20px] leading-[21px] sm:leading-[26px] ml-3">
            {stat.title}
          </p>
        </div>
      ))}
    </section>
  );
};

// Business feature card
const FeatureCard = ({ icon: Icon, title, content, index, inView }) => (
  <div className={`flex flex-row p-6 rounded-[20px] ${index !== 2 ? "mb-6" : "mb-0"} feature-card ${inView ? 'animate-fade-in' : 'opacity-0'}`}
       style={{ transitionDelay: `${index * 200}ms` }}>
    <div className="w-[64px] h-[64px] rounded-full flex justify-center items-center bg-blue-100">
      <Icon className="w-[50%] h-[50%] text-brand-600" />
    </div>
    <div className="flex-1 flex flex-col ml-3">
      <h4 className="font-display font-semibold text-gray-800 text-[18px] leading-[23px] mb-1">{title}</h4>
      <p className="font-normal text-gray-600 text-[16px] leading-[24px]">{content}</p>
    </div>
  </div>
);

// Business section
const Business = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const features = [
    {
      id: "feature-1",
      icon: Building,
      title: "Gestão Completa",
      content: "Controle todas as operações do condomínio em uma única plataforma, desde financeiro até comunicados.",
    },
    {
      id: "feature-2",
      icon: Users,
      title: "Comunicação com Moradores",
      content: "Mantenha todos os moradores informados com avisos, comunicados e atualizações importantes.",
    },
    {
      id: "feature-3",
      icon: CreditCard,
      title: "Controle Financeiro",
      content: "Gerencie receitas e despesas com transparência, emita relatórios e mantenha as contas organizadas.",
    },
    {
      id: "feature-4",
      icon: Calendar,
      title: "Agendamento de Áreas",
      content: "Sistema inteligente para reserva de áreas comuns, evitando conflitos e facilitando o uso.",
    },
  ];

  return (
    <section id="features" ref={ref} className="w-full flex flex-col md:flex-row py-16 px-6 sm:px-16">
      <div className="flex-1 flex flex-col justify-center items-start">
        <h2 className={`font-display font-semibold text-[40px] text-gray-800 leading-[66px] ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
          Você cuida do seu condomínio, <br className="sm:block hidden" /> 
          nós cuidamos da gestão.
        </h2>
        <p className={`font-normal text-gray-600 text-[18px] leading-[30.8px] max-w-[470px] mt-5 ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
          O MeuResidencial foi desenvolvido para simplificar a administração de condomínios, 
          automatizando processos e garantindo transparência para síndicos e moradores.
        </p>
        
        <Button 
          className={`mt-10 py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-[10px] outline-none ${inView ? 'animate-fade-in' : 'opacity-0'}`} 
          style={{ transitionDelay: '400ms' }}
          asChild
        >
          <Link to="/login">
            Comece Agora
          </Link>
        </Button>
      </div>

      <div className="flex-1 flex justify-center items-center flex-col ml-0 md:ml-10 mt-10 md:mt-0 relative">
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} {...feature} index={index} inView={inView} />
        ))}
      </div>
    </section>
  );
};

// Billing section
const Billing = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section id="product" ref={ref} className="w-full flex md:flex-row flex-col-reverse py-16 px-6 sm:px-16">
      <div className={`flex-1 flex justify-center items-center md:mr-10 mr-0 ml-0 md:mt-0 mt-10 relative ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
        <div className="absolute z-[1] w-[80%] h-[80%] rounded-full white__gradient bottom-40" />
        <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
        
        <div className="w-full h-[100%] relative z-[5]">
          <img src="/placeholder.svg" alt="Financeiro" className="w-full h-full object-contain" />
        </div>
      </div>
      
      <div className={`flex-1 flex flex-col justify-center items-start ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}>
        <h2 className="font-display font-semibold text-[40px] text-gray-800 leading-[66px]">
          Controle financeiro <br className="sm:block hidden" /> 
          simplificado e completo
        </h2>
        <p className="font-normal text-gray-600 text-[18px] leading-[30.8px] max-w-[470px] mt-5">
          Gerencie as finanças do condomínio com facilidade. Registre receitas e despesas, 
          gere relatórios detalhados, e garanta total transparência para os moradores.
        </p>
        
        <div className="flex flex-row flex-wrap mt-6">
          <div className="flex flex-row items-center mr-5 mb-4">
            <CheckCircle className="w-6 h-6 text-brand-600" />
            <p className="font-normal text-gray-600 text-[16px] leading-[24px] ml-2">
              Controle de receitas e despesas
            </p>
          </div>
          
          <div className="flex flex-row items-center mr-5 mb-4">
            <CheckCircle className="w-6 h-6 text-brand-600" />
            <p className="font-normal text-gray-600 text-[16px] leading-[24px] ml-2">
              Prestação de contas transparente
            </p>
          </div>
          
          <div className="flex flex-row items-center mr-5 mb-4">
            <CheckCircle className="w-6 h-6 text-brand-600" />
            <p className="font-normal text-gray-600 text-[16px] leading-[24px] ml-2">
              Recebimento por PIX
            </p>
          </div>
          
          <div className="flex flex-row items-center mb-4">
            <CheckCircle className="w-6 h-6 text-brand-600" />
            <p className="font-normal text-gray-600 text-[16px] leading-[24px] ml-2">
              Histórico financeiro completo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Card Deal section
const CardDeal = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="w-full flex flex-col md:flex-row py-16 px-6 sm:px-16">
      <div className={`flex-1 flex flex-col justify-center items-start ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
        <h2 className="font-display font-semibold text-[40px] text-gray-800 leading-[66px]">
          Comunicação eficiente <br className="sm:block hidden" /> 
          com seus moradores
        </h2>
        <p className="font-normal text-gray-600 text-[18px] leading-[30.8px] max-w-[470px] mt-5">
          Mantenha todos os moradores informados através de comunicados, 
          envio de documentos e alertas importantes. Reduza conflitos com uma 
          comunicação clara e eficiente.
        </p>
        
        <Button 
          className={`mt-10 py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-[10px] outline-none ${inView ? 'animate-fade-in' : 'opacity-0'}`} 
          style={{ transitionDelay: '300ms' }}
          asChild
        >
          <Link to="/login">
            Conheça mais
          </Link>
        </Button>
      </div>
      
      <div className={`flex-1 flex justify-center items-center md:ml-10 ml-0 md:mt-0 mt-10 relative ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
        <div className="w-full h-full relative z-[5]">
          <img src="/placeholder.svg" alt="Comunicação" className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  );
};

// Testimonials card
const FeedbackCard = ({ content, name, title, img, index, inView }) => (
  <div className={`flex justify-between flex-col px-10 py-12 rounded-[20px] max-w-[370px] md:mr-10 sm:mr-5 mr-0 my-5 feedback-card ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${index * 200}ms` }}>
    <div className="text-white text-[28px]">"</div>
    <p className="font-normal text-[18px] leading-[32px] text-gray-600 my-10">
      {content}
    </p>
    
    <div className="flex flex-row">
      <div className="w-[48px] h-[48px] rounded-full">
        <img src={img} alt={name} className="w-full h-full rounded-full object-cover" />
      </div>
      <div className="flex flex-col ml-4">
        <h4 className="font-display font-semibold text-[20px] leading-[32px] text-gray-800">{name}</h4>
        <p className="font-normal text-[16px] leading-[24px] text-gray-600">{title}</p>
      </div>
    </div>
  </div>
);

// Testimonial section
const Testimonials = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const feedback = [
    {
      id: "feedback-1",
      content: "O MeuResidencial transformou a forma como eu gerencio o condomínio. Reduziu meu trabalho administrativo em 50%.",
      name: "Roberto Almeida",
      title: "Síndico Profissional",
      img: "/placeholder.svg",
    },
    {
      id: "feedback-2",
      content: "A transparência financeira que o sistema proporciona melhorou muito a relação com os moradores.",
      name: "Carla Mendes",
      title: "Síndica",
      img: "/placeholder.svg",
    },
    {
      id: "feedback-3",
      content: "Como morador, posso acompanhar tudo que acontece no condomínio e agendar áreas de lazer facilmente.",
      name: "Paulo Santos",
      title: "Morador",
      img: "/placeholder.svg",
    },
  ];

  return (
    <section id="clients" ref={ref} className="w-full flex flex-col justify-center py-16 px-6 sm:px-16 relative">
      <div className="absolute z-[0] w-[60%] h-[60%] -right-[50%] rounded-full blue__gradient" />
      
      <div className="w-full flex justify-between items-center md:flex-row flex-col mb-16 relative z-[1]">
        <h1 className={`font-display font-semibold text-[40px] text-gray-800 leading-[66px] ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
          O que estão dizendo <br className="sm:block hidden" /> sobre nós
        </h1>
        <div className={`w-full md:mt-0 mt-6 ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
          <p className="font-normal text-gray-600 text-[18px] leading-[30.8px] text-left max-w-[450px]">
            Centenas de síndicos e moradores já aproveitam as vantagens do 
            MeuResidencial para uma gestão condominial mais eficiente.
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center w-full feedback-container relative z-[1]">
        {feedback.map((card, index) => (
          <FeedbackCard key={card.id} {...card} index={index} inView={inView} />
        ))}
      </div>
    </section>
  );
};

// CTA section
const CTA = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className={`w-full flex justify-center items-center py-16 px-6 sm:px-16 sm:flex-row flex-col bg-gradient-to-r from-blue-700 to-blue-500 rounded-[20px] ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="flex-1 flex flex-col">
        <h2 className="font-display font-semibold text-[40px] text-white leading-[66px]">
          Experimente o MeuResidencial agora!
        </h2>
        <p className="font-normal text-white text-[18px] leading-[30.8px] max-w-[470px] mt-5">
          Cadastre seu condomínio e aproveite todos os recursos da plataforma 
          mais completa para a gestão de condomínios.
        </p>
      </div>
      
      <div className={`flex justify-center items-center sm:ml-10 ml-0 sm:mt-0 mt-10 ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}>
        <Button 
          className="py-4 px-6 bg-white hover:bg-gray-200 text-brand-700 rounded-[10px] outline-none text-lg"
          asChild
        >
          <Link to="/login">
            Acessar Meu Residencial
          </Link>
        </Button>
      </div>
    </section>
  );
};

// Pricing section
const Pricing = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const plans = [
    {
      id: "plan-1",
      title: "Básico",
      price: "R$ 149,90",
      description: "Ideal para condomínios pequenos de até 20 unidades",
      features: [
        "Gestão financeira básica",
        "Comunicados para moradores",
        "Cadastro de moradores",
        "Reserva de áreas comuns",
        "Suporte por email"
      ],
      icon: Building
    },
    {
      id: "plan-2",
      title: "Profissional",
      price: "R$ 249,90",
      description: "Perfeito para condomínios médios de até 50 unidades",
      features: [
        "Todas as funcionalidades do Básico",
        "Prestação de contas avançada",
        "Recebimento por PIX",
        "Gestão de documentos",
        "Suporte prioritário"
      ],
      icon: Shield,
      highlight: true
    },
    {
      id: "plan-3",
      title: "Empresarial",
      price: "R$ 399,90",
      description: "Completo para condomínios grandes ou administradoras",
      features: [
        "Todas as funcionalidades do Profissional",
        "Múltiplos condomínios",
        "APIs para integração",
        "Relatórios personalizados",
        "Suporte 24/7"
      ],
      icon: Settings
    }
  ];

  return (
    <section id="pricing" ref={ref} className="w-full py-16 px-6 sm:px-16">
      <div className="text-center mb-16">
        <h2 className={`font-display font-semibold text-[40px] text-gray-800 leading-[66px] ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
          Planos que se adaptam às suas necessidades
        </h2>
        <p className={`font-normal text-gray-600 text-[18px] leading-[30.8px] max-w-[600px] mx-auto mt-5 ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
          Escolha o plano ideal para o seu condomínio e comece a 
          aproveitar todos os benefícios do MeuResidencial.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-10">
        {plans.map((plan, index) => (
          <div 
            key={plan.id} 
            className={`w-full max-w-[350px] p-8 rounded-[20px] ${plan.highlight ? 'border-2 border-brand-600 shadow-lg' : 'border border-gray-200'} ${inView ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <div className="flex items-center mb-4">
              <div className={`w-[48px] h-[48px] rounded-full flex justify-center items-center ${plan.highlight ? 'bg-brand-600' : 'bg-blue-100'}`}>
                <plan.icon className={`w-6 h-6 ${plan.highlight ? 'text-white' : 'text-brand-600'}`} />
              </div>
              <h3 className="font-display font-semibold text-[24px] text-gray-800 ml-4">{plan.title}</h3>
            </div>
            
            <h4 className="font-display font-semibold text-[36px] text-gray-800 mt-4">{plan.price}</h4>
            <p className="text-gray-600 mt-2 mb-6">{plan.description}</p>
            
            <div className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                  <p className="ml-3 text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
            
            <Button 
              className={`w-full py-3 ${plan.highlight ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} rounded-[10px]`}
              asChild
            >
              <Link to="/login">
                Começar Agora
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

// FAQ section
const FAQ = () => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const faqs = [
    {
      question: "Como posso começar a usar o MeuResidencial?",
      answer: "Basta clicar no botão 'Acessar Meu Residencial', criar sua conta e cadastrar seu condomínio. O processo é simples e rápido, e você poderá começar a usar a plataforma imediatamente."
    },
    {
      question: "É possível migrar dados de outro sistema?",
      answer: "Sim, oferecemos suporte para migração de dados. Entre em contato com nosso time de suporte após criar sua conta, e ajudaremos você a importar os dados do seu condomínio."
    },
    {
      question: "Quanto tempo leva para implementar o sistema?",
      answer: "A implementação é imediata. Após o cadastro, você já terá acesso à plataforma. O tempo para configurar todas as funcionalidades depende do tamanho do condomínio, mas geralmente leva de 1 a 3 dias."
    },
    {
      question: "Os moradores precisam pagar para usar?",
      answer: "Não, apenas o condomínio precisa assinar um plano. Os moradores têm acesso gratuito à plataforma através de suas contas individuais."
    },
    {
      question: "Posso cancelar a assinatura a qualquer momento?",
      answer: "Sim, não há fidelidade. Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais."
    }
  ];

  return (
    <section id="faq" ref={ref} className="w-full py-16 px-6 sm:px-16">
      <div className="text-center mb-16">
        <h2 className={`font-display font-semibold text-[40px] text-gray-800 leading-[66px] ${inView ? 'animate-fade-in' : 'opacity-0'}`}>
          Perguntas Frequentes
        </h2>
        <p className={`font-normal text-gray-600 text-[18px] leading-[30.8px] max-w-[600px] mx-auto mt-5 ${inView ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
          Tire suas dúvidas sobre o MeuResidencial
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`mb-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${inView ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-brand-600 mt-1" />
                <div className="ml-4">
                  <h3 className="font-display font-semibold text-lg text-gray-800">{faq.question}</h3>
                  <p className="mt-2 text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Footer section
const Footer = () => {
  return (
    <footer className="w-full flex flex-col justify-center items-center bg-gray-100 py-16 px-6 sm:px-16">
      <div className="w-full max-w-[1200px] flex justify-between items-start md:flex-row flex-col mb-8 pt-6">
        <div className="flex flex-col justify-start">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-brand-600" />
            <h1 className="text-3xl font-bold text-gray-800 ml-2 font-display">MeuResidencial</h1>
          </div>
          <p className="font-normal text-gray-600 text-[18px] leading-[30.8px] mt-4 max-w-[310px]">
            A plataforma completa para gestão de condomínios.
          </p>
        </div>
        
        <div className="flex flex-row flex-wrap justify-between md:mt-0 mt-10 w-full md:w-[60%]">
          <div className="flex flex-col ss:my-0 my-4 min-w-[150px]">
            <h4 className="font-medium text-[18px] leading-[27px] text-gray-800">
              Links Úteis
            </h4>
            <ul className="list-none mt-4">
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer mb-3">
                Sobre Nós
              </li>
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer mb-3">
                Funcionalidades
              </li>
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer mb-3">
                Planos
              </li>
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer">
                Blog
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col ss:my-0 my-4 min-w-[150px]">
            <h4 className="font-medium text-[18px] leading-[27px] text-gray-800">
              Comunidade
            </h4>
            <ul className="list-none mt-4">
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer mb-3">
                Ajuda
              </li>
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer mb-3">
                Parceiros
              </li>
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer mb-3">
                Sugestões
              </li>
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer">
                Boletim
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col ss:my-0 my-4 min-w-[150px]">
            <h4 className="font-medium text-[18px] leading-[27px] text-gray-800">
              Contato
            </h4>
            <ul className="list-none mt-4">
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer mb-3">
                contato@meuresidencial.com
              </li>
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer mb-3">
                (11) 99999-9999
              </li>
              <li className="font-normal text-[16px] leading-[24px] text-gray-600 hover:text-brand-600 cursor-pointer">
                São Paulo, SP
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="w-full flex justify-between items-center md:flex-row flex-col pt-6 border-t-[1px] border-t-gray-300">
        <p className="font-normal text-center text-[18px] leading-[27px] text-gray-600">
          2025 MeuResidencial. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

// Landing Page component
const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'MeuResidencial - Gestão de Condomínios';
  }, []);

  return (
    <div className="w-full overflow-hidden bg-white">
      <div className="px-6 sm:px-16 flex justify-center items-center">
        <div className="w-full max-w-[1200px]">
          <div className="w-full flex py-6 justify-between items-center">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-brand-600" />
              <h1 className="text-3xl font-bold text-gray-800 ml-2 font-display">MeuResidencial</h1>
            </div>
            
            <div className="hidden md:flex space-x-6 items-center">
              <a href="#features" className="text-gray-600 hover:text-brand-600">Funcionalidades</a>
              <a href="#pricing" className="text-gray-600 hover:text-brand-600">Planos</a>
              <a href="#clients" className="text-gray-600 hover:text-brand-600">Depoimentos</a>
              <a href="#faq" className="text-gray-600 hover:text-brand-600">FAQ</a>
              <Button className="bg-brand-600 hover:bg-brand-700 text-white" asChild>
                <Link to="/login">
                  Acessar Meu Residencial
                </Link>
              </Button>
            </div>
            
            <div className="md:hidden">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white" asChild>
                <Link to="/login">
                  Acessar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-0">
        <Hero />
        <Stats />
        <Business />
        <Billing />
        <CardDeal />
        <Testimonials />
        <Pricing />
        <FAQ />
        <div className="px-6 sm:px-16 flex justify-center items-center py-16">
          <div className="w-full max-w-[1200px]">
            <CTA />
          </div>
        </div>
        <Footer />
      </div>
      
      <style jsx="true">{`
        .feature-card:hover {
          background: rgba(229, 236, 255, 0.5);
          transition: all 0.3s ease-in-out;
        }
        
        .feedback-card {
          background: white;
          border: 1px solid rgba(229, 236, 255, 1);
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.3s ease-in-out;
        }
        
        .feedback-card:hover {
          transform: translateY(-5px);
        }
        
        .blue__gradient {
          background: linear-gradient(180deg, rgba(188, 207, 251, 0.5) 0%, rgba(188, 207, 251, 0) 100%);
          filter: blur(80px);
        }
        
        .pink__gradient {
          background: linear-gradient(90deg, rgba(255, 207, 240, 0.5) 0%, rgba(255, 207, 240, 0) 100%);
          filter: blur(100px);
        }
        
        .white__gradient {
          background: rgba(255, 255, 255, 0.7);
          filter: blur(80px);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
