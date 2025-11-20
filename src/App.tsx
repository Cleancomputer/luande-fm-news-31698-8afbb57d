import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import CreateAdmin from "./pages/CreateAdmin";
import Article from "./pages/Article";
import Category from "./pages/Category";
import Search from "./pages/Search";
import SubmitNews from "./pages/SubmitNews";
import Events from "./pages/Events";
import LoadingScreen from "./components/layout/LoadingScreen";
import VLibras from "./components/layout/VLibras";
import AdSense from "./components/layout/AdSense";

// Create QueryClient outside component to avoid recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <VLibras />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AdSense />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/artigo/:slug" element={<Article />} />
            <Route path="/categoria/:category" element={<Category />} />
            <Route path="/busca" element={<Search />} />
            <Route path="/enviar-noticia" element={<SubmitNews />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
