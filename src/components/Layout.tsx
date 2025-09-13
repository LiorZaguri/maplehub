import { ReactNode, useState, useEffect } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import Navigation from './Navigation';
import TopNavbar from './TopNavbar';
import { LayoutToggle } from './LayoutToggle';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { layoutType } = useLayout();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // md breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // On mobile, always use sidebar layout (which becomes hamburger menu)
  // On desktop, use user's preference
  const shouldUseSidebar = isMobile || layoutType === 'sidebar';

  // Set class on body for CSS targeting
  useEffect(() => {
    if (shouldUseSidebar) {
      document.body.classList.remove('topbar-layout');
      document.body.classList.add('sidebar-layout');
    } else {
      document.body.classList.remove('sidebar-layout');
      document.body.classList.add('topbar-layout');
    }
    return () => {
      document.body.classList.remove('topbar-layout', 'sidebar-layout');
    };
  }, [shouldUseSidebar]);

  return (
    <div className="min-h-screen bg-background">
      {shouldUseSidebar ? (
        <>
          <Navigation />
          <main className="flex-1 p-3 pt-16 sm:p-4 sm:pt-16 md:p-6 md:pt-32 lg:p-8 lg:pt-20 xl:ml-64 xl:pt-20">
            {children}
          </main>
        </>
      ) : (
        <>
          <TopNavbar />
          <main className="flex-1 p-3 pt-20 sm:p-4 sm:pt-20 md:p-6 md:pt-20 lg:p-8 lg:pt-20">
            {children}
          </main>
        </>
      )}
      
      {/* Layout Toggle - Only show when using sidebar layout */}
      {shouldUseSidebar && (
        <div className="fixed top-4 right-4 z-50">
          <LayoutToggle />
        </div>
      )}
    </div>
  );
};

export default Layout;
