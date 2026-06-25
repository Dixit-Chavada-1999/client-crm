import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PortalProtectedRoute from './components/portal/PortalProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import LeadCreate from './pages/LeadCreate';
import LeadEdit from './pages/LeadEdit';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Portal pages
import {
  PortalLogin,
  PortalDashboard,
  PortalProjects,
  PortalQuotations,
  PortalInvoices,
  PortalDocuments,
  PortalProfile,
} from './pages/portal';

const router = createBrowserRouter([
  // Staff/Admin routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'leads',
        element: <Leads />,
      },
      {
        path: 'leads/new',
        element: <LeadCreate />,
      },
      {
        path: 'leads/:id',
        element: <LeadDetail />,
      },
      {
        path: 'leads/:id/edit',
        element: <LeadEdit />,
      },
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'customers/:id',
        element: <CustomerDetail />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },

  // Customer Portal routes
  {
    path: '/portal/login',
    element: <PortalLogin />,
  },
  {
    path: '/portal',
    element: (
      <PortalProtectedRoute>
        <PortalDashboard />
      </PortalProtectedRoute>
    ),
  },
  {
    path: '/portal/projects',
    element: (
      <PortalProtectedRoute permission="view_projects">
        <PortalProjects />
      </PortalProtectedRoute>
    ),
  },
  {
    path: '/portal/quotations',
    element: (
      <PortalProtectedRoute permission="view_quotations">
        <PortalQuotations />
      </PortalProtectedRoute>
    ),
  },
  {
    path: '/portal/invoices',
    element: (
      <PortalProtectedRoute permission="view_invoices">
        <PortalInvoices />
      </PortalProtectedRoute>
    ),
  },
  {
    path: '/portal/documents',
    element: (
      <PortalProtectedRoute permission="view_documents">
        <PortalDocuments />
      </PortalProtectedRoute>
    ),
  },
  {
    path: '/portal/profile',
    element: (
      <PortalProtectedRoute>
        <PortalProfile />
      </PortalProtectedRoute>
    ),
  },

  // 404
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
