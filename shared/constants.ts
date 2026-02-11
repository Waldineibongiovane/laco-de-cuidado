export const SERVICES_OPTIONS = [
  "Banho e higiene pessoal",
  "Alimentação e preparo de refeições",
  "Administração de medicamentos",
  "Curativos simples",
  "Acompanhamento a consultas",
  "Acompanhamento hospitalar",
  "Exercícios e fisioterapia assistida",
  "Companhia e estímulo cognitivo",
  "Auxílio na locomoção",
  "Organização do ambiente",
  "Controle de sinais vitais",
  "Cuidados com sonda/ostomia",
  "Cuidados paliativos",
  "Cuidados com Alzheimer/demência",
] as const;

export const AVAILABILITY_OPTIONS = [
  "Diarista (segunda a sexta)",
  "Fixo (mensalista)",
  "12x36",
  "Noturno",
  "Fins de semana",
  "Plantão",
  "Viagens",
  "Pernoite",
] as const;

export const EXPERIENCE_TYPE_OPTIONS = [
  "Domicílio",
  "Hospital",
  "ILPI (Instituição de Longa Permanência)",
] as const;

export const TASK_OPTIONS = [
  "Banho e higiene",
  "Alimentação",
  "Medicação",
  "Acompanhamento médico",
  "Companhia",
  "Exercícios",
  "Curativos",
  "Locomoção",
  "Organização",
  "Cuidados noturnos",
] as const;

export const REPORT_REASONS = [
  { value: "perfil_falso", label: "Perfil falso" },
  { value: "conduta_inadequada", label: "Conduta inadequada" },
  { value: "golpe", label: "Golpe / Fraude" },
  { value: "outros", label: "Outros" },
] as const;

export const DEPENDENCY_LEVELS = [
  { value: "leve", label: "Leve" },
  { value: "moderado", label: "Moderado" },
  { value: "alto", label: "Alto" },
] as const;

// Votuporanga-SP center coordinates
export const DEFAULT_CENTER = { lat: -20.4228, lng: -49.9726 };
export const MAX_RADIUS_KM = 50;
