import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading, refreshAuth } = useAuth();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if there's an auth code in the URL
        // Handle double hash: /#/auth/callback#access_token=...
        const fullHash = window.location.hash;
        const hashParts = fullHash.split('#');
        const oauthParams = hashParts.length > 2 ? hashParts[2] : hashParts[1].split('#')[1] || '';
        const hashParams = new URLSearchParams(oauthParams);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session from URL parameters
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
          }
        } else {
          // Try to get session normally
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Auth callback error:', error);
          }
        }

        // Force refresh auth state and wait for it to update
        await refreshAuth();

        setTimeout(() => {
          setProcessed(true);
          navigate('/', { replace: true });
        }, 1000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setProcessed(true);
        setTimeout(() => navigate('/', { replace: true }), 1000);
      }
    };

    // Only process if we haven't already
    if (!processed) {
      handleAuthCallback();
    }
  }, [navigate, processed, refreshAuth]);

  // Hide navigation during auth callback
  useEffect(() => {
    const nav = document.querySelector('nav') as HTMLElement;
    const mobileNav = document.querySelector('.xl\\:hidden.fixed.top-0') as HTMLElement;
    if (nav) nav.style.display = 'none';
    if (mobileNav) mobileNav.style.display = 'none';

    return () => {
      if (nav) nav.style.display = '';
      if (mobileNav) mobileNav.style.display = '';
    };
  }, []);

  // Show success message if user is authenticated
  if (user && processed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-xl font-semibold mb-2">Successfully signed in!</h2>
          <p className="text-muted-foreground">Redirecting you now...</p>
        </div>
      </div>
    );
  }

  // Show loading while processing auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
