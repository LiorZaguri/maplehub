import { ReactNode, useState, useEffect } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import Navigation from './Navigation';
import TopNavbar from './TopNavbar';
import { LayoutToggle } from './LayoutToggle';
import { Footer } from './Footer';

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
    <div className="min-h-screen bg-background flex flex-col">
      {shouldUseSidebar ? (
        <>
          <Navigation />
          <div className="flex-1 flex flex-col xl:ml-64">
            <main className="flex-1 p-3 pt-20 sm:p-4 sm:pt-20 md:p-6 md:pt-20 lg:p-8 lg:pt-20">
              {children}
            </main>
            {/* Footer positioned within the main content area for sidebar layout */}
            <Footer />
          </div>
        </>
      ) : (
        <>
          <TopNavbar />
          <main className="flex-1 p-3 pt-20 sm:p-4 sm:pt-20 md:p-6 md:pt-20 lg:p-8 lg:pt-20">
            {children}
          </main>
          {/* Footer positioned normally for topbar layout */}
          <Footer />
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
