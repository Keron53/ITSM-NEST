import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import Dashboard from './pages/Dashboard';

// Placeholder components for now
import IncidentList from './pages/incidents/IncidentList';
import IncidentForm from './pages/incidents/IncidentForm';

import ProblemList from './pages/problems/ProblemList';
import ProblemForm from './pages/problems/ProblemForm';

import ChangeRequestList from './pages/changes/ChangeRequestList';
import ChangeRequestForm from './pages/changes/ChangeRequestForm';

import ServiceRequestList from './pages/requests/ServiceRequestList';
import ServiceRequestForm from './pages/requests/ServiceRequestForm';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="incidents" element={<IncidentList />} />
              <Route path="incidents/new" element={<IncidentForm />} />
              <Route path="incidents/:id/edit" element={<IncidentForm />} />
              <Route path="problems" element={<ProblemList />} />
              <Route path="problems/new" element={<ProblemForm />} />
              <Route path="problems/:id/edit" element={<ProblemForm />} />
              <Route path="changes" element={<ChangeRequestList />} />
              <Route path="changes/new" element={<ChangeRequestForm />} />
              <Route path="changes/:id/edit" element={<ChangeRequestForm />} />
              <Route path="requests" element={<ServiceRequestList />} />
              <Route path="requests/new" element={<ServiceRequestForm />} />
              <Route path="requests/:id/edit" element={<ServiceRequestForm />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/new" element={<UserForm />} />
              <Route path="users/:id/edit" element={<UserForm />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
