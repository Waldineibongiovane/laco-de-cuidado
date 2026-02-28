# Laço de Cuidado - TODO

## Banco de Dados
- [x] Schema completo (users, caregiver_profiles, family_jobs, reviews, reports)
- [x] Migrations rodadas com pnpm db:push

## Backend (tRPC Routers)
- [x] Router de perfil de cuidador (CRUD completo)
- [x] Router de vagas de família (CRUD, limite 1 ativa)
- [x] Router de busca de cuidadores (filtros, ordenação, distância)
- [x] Router de avaliações (criar, listar)
- [x] Router de denúncias (criar, listar, alterar status)
- [x] Router admin (listar usuários, bloquear/desbloquear, gerenciar denúncias)
- [x] Upload de foto do cuidador via S3

## Frontend - Layout e Navegação
- [x] Design system (cores, fontes, tema claro acolhedor)
- [x] Layout base com header/footer responsivo
- [x] Navegação mobile-first com menu hambúrguer

## Frontend - Páginas Públicas
- [x] Home (/) com CTA, como funciona, aviso intermediador
- [x] Buscar cuidadores (/buscar) com filtros e lista de cards
- [x] Integração Google Maps na busca
- [x] Perfil do cuidador (/cuidador/:id) com dados completos

## Frontend - Páginas Autenticadas
- [x] Seleção de papel (cuidador/família) após primeiro login
- [x] Minha Conta (/minha-conta) - Cuidador: editar perfil, disponibilidade, foto
- [x] Minha Conta (/minha-conta) - Família: editar vaga, ver avaliações enviadas
- [x] Criar/Editar vaga (/vaga) - apenas família logada

## Frontend - Funcionalidades
- [x] Botão contato WhatsApp/telefone/email (só família logada + cuidador disponível)
- [x] Sistema de avaliações (nota 1-5 + comentário + "Contratei este cuidador")
- [x] Sistema de denúncias (motivos pré-definidos)
- [x] Banner de cookies/consentimento LGPD

## Frontend - Admin
- [x] Painel admin (/admin) com lista de usuários
- [x] Gerenciamento de denúncias (open/reviewed/closed)
- [x] Bloquear/desbloquear usuários

## Frontend - Páginas Estáticas
- [x] Termos de uso (/termos)
- [x] Política de privacidade (/privacidade)

## Melhorias Implementadas (V2)
- [x] Login de admin com usuário/senha (bcryptjs)
- [x] Tabela admin_credentials no banco de dados
- [x] Ranking de cuidadores por avaliação (getTopCaregiversByRating)
- [x] Componente TopCaregiversRanking na Home
- [x] Validações de entrada (email, telefone, idade, experiência, bio, nome, raio)
- [x] Componente EmptyState para melhor UX
- [x] Componente CaregiverCardSkeleton para loading
- [x] Página AdminLogin (/admin-login) com setup de credenciais
- [x] Link Admin no footer

## Testes
- [x] Testes vitest para routers principais (23 testes passando)
- [x] Testes para admin login (10 testes passando)
- [x] Total: 33 testes passando
