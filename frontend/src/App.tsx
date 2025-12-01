
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

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
    <BrowserRouter>
      <Routes>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
