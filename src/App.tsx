import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Layout from "@/components/Layout";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const BossTracker = lazy(() => import("./pages/BossTracker"));
const TaskTracker = lazy(() => import("./pages/TaskTracker"));
const VITracker = lazy(() => import("./pages/VITracker"));
const Mules = lazy(() => import("./pages/Mules"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// GitHub Pages redirect handler
const GitHubPagesRedirect = () => {
  useEffect(() => {
    // Check if we're on GitHub Pages and need to redirect
    if (window.location.search.includes('?/')) {
      const redirect = window.location.search.replace('?/', '');
      if (redirect) {
        window.history.replaceState(null, '', redirect);
      }
    }
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GitHubPagesRedirect />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bosses" element={<BossTracker />} />
            <Route path="/tasks" element={<TaskTracker />} />
            <Route path="/vi-tracker" element={<VITracker />} />
            <Route path="/mules" element={<Mules />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
