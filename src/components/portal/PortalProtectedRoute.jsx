import { Navigate, useLocation } from 'react-router-dom';
import useCustomerAuthStore from '../../store/customerAuthStore';

export default function PortalProtectedRoute({ children, permission }) {
    const { isAuthenticated, hasPermission } = useCustomerAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/portal/login" state={{ from: location }} replace />;
    }

    if (permission && !hasPermission(permission)) {
        return <Navigate to="/portal" replace />;
    }

    return children;
}
