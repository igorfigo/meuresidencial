
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Receipt, FileIcon } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const BusinessManagement = () => {
  const modules = [
    {
      title: 'Despesas da Empresa',
      description: 'Gerencie despesas administrativas e operacionais da empresa.',
      icon: <Receipt className="h-10 w-10 text-blue-500" />,
      link: '/business-management/despesas',
    },
    {
      title: 'Contratos',
      description: 'Gerencie contratos com fornecedores e parceiros.',
      icon: <FileText className="h-10 w-10 text-green-500" />,
      link: '/business-management/contratos',
    },
    {
      title: 'Documentos',
      description: 'Armazene e gerencie documentos importantes da empresa.',
      icon: <FileIcon className="h-10 w-10 text-purple-500" />,
      link: '/business-management/documentos',
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Business Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link
              key={index}
              to={module.link}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                  {module.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{module.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {module.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessManagement;
