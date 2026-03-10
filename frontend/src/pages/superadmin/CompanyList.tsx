import { useEffect, useState } from 'react';
import { Plus, Users, Building2, UserPlus, Edit, PauseCircle, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from '../../services/superadmin';
import type { Company } from '../../types/company';

export function CompanyList() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await superAdminService.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (company: Company) => {
    const isSuspended = company.status === 'suspended';
    const action = isSuspended ? 'reactivar' : 'suspender';
    
    if (!window.confirm(`¿Estás seguro de que deseas ${action} el servicio para ${company.name}?`)) {
      return;
    }

    try {
      await superAdminService.updateCompany(company.id, {
        status: isSuspended ? 'active' : 'suspended'
      });
      loadCompanies();
    } catch (error) {
      console.error('Error updating company status:', error);
      alert('Error al actualizar el estado de la empresa');
    }
  };

  const getDaysRemaining = (suspendedAt?: string) => {
    if (!suspendedAt) return 30;
    const suspendedDate = new Date(suspendedAt);
    const deleteDate = new Date(suspendedDate);
    deleteDate.setDate(deleteDate.getDate() + 30);
    
    const now = new Date();
    const diffTime = deleteDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) return <div className="p-8 text-center">Cargando empresas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Empresas Registradas</h1>
          <p className="text-gray-600">Gestión de clientes y límites</p>
        </div>
        <button
          onClick={() => navigate('/superadmin/companies/new')}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Empresa</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div key={company.id} className={`bg-white rounded-xl shadow-sm border p-6 space-y-4 ${
            company.status === 'suspended' ? 'border-red-200 bg-red-50' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  company.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      company.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : company.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {company.status === 'active' ? 'Activa' : company.status === 'suspended' ? 'Suspendida' : 'Inactiva'}
                    </span>
                    {company.status === 'suspended' && (
                      <span className="text-xs text-red-600 font-medium">
                        {getDaysRemaining(company.suspendedAt)} días para eliminación
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => navigate(`/superadmin/companies/${company.id}/edit`)}
                  className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleSuspend(company)}
                  className={`p-1 rounded-full hover:bg-gray-100 ${
                    company.status === 'suspended' ? 'text-green-600 hover:text-green-700' : 'text-orange-500 hover:text-orange-600'
                  }`}
                  title={company.status === 'suspended' ? "Reactivar" : "Suspender"}
                >
                  {company.status === 'suspended' ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center space-x-2">
                  <Users size={16} />
                  <span>Empleados</span>
                </span>
                <span className="font-medium text-gray-900">
                  {company.currentEmployees} / {company.maxEmployees}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    company.currentEmployees >= company.maxEmployees ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((company.currentEmployees / company.maxEmployees) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
               <button
                  onClick={() => navigate(`/superadmin/companies/${company.id}/users/new`)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
                >
                  <UserPlus size={16} />
                  <span>Crear RRHH</span>
                </button>
               <span className="text-xs text-gray-400">
                 Creada: {new Date(company.createdAt).toLocaleDateString()}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
