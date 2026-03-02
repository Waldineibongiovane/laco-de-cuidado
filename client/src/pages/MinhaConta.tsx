import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SERVICES_OPTIONS, AVAILABILITY_OPTIONS, EXPERIENCE_TYPE_OPTIONS, TASK_OPTIONS, DEPENDENCY_LEVELS, DEFAULT_CENTER } from "@shared/constants";
import {
  User, Heart, Camera, MapPin, Save, Trash2, Star, Clock, ArrowLeft, Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function MinhaConta() {
  const { user, isAuthenticated, loading } = useAuth();

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Acesse sua conta</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Faça login para gerenciar seu perfil ou vaga.
              </p>
              <Button onClick={() => window.location.href = getLoginUrl()} className="w-full rounded-full">
                Entrar
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // If user has no type yet, show role selection
  if (!user?.userType) {
    return <RoleSelection />;
  }

  return user.userType === "caregiver" ? <CaregiverAccount /> : <FamilyAccount />;
}

function RoleSelection() {
  const setTypeMutation = trpc.user.setType.useMutation({
    onSuccess: () => window.location.reload(),
    onError: () => toast.error("Erro ao definir tipo de conta."),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-lg w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Bem-vindo ao Laço de Cuidado!
            </h1>
            <p className="text-muted-foreground">Como você deseja usar a plataforma?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setTypeMutation.mutate({ userType: "caregiver" })}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">Sou Cuidador</h3>
                <p className="text-sm text-muted-foreground">
                  Quero oferecer meus serviços de cuidador de idosos ou acompanhante hospitalar.
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setTypeMutation.mutate({ userType: "family" })}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-warm flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-warm-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">Sou Família</h3>
                <p className="text-sm text-muted-foreground">
                  Estou buscando um cuidador para meu familiar idoso.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function CaregiverAccount() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.caregiver.myProfile.useQuery();

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhone] = useState("");
  const [emailPublic, setEmailPublic] = useState("");
  const [bio, setBio] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState(0);
  const [experienceTypes, setExperienceTypes] = useState<string[]>([]);
  const [acceptsHospital, setAcceptsHospital] = useState(false);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [serviceRadius, setServiceRadius] = useState(50);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setAge(profile.age ?? undefined);
      setCity(profile.city || "");
      setNeighborhood(profile.neighborhood || "");
      setPhone(profile.phone || "");
      setEmailPublic(profile.emailPublic || "");
      setBio(profile.bio || "");
      setServices((profile.services as string[]) || []);
      setAvailability((profile.availability as string[]) || []);
      setExperienceYears(profile.experienceYears || 0);
      setExperienceTypes((profile.experienceTypes as string[]) || []);
      setAcceptsHospital(profile.acceptsHospitalCompanion || false);
      setLat(profile.lat ?? undefined);
      setLng(profile.lng ?? undefined);
      setServiceRadius(profile.serviceRadiusKm || 50);
      setPhotoUrl(profile.photoUrl || "");
    }
  }, [profile]);

  const upsertProfile = trpc.caregiver.upsertProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil salvo com sucesso!");
      utils.caregiver.myProfile.invalidate();
    },
    onError: () => toast.error("Erro ao salvar perfil."),
  });

  const toggleAvail = trpc.caregiver.toggleAvailability.useMutation({
    onSuccess: () => {
      toast.success("Disponibilidade atualizada!");
      utils.caregiver.myProfile.invalidate();
    },
  });

  const uploadPhoto = trpc.caregiver.uploadPhoto.useMutation({
    onSuccess: (data) => {
      setPhotoUrl(data.url);
      toast.success("Foto enviada!");
    },
    onError: () => toast.error("Erro ao enviar foto."),
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A foto deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadPhoto.mutate({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const handleSave = () => {
    if (!firstName.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    upsertProfile.mutate({
      firstName,
      age,
      city: city || undefined,
      neighborhood: neighborhood || undefined,
      phone: phone || undefined,
      emailPublic: emailPublic || undefined,
      bio: bio || undefined,
      services,
      availability,
      experienceYears,
      experienceTypes,
      acceptsHospitalCompanion: acceptsHospital,
      lat,
      lng,
      serviceRadiusKm: serviceRadius,
      photoUrl: photoUrl || undefined,
    });
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
      <div className="container py-6 flex-1">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Meu Perfil de Cuidador
            </h1>
            {profile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {profile.isAvailable ? "Disponível" : "Indisponível"}
                </span>
                <Switch
                  checked={profile.isAvailable}
                  onCheckedChange={() => toggleAvail.mutate()}
                />
              </div>
            )}
          </div>

          {/* Photo */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto" className="w-20 h-20 rounded-xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <span>
                        <Camera className="w-4 h-4" />
                        {photoUrl ? "Trocar foto" : "Enviar foto"}
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">JPG ou PNG, máx. 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="text-base">Informações básicas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Primeiro nome *</label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Seu primeiro nome" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Idade</label>
                  <Input type="number" value={age ?? ""} onChange={e => setAge(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Ex: 35" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cidade</label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Ex: Votuporanga" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Bairro</label>
                  <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Ex: Centro" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Mini bio</label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Conte um pouco sobre você e sua experiência..." rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader><CardTitle className="text-base">Contato</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">WhatsApp / Telefone</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(17) 99999-9999" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail público</label>
                <Input value={emailPublic} onChange={e => setEmailPublic(e.target.value)} placeholder="seu@email.com" />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader><CardTitle className="text-base">Serviços oferecidos</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SERVICES_OPTIONS.map(s => (
                  <Badge
                    key={s}
                    variant={services.includes(s) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleItem(services, s, setServices)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader><CardTitle className="text-base">Disponibilidade</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map(a => (
                  <Badge
                    key={a}
                    variant={availability.includes(a) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleItem(availability, a, setAvailability)}
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader><CardTitle className="text-base">Experiência</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Anos de experiência</label>
                <Input type="number" value={experienceYears} onChange={e => setExperienceYears(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipos de experiência</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_TYPE_OPTIONS.map(t => (
                    <Badge
                      key={t}
                      variant={experienceTypes.includes(t) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleItem(experienceTypes, t, setExperienceTypes)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={acceptsHospital} onCheckedChange={(v) => setAcceptsHospital(!!v)} id="hospital" />
                <label htmlFor="hospital" className="text-sm">Aceito trabalhar como acompanhante hospitalar</label>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader><CardTitle className="text-base">Localização</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Latitude</label>
                  <Input type="number" step="any" value={lat ?? ""} onChange={e => setLat(e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="-20.4228" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Longitude</label>
                  <Input type="number" step="any" value={lng ?? ""} onChange={e => setLng(e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="-49.9726" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Raio de atendimento (km)</label>
                <Input type="number" value={serviceRadius} onChange={e => setServiceRadius(parseInt(e.target.value) || 50)} />
              </div>
              <p className="text-xs text-muted-foreground">
                Dica: Use o Google Maps para encontrar suas coordenadas. Clique com o botão direito no mapa e copie as coordenadas.
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={upsertProfile.isPending} className="w-full gap-2" size="lg">
            <Save className="w-4 h-4" />
            {upsertProfile.isPending ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FamilyAccount() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: job, isLoading } = trpc.job.myJob.useQuery();
  const { data: myReviews } = trpc.review.myReviews.useQuery();

  const [elderAge, setElderAge] = useState<number | undefined>();
  const [dependencyLevel, setDependencyLevel] = useState<string>("");
  const [conditions, setConditions] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [schedule, setSchedule] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();

  useEffect(() => {
    if (job) {
      setElderAge(job.elderAge ?? undefined);
      setDependencyLevel(job.dependencyLevel || "");
      setConditions(job.conditions || "");
      setTasks((job.tasks as string[]) || []);
      setSchedule(job.schedule || "");
      setCity(job.city || "");
      setNeighborhood(job.neighborhood || "");
      setLat(job.lat ?? undefined);
      setLng(job.lng ?? undefined);
    }
  }, [job]);

  const upsertJob = trpc.job.upsert.useMutation({
    onSuccess: () => {
      toast.success("Vaga salva com sucesso!");
      utils.job.myJob.invalidate();
    },
    onError: () => toast.error("Erro ao salvar vaga."),
  });

  const deactivateJob = trpc.job.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Vaga desativada.");
      utils.job.myJob.invalidate();
    },
    onError: () => toast.error("Erro ao desativar vaga."),
  });

  const toggleTask = (t: string) => {
    setTasks(tasks.includes(t) ? tasks.filter(i => i !== t) : [...tasks, t]);
  };

  const handleSave = () => {
    upsertJob.mutate({
      elderAge,
      dependencyLevel: dependencyLevel as any || undefined,
      conditions: conditions || undefined,
      tasks,
      schedule: schedule || undefined,
      city: city || undefined,
      neighborhood: neighborhood || undefined,
      lat,
      lng,
    });
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
      <div className="container py-6 flex-1">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Minha Conta - Família
          </h1>

          <Tabs defaultValue="vaga">
            <TabsList>
              <TabsTrigger value="vaga">Minha Vaga</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações Enviadas</TabsTrigger>
            </TabsList>

            <TabsContent value="vaga" className="space-y-4 mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Dados da vaga</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Idade do idoso</label>
                      <Input type="number" value={elderAge ?? ""} onChange={e => setElderAge(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Ex: 78" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Grau de dependência</label>
                      <Select value={dependencyLevel} onValueChange={setDependencyLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPENDENCY_LEVELS.map(d => (
                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Condições de saúde</label>
                    <Textarea value={conditions} onChange={e => setConditions(e.target.value)} placeholder="Descreva as condições de saúde do idoso..." rows={2} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Horário / Escala</label>
                    <Input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="Ex: Segunda a sexta, 8h às 18h" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Tarefas necessárias</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {TASK_OPTIONS.map(t => (
                      <Badge
                        key={t}
                        variant={tasks.includes(t) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleTask(t)}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Localização</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Cidade</label>
                      <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Ex: Votuporanga" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Bairro</label>
                      <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Ex: Centro" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Latitude</label>
                      <Input type="number" step="any" value={lat ?? ""} onChange={e => setLat(e.target.value ? parseFloat(e.target.value) : undefined)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Longitude</label>
                      <Input type="number" step="any" value={lng ?? ""} onChange={e => setLng(e.target.value ? parseFloat(e.target.value) : undefined)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-muted-foreground text-center">
                Remuneração: <strong>A combinar</strong> (diretamente com o cuidador)
              </p>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={upsertJob.isPending} className="flex-1 gap-2" size="lg">
                  <Save className="w-4 h-4" />
                  {upsertJob.isPending ? "Salvando..." : (job ? "Atualizar Vaga" : "Publicar Vaga")}
                </Button>
                {job && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => deactivateJob.mutate({ jobId: job.id })}
                    disabled={deactivateJob.isPending}
                    className="gap-2 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Desativar
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="avaliacoes" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {myReviews && myReviews.length > 0 ? (
                    <div className="space-y-4">
                      {myReviews.map((r: any) => (
                        <div key={r.id} className="border-b last:border-0 pb-3 last:pb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Você ainda não enviou nenhuma avaliação.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
