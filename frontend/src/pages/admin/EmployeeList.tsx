import React, { useEffect, useState } from 'react';
import { Plus, Search, Shield, User as UserIcon, Pencil, UserX, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AttendanceDetail } from '../../components/AttendanceDetail';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { employeeService } from '../../services/employee';
import type { User } from '../../types/user';

export function EmployeeList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (employeeId: string) => {
    setExpandedEmployeeId(prev => prev === employeeId ? null : employeeId);
  };
  
  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      await employeeService.delete(employeeToDelete);
      await loadEmployees();
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Hubo un error al eliminar el trabajador');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setDeleteModalOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando personal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planilla de Personal</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los usuarios y accesos del sistema</p>
        </div>
        
        <button 
          onClick={() => navigate('/admin/employees/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Registrar Empleado</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Puesto</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <tr 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedEmployeeId === user.id ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleEmployee(user.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.department}</div>
                      <div className="text-xs text-gray-500">Incorporado: {user.joinDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        {user.role === 'admin' ? <Shield size={16} className="text-indigo-500" /> : <UserIcon size={16} />}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="Editar"
                          onClick={() => navigate(`/admin/employees/${user.id}/edit`)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Dar de baja / Eliminar"
                          onClick={() => handleDeleteClick(user.id)}
                        >
                          <UserX size={18} />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEmployee(user.id);
                          }}
                        >
                          {expandedEmployeeId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedEmployeeId === user.id && (
                    <tr>
                      <td colSpan={5} className="p-0 border-b border-gray-100">
                        <AttendanceDetail employeeId={user.id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron empleados que coincidan con tu búsqueda.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Estás de acuerdo con eliminar a este trabajador? Esta acción eliminará sus credenciales, registros de asistencia y no se puede deshacer."
        confirmText="Eliminar trabajador"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
