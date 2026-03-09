import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { EmployeeList } from './pages/admin/EmployeeList';
import { CreateEmployee } from './pages/admin/CreateEmployee';
import { EmployeeHistory } from './pages/admin/EmployeeHistory';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CompanySettingsPage } from './pages/admin/CompanySettings';
import { SuperAdminLayout } from './pages/superadmin/SuperAdminLayout';
import { CompanyList } from './pages/superadmin/CompanyList';
import { CreateCompany } from './pages/superadmin/CreateCompany';
import { EditCompany } from './pages/superadmin/EditCompany';
import { CreateCompanyUser } from './pages/superadmin/CreateCompanyUser';
import { authService } from './services/auth';
import type { User } from './types/user';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to recover from local storage first for speed
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Then verify with API
        const user = await authService.me();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  const getHomeRoute = (user: User) => {
    if (user.role === 'superadmin') return '/superadmin/companies';
    return '/dashboard';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Navigate to={getHomeRoute(user)} replace />} />
        
        <Route path="/dashboard" element={user && user.role !== 'superadmin' ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
        
        <Route path="/admin" element={user && user.role === 'admin' ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/" replace />}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/new" element={<CreateEmployee />} />
          <Route path="employees/:id/edit" element={<CreateEmployee />} />
          <Route path="employees/:id/history" element={<EmployeeHistory />} />
          <Route path="settings" element={<CompanySettingsPage />} />
        </Route>

        <Route path="/superadmin" element={user && user.role === 'superadmin' ? <SuperAdminLayout onLogout={handleLogout} /> : <Navigate to="/" replace />}>
          <Route index element={<Navigate to="companies" replace />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/new" element={<CreateCompany />} />
          <Route path="companies/:id/edit" element={<EditCompany />} />
          <Route path="companies/:id/users/new" element={<CreateCompanyUser />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
