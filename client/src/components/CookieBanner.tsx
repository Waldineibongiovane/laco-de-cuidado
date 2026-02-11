import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="container">
        <div className="bg-card border shadow-lg rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-muted-foreground flex-1">
            Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{" "}
            <a href="/privacidade" className="text-primary underline underline-offset-2">Política de Privacidade</a>.
          </p>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={decline} className="text-xs">
              Recusar
            </Button>
            <Button size="sm" onClick={accept} className="text-xs">
              Aceitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
