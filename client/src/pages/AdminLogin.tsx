import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSetup, setIsSetup] = useState(false);

  const loginMutation = trpc.adminLogin.login.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        localStorage.setItem("adminUsername", username);
        window.location.href = "/admin";
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Erro ao fazer login"),
  });

  const setupMutation = trpc.adminLogin.setupAdmin.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        setIsSetup(false);
        setUsername("");
        setPassword("");
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error("Erro ao criar admin"),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }
    setupMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle style={{ fontFamily: "'Nunito', sans-serif" }}>
              {isSetup ? "Criar Conta Admin" : "Login Administrativo"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Usuário</label>
                <Input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loginMutation.isPending || setupMutation.isPending}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending || setupMutation.isPending}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || setupMutation.isPending}
              >
                {loginMutation.isPending || setupMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                ) : isSetup ? (
                  "Criar Admin"
                ) : (
                  "Entrar"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSetup(!isSetup);
                  setUsername("");
                  setPassword("");
                }}
              >
                {isSetup ? "Voltar ao Login" : "Criar Nova Conta"}
              </Button>
            </form>

            {!isSetup && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <p className="font-medium mb-2">Primeira vez?</p>
                <p>Clique em "Criar Nova Conta" para criar as credenciais de admin.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
