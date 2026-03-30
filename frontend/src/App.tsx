import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MyHistory } from './pages/MyHistory';
import { AdminLayout } from './pages/admin/AdminLayout';
import { EmployeeList } from './pages/admin/EmployeeList';
import { CreateEmployee } from './pages/admin/CreateEmployee';
import { EmployeeHistory } from './pages/admin/EmployeeHistory';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CompanySettingsPage } from './pages/admin/CompanySettings';
import { WorkScheduleRequestsPage } from './pages/admin/WorkScheduleRequests';
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
    let cancelled = false;

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
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('user');
          }
        }

        if (storedUser) {
          setLoading(false);
        }

        const user = await authService.me();
        if (!cancelled) {
          setUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        const status = (error as { response?: { status?: number } })?.response?.status;
        const shouldLogout = status === 401 || !localStorage.getItem('user');

        if (shouldLogout) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!cancelled) {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
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
        <Route path="/dashboard/history" element={user && user.role !== 'superadmin' ? <MyHistory /> : <Navigate to="/" replace />} />
        
        <Route path="/admin" element={user && user.role === 'admin' ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/" replace />}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/new" element={<CreateEmployee />} />
          <Route path="employees/:id/edit" element={<CreateEmployee />} />
          <Route path="employees/:id/history" element={<EmployeeHistory />} />
          <Route path="correction-requests" element={<WorkScheduleRequestsPage />} />
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
