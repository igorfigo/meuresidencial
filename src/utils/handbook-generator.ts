
import { jsPDF } from 'jspdf';

export const generateHandbook = () => {
  const doc = new jsPDF();
  
  // Config
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const textWidth = pageWidth - (2 * margin);

  // Helper function for text wrapping and positioning
  const addWrappedText = (text: string, y: number, fontSize = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, textWidth);
    doc.text(lines, margin, y);
    return y + (lines.length * fontSize * 0.352778); // Return new Y position
  };

  // Title
  doc.setFont("helvetica", "bold");
  let yPosition = 20;
  doc.setFontSize(18);
  doc.text("Manual do Usuário - Condomob", margin, yPosition);
  
  // Introduction
  yPosition = 40;
  doc.setFont("helvetica", "normal");
  yPosition = addWrappedText(
    "Prezado(a) condômino(a), bem-vindo ao aplicativo Condomob! Com ele você tem acesso a diversas funcionalidades para facilitar sua vida no condomínio.",
    yPosition
  );

  // Features Section
  yPosition += 10;
  doc.setFont("helvetica", "bold");
  yPosition = addWrappedText("Principais Funcionalidades:", yPosition);
  
  doc.setFont("helvetica", "normal");
  const features = [
    "• Reserva de Espaços: Agende o uso das áreas comuns",
    "• Comunicação: Receba comunicados importantes",
    "• Aviso de Encomendas: Controle suas entregas",
    "• Controle de Acesso: Gerencie visitantes",
    "• Boleto Online: Acesse suas cobranças",
    "• Pasta de Contas: Acompanhe documentos financeiros",
    "• Autorizar Visitantes: Cadastre e gerencie visitas",
    "• Controle de Consumo: Acompanhe gastos",
    "• Mural de Avisos: Fique por dentro das novidades",
    "• Pedir Manutenção: Solicite reparos",
    "• Ocorrências da Unidade: Registre problemas"
  ];
  
  features.forEach(feature => {
    yPosition += 8;
    yPosition = addWrappedText(feature, yPosition);
  });

  // Access Instructions
  yPosition += 15;
  doc.setFont("helvetica", "bold");
  yPosition = addWrappedText("Como Acessar:", yPosition);
  
  doc.setFont("helvetica", "normal");
  const instructions = [
    "1. Baixe o aplicativo gratuitamente nas lojas de aplicativo",
    "2. Ou acesse: www.condomob.net",
    "3. Use suas credenciais fornecidas pelo síndico",
    "4. Em caso de dúvidas, consulte: www.condomob.net/novo-login"
  ];
  
  instructions.forEach(instruction => {
    yPosition += 8;
    yPosition = addWrappedText(instruction, yPosition);
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Para mais informações, consulte seu síndico.", margin, 280);

  return doc;
};
