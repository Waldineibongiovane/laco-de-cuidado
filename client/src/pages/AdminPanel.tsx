import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const { data: users, isLoading, refetch } = trpc.admin.listUsers.useQuery();
  const { data: reports } = trpc.admin.listReports.useQuery();
  
  const createUser = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Erro ao criar usuário"),
  });

  const updateUserRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Perfil de usuário atualizado!");
      refetch();
    },
    onError: () => toast.error("Erro ao atualizar perfil"),
  });

  const updateUserType = trpc.admin.updateUserType.useMutation({
    onSuccess: () => {
      toast.success("Tipo de usuário atualizado!");
      refetch();
    },
    onError: () => toast.error("Erro ao atualizar tipo"),
  });

  const toggleBlock = trpc.admin.toggleBlock.useMutation({
    onSuccess: () => {
      toast.success("Status do usuário atualizado!");
      refetch();
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const deleteUser = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário deletado!");
      refetch();
    },
    onError: () => toast.error("Erro ao deletar usuário"),
  });

  const updateReportStatus = trpc.admin.updateReportStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do relatório atualizado!");
      refetch();
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const deleteReport = trpc.admin.deleteReport.useMutation({
    onSuccess: () => {
      toast.success("Relatório deletado!");
      refetch();
    },
    onError: () => toast.error("Erro ao deletar relatório"),
  });

  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    userType: "caregiver" as "caregiver" | "family",
    role: "user" as "user" | "admin",
  });

  const handleCreateUser = () => {
    if (!newUserForm.name || !newUserForm.email) {
      toast.error("Preencha todos os campos");
      return;
    }
    createUser.mutate(newUserForm);
    setNewUserForm({ name: "", email: "", userType: "caregiver", role: "user" });
  };

  if (isLoading) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Users Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gerenciar Usuários</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nome"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    />
                    <Select value={newUserForm.userType} onValueChange={(v) => setNewUserForm({ ...newUserForm, userType: v as "caregiver" | "family" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de Usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caregiver">Cuidador</SelectItem>
                        <SelectItem value="family">Família</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newUserForm.role} onValueChange={(v) => setNewUserForm({ ...newUserForm, role: v as "user" | "admin" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateUser} disabled={createUser.isPending} className="w-full">
                      {createUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Criar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Nome</th>
                      <th className="text-left py-2 px-4">Email</th>
                      <th className="text-left py-2 px-4">Tipo</th>
                      <th className="text-left py-2 px-4">Perfil</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{user.name || "N/A"}</td>
                        <td className="py-2 px-4">{user.email || "N/A"}</td>
                        <td className="py-2 px-4">
                          <Select value={user.userType || "caregiver"} onValueChange={(v) => updateUserType.mutate({ userId: user.id, userType: v as "caregiver" | "family" })}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="caregiver">Cuidador</SelectItem>
                              <SelectItem value="family">Família</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-4">
                          <Select value={user.role} onValueChange={(v) => updateUserRole.mutate({ userId: user.id, role: v as "user" | "admin" })}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuário</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 px-4">
                          <Button
                            size="sm"
                            variant={user.isBlocked ? "destructive" : "outline"}
                            onClick={() => toggleBlock.mutate({ userId: user.id, isBlocked: !user.isBlocked })}
                          >
                            {user.isBlocked ? "Bloqueado" : "Ativo"}
                          </Button>
                        </td>
                        <td className="py-2 px-4">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja deletar este usuário?")) {
                                deleteUser.mutate({ userId: user.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Reports Management */}
          <Card>
            <CardHeader>
              <CardTitle>Denúncias ({reports?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports?.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Motivo: {report.reason}</p>
                        <p className="text-sm text-muted-foreground">ID Denunciante: {report.reporterUserId}</p>
                        <p className="text-sm text-muted-foreground">ID Denunciado: {report.reportedUserId}</p>
                        {report.details && <p className="text-sm mt-2">{report.details}</p>}
                      </div>
                      <Select value={report.status} onValueChange={(v) => updateReportStatus.mutate({ reportId: report.id, status: v as "open" | "reviewed" | "closed" })}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Aberto</SelectItem>
                          <SelectItem value="reviewed">Revisado</SelectItem>
                          <SelectItem value="closed">Fechado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Deletar esta denúncia?")) {
                          deleteReport.mutate({ reportId: report.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
