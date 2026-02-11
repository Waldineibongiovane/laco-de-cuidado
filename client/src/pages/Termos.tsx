import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Termos() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container py-8 flex-1">
        <div className="max-w-3xl mx-auto prose prose-sm">
          <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Termos de Uso
          </h1>
          <p className="text-sm text-muted-foreground mb-2">Última atualização: Fevereiro de 2026</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">1. Aceitação dos Termos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ao acessar e utilizar a plataforma Laço de Cuidado, você concorda com estes Termos de Uso.
            Se não concordar com qualquer parte destes termos, não utilize a plataforma.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">2. Descrição do Serviço</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Laço de Cuidado é uma plataforma gratuita de intermediação que conecta famílias que buscam
            cuidadores de idosos e acompanhantes hospitalares a profissionais que oferecem esses serviços
            na região de Votuporanga-SP e arredores (raio de até 50 km).
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">3. Isenção de Responsabilidade</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A plataforma atua exclusivamente como intermediadora. <strong>Não nos responsabilizamos por:</strong>
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Qualidade dos serviços prestados pelos cuidadores</li>
            <li>Veracidade das informações fornecidas pelos usuários</li>
            <li>Verificação de documentos, identidade ou antecedentes</li>
            <li>Negociações financeiras entre famílias e cuidadores</li>
            <li>Danos ou prejuízos decorrentes da contratação</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">4. Responsabilidades do Usuário</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O usuário se compromete a fornecer informações verdadeiras, manter seus dados atualizados,
            não utilizar a plataforma para fins ilícitos e verificar referências e documentos dos
            cuidadores antes de qualquer contratação.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">5. Cadastro e Conta</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O cadastro é gratuito e realizado através de autenticação OAuth. O usuário é responsável
            pela segurança de sua conta. A plataforma reserva-se o direito de suspender ou bloquear
            contas que violem estes termos.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">6. Conteúdo do Usuário</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ao publicar informações na plataforma (perfil, avaliações, denúncias), o usuário concede
            ao Laço de Cuidado uma licença não exclusiva para exibir esse conteúdo. A plataforma pode
            remover conteúdo que viole estes termos ou seja considerado inadequado.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">7. Avaliações e Denúncias</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            As avaliações devem refletir experiências reais. Avaliações falsas ou difamatórias podem
            resultar em bloqueio da conta. Denúncias serão analisadas pela equipe de moderação.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">8. Alterações nos Termos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reservamo-nos o direito de alterar estes termos a qualquer momento. As alterações entram
            em vigor imediatamente após a publicação. O uso continuado da plataforma após alterações
            constitui aceitação dos novos termos.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">9. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para dúvidas sobre estes termos, entre em contato através da plataforma.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
