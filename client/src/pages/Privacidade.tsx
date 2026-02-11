import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacidade() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container py-8 flex-1">
        <div className="max-w-3xl mx-auto prose prose-sm">
          <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Política de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground mb-2">Última atualização: Fevereiro de 2026</p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta Política de Privacidade descreve como o Laço de Cuidado coleta, usa e protege suas
            informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">1. Dados Coletados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Coletamos os seguintes dados:</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Dados de cadastro:</strong> nome, e-mail (via autenticação OAuth)</li>
            <li><strong>Dados de perfil (cuidadores):</strong> nome, idade, cidade, bairro, telefone, e-mail público, foto, bio, serviços, disponibilidade, experiência, localização geográfica</li>
            <li><strong>Dados de vaga (famílias):</strong> idade do idoso, condições de saúde, tarefas, localização</li>
            <li><strong>Dados de uso:</strong> avaliações, denúncias, interações com a plataforma</li>
            <li><strong>Cookies:</strong> para manter sua sessão e preferências</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">2. Finalidade do Tratamento</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Seus dados são utilizados para:</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Permitir o funcionamento da plataforma de intermediação</li>
            <li>Exibir perfis de cuidadores para famílias interessadas</li>
            <li>Possibilitar avaliações e denúncias</li>
            <li>Moderação e segurança da plataforma</li>
            <li>Melhorias no serviço</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">3. Base Legal</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O tratamento de dados é realizado com base no consentimento do titular (Art. 7º, I da LGPD)
            e na execução de contrato (Art. 7º, V da LGPD).
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">4. Compartilhamento de Dados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Os dados de perfil dos cuidadores (nome, cidade, serviços, avaliações) são públicos na plataforma.
            Dados de contato (telefone, e-mail) são exibidos apenas para famílias autenticadas quando o
            cuidador está disponível. Não compartilhamos dados com terceiros para fins comerciais.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">5. Armazenamento e Segurança</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Os dados são armazenados em servidores seguros com criptografia. Adotamos medidas técnicas
            e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">6. Direitos do Titular</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Conforme a LGPD, você tem direito a:
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Confirmar a existência de tratamento de dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a eliminação de dados desnecessários</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">7. Cookies</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Utilizamos cookies essenciais para manter sua sessão de login e cookies de análise para
            entender o uso da plataforma. Você pode gerenciar suas preferências de cookies através
            do banner exibido no primeiro acesso.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">8. Alterações</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas
            através da plataforma.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-2">9. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato
            através da plataforma.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
