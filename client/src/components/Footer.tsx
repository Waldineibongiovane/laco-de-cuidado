import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
              </div>
              <span className="font-bold text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Laço de Cuidado
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plataforma gratuita que conecta famílias a cuidadores de idosos e acompanhantes hospitalares na região de Votuporanga-SP.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Navegação</h4>
            <div className="flex flex-col gap-1.5">
              <Link href="/buscar" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Buscar Cuidadores
              </Link>
              <Link href="/minha-conta" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Minha Conta
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <div className="flex flex-col gap-1.5">
              <Link href="/termos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link href="/privacidade" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/admin-login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Somos apenas intermediadores. Não nos responsabilizamos pela contratação, qualidade ou conduta dos cuidadores.
            Verifique sempre as referências antes de contratar.
          </p>
        </div>
      </div>
    </footer>
  );
}
