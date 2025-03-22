import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteGuardProps {
  children: ReactNode;
}

const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  // Initialize with defaults for debugging
  const [loading] = useState(false);
  const [isAuthenticated] = useState(true); 

  useEffect(() => {
    console.log('AdminRouteGuard: Bypassing authentication check for debugging');
    
    // Commented out for debugging
    /*
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const { data: sessionData } = await ({} as any).auth.getSession();
        
        if (!sessionData.session) {
          // setIsAuthenticated(false);
          // setLoading(false);
          return;
        }

        // Check if user has admin role
        const { data: adminData, error: adminError } = await ({} as any)
          .from('admin_users')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .single();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error('Error checking admin status:', adminError);
          // setIsAuthenticated(false);
        } else {
          // setIsAuthenticated(!!adminData);
        }
      } catch (error) {
        console.error('Error in admin authentication check:', error);
        // setIsAuthenticated(false);
      } finally {
        // setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: authListener } = ({} as any).auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          // setIsAuthenticated(false);
        } else if (session) {
          // Recheck admin status
          const { data } = await ({} as any)
            .from('admin_users')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          // setIsAuthenticated(!!data);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
    */
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default AdminRouteGuard;
