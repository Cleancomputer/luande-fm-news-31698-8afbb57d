import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import VideoNews from "./pages/VideoNews";
import AdSense from "./components/layout/AdSense";
import CanonicalUrl from "./components/layout/CanonicalUrl";
import ViewportSafeArea from "./components/layout/ViewportSafeArea";

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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AdSense />
          <CanonicalUrl />
          <ViewportSafeArea />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/artigo/:slug" element={<Article />} />
            <Route path="/categoria/:category" element={<Category />} />
            <Route path="/busca" element={<Search />} />
            <Route path="/enviar-noticia" element={<SubmitNews />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/sobre-nos" element={<AboutUs />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
            <Route path="/termos-de-uso" element={<TermsOfUse />} />
            <Route path="/videos" element={<VideoNews />} />
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
