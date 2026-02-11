import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getLoginUrl } from "@/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Menu, Search, User, LogOut, Shield, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/buscar", label: "Buscar Cuidadores" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/60 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground hidden sm:block" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Laço de Cuidado
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}>
              <span className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user.name || "Usuário"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => window.location.href = "/minha-conta"}>
                  <User className="mr-2 h-4 w-4" />
                  Minha Conta
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
                    <Shield className="mr-2 h-4 w-4" />
                    Painel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => window.location.href = getLoginUrl()} size="sm" className="rounded-full px-5">
              Entrar
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
                    </div>
                    <span className="font-bold text-base" style={{ fontFamily: "'Nunito', sans-serif" }}>
                      Laço de Cuidado
                    </span>
                  </div>
                </div>

                <nav className="flex flex-col p-4 gap-1">
                  {navLinks.map(link => (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                      <span className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}>
                        {link.label}
                      </span>
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <>
                      <Link href="/minha-conta" onClick={() => setMobileOpen(false)}>
                        <span className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive("/minha-conta")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}>
                          Minha Conta
                        </span>
                      </Link>
                      {user?.role === "admin" && (
                        <Link href="/admin" onClick={() => setMobileOpen(false)}>
                          <span className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                            Painel Admin
                          </span>
                        </Link>
                      )}
                    </>
                  )}
                </nav>

                <div className="mt-auto p-4 border-t">
                  {isAuthenticated && user ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 px-1">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{user.name || "Usuário"}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { logout(); setMobileOpen(false); }} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => { window.location.href = getLoginUrl(); setMobileOpen(false); }}
                      className="w-full rounded-full"
                    >
                      Entrar
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
