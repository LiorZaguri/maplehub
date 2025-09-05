import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/Layout";
import { ServerStatusNotifier } from "@/components/ServerStatusNotifier";
import { ServerStatusIndicator } from "@/components/ServerStatusIndicator";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const BossTracker = lazy(() => import("./pages/BossTracker"));
const TaskTracker = lazy(() => import("./pages/TaskTracker"));
const VITracker = lazy(() => import("./pages/VITracker"));
const Mules = lazy(() => import("./pages/Mules"));
const ServerStatus = lazy(() => import("./pages/ServerStatus"));
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ServerStatusNotifier />
      {/* Desktop Server Status Indicator - Completely independent of routing */}
      <div className="hidden xl:block fixed left-0 bottom-0 w-64 z-50">
        <ServerStatusIndicator />
      </div>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bosses" element={<BossTracker />} />
            <Route path="/tasks" element={<TaskTracker />} />
            <Route path="/vi-tracker" element={<VITracker />} />
            <Route path="/mules" element={<Mules />} />
            <Route path="/server-status" element={<ServerStatus />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
