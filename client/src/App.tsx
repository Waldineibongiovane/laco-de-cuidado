import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CookieBanner from "./components/CookieBanner";
import Home from "./pages/Home";
import BuscarCuidadores from "./pages/BuscarCuidadores";
import PerfilCuidador from "./pages/PerfilCuidador";
import MinhaConta from "./pages/MinhaConta";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buscar" component={BuscarCuidadores} />
      <Route path="/cuidador/:id" component={PerfilCuidador} />
      <Route path="/minha-conta" component={MinhaConta} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/termos" component={Termos} />
      <Route path="/privacidade" component={Privacidade} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
