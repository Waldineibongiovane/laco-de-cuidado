import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Heart, Search, UserPlus, MessageCircle, Shield, Star, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopCaregiversRanking from "@/components/TopCaregiversRanking";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-warm/30">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Heart className="w-4 h-4 fill-primary" />
              Votuporanga e região (até 50 km)
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Encontre o cuidador ideal para quem você{" "}
              <span className="text-primary">ama</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Conectamos famílias a cuidadores de idosos e acompanhantes hospitalares de forma gratuita, simples e segura.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/buscar">
                <Button size="lg" className="rounded-full px-8 text-base gap-2 w-full sm:w-auto shadow-md hover:shadow-lg transition-all">
                  <Search className="w-5 h-5" />
                  Encontrar Cuidador
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link href="/minha-conta">
                  <Button variant="outline" size="lg" className="rounded-full px-8 text-base gap-2 w-full sm:w-auto">
                    <UserPlus className="w-5 h-5" />
                    Sou Cuidador
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 text-base gap-2"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <UserPlus className="w-5 h-5" />
                  Sou Cuidador
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Como funciona?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Em três passos simples, você encontra o cuidador perfeito para sua família.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-sm bg-gradient-to-b from-primary/5 to-transparent">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">PASSO 1</div>
                <h3 className="font-bold text-lg mb-2">Busque</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pesquise cuidadores por localização, especialidade, disponibilidade e experiência.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-b from-primary/5 to-transparent">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-7 h-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">PASSO 2</div>
                <h3 className="font-bold text-lg mb-2">Avalie</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Veja perfis completos, avaliações de outras famílias e escolha com confiança.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-b from-primary/5 to-transparent">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">PASSO 3</div>
                <h3 className="font-bold text-lg mb-2">Entre em contato</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fale diretamente com o cuidador via WhatsApp, telefone ou e-mail. Sem intermediários.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Caregivers Ranking */}
      <section className="py-16 bg-white">
        <div className="container">
          <TopCaregiversRanking />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <Card className="border border-amber-200/80 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Shield className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm mb-1 text-amber-900">Aviso importante</h3>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      O Laço de Cuidado é uma plataforma de intermediação gratuita. Não realizamos verificação de identidade ou documentos dos cuidadores.
                      Recomendamos que as famílias verifiquem referências, documentos e experiência diretamente com o cuidador antes de qualquer contratação.
                      Não nos responsabilizamos pela qualidade dos serviços prestados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Cadastre-se gratuitamente e encontre o cuidador ideal ou ofereça seus serviços.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/buscar">
              <Button size="lg" className="rounded-full px-8 gap-2 w-full sm:w-auto">
                Buscar Cuidadores
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
