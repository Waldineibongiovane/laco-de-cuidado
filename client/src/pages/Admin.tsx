import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Users, Flag, Ban, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <Shield className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Acesso restrito</h2>
              <p className="text-sm text-muted-foreground">
                Apenas administradores podem acessar esta página.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container py-6 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Painel Administrativo
            </h1>
          </div>

          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users" className="gap-1">
                <Users className="w-4 h-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1">
                <Flag className="w-4 h-4" />
                Denúncias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              <UsersTab />
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              <ReportsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function UsersTab() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.listUsers.useQuery();

  const toggleBlock = trpc.admin.toggleBlock.useMutation({
    onSuccess: () => {
      toast.success("Status do usuário atualizado.");
      utils.admin.listUsers.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar status."),
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          Usuários cadastrados ({users?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name || "-"}</TableCell>
                  <TableCell className="text-xs">{u.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {u.userType === "caregiver" ? "Cuidador" : u.userType === "family" ? "Família" : u.role === "admin" ? "Admin" : "Novo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.isBlocked ? (
                      <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {u.role !== "admin" && (
                      <Button
                        variant={u.isBlocked ? "outline" : "destructive"}
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => toggleBlock.mutate({ userId: u.id, isBlocked: !u.isBlocked })}
                        disabled={toggleBlock.isPending}
                      >
                        {u.isBlocked ? (
                          <><CheckCircle className="w-3 h-3" /> Desbloquear</>
                        ) : (
                          <><Ban className="w-3 h-3" /> Bloquear</>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum usuário cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportsTab() {
  const utils = trpc.useUtils();
  const { data: reports, isLoading } = trpc.admin.listReports.useQuery();

  const updateStatus = trpc.admin.updateReportStatus.useMutation({
    onSuccess: () => {
      toast.success("Status da denúncia atualizado.");
      utils.admin.listReports.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar denúncia."),
  });

  const reasonLabels: Record<string, string> = {
    perfil_falso: "Perfil falso",
    conduta_inadequada: "Conduta inadequada",
    golpe: "Golpe / Fraude",
    outros: "Outros",
  };

  const statusColors: Record<string, string> = {
    open: "bg-amber-100 text-amber-700 border-amber-200",
    reviewed: "bg-blue-100 text-blue-700 border-blue-200",
    closed: "bg-gray-100 text-gray-600 border-gray-200",
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Flag className="w-4 h-4" />
          Denúncias ({reports?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Denunciante</TableHead>
                <TableHead>Denunciado</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports && reports.length > 0 ? reports.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-xs">#{r.reporterUserId}</TableCell>
                  <TableCell className="text-xs">#{r.reportedUserId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {reasonLabels[r.reason] || r.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">
                    {r.details || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColors[r.status] || ""}`}>
                      {r.status === "open" ? "Aberta" : r.status === "reviewed" ? "Revisada" : "Fechada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.status}
                      onValueChange={(v) => updateStatus.mutate({ reportId: r.id, status: v as any })}
                    >
                      <SelectTrigger className="h-8 text-xs w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberta</SelectItem>
                        <SelectItem value="reviewed">Revisada</SelectItem>
                        <SelectItem value="closed">Fechada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhuma denúncia registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
