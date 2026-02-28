export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

export const validateAge = (age: number): boolean => {
  return age >= 18 && age <= 120;
};

export const validateExperience = (years: number): boolean => {
  return years >= 0 && years <= 50;
};

export const validateBio = (bio: string): boolean => {
  return bio.length >= 10 && bio.length <= 2000;
};

export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100;
};

export const validateServiceRadius = (radius: number): boolean => {
  return radius >= 1 && radius <= 100;
};

export const getValidationError = (field: string, value: any): string | null => {
  switch (field) {
    case "email":
      return !validateEmail(value) ? "E-mail inválido" : null;
    case "phone":
      return !validatePhone(value) ? "Telefone inválido (mínimo 10 dígitos)" : null;
    case "age":
      return !validateAge(value) ? "Idade deve estar entre 18 e 120 anos" : null;
    case "experience":
      return !validateExperience(value) ? "Experiência deve estar entre 0 e 50 anos" : null;
    case "bio":
      return !validateBio(value) ? "Bio deve ter entre 10 e 2000 caracteres" : null;
    case "name":
      return !validateName(value) ? "Nome deve ter entre 2 e 100 caracteres" : null;
    case "serviceRadius":
      return !validateServiceRadius(value) ? "Raio deve estar entre 1 e 100 km" : null;
    default:
      return null;
  }
};
