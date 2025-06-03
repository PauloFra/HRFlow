import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  // In a real app, you'd check for authentication here
  // and redirect authenticated users to the dashboard
  // const isAuthenticated = /* check auth status */;
  // if (isAuthenticated) {
  //   redirect('/dashboard');
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">HRFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="btn btn-primary btn-md"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Sistema completo de gestão de RH <br className="hidden sm:inline" />
              para sua empresa
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Gerencie ponto, férias, comunicações e toda a gestão de funcionários 
              em uma plataforma completa e integrada.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="btn btn-primary btn-lg"
            >
              Acessar Plataforma
            </Link>
            <Link
              href="#features"
              className="btn btn-outline btn-lg"
            >
              Conheça os Recursos
            </Link>
          </div>
        </section>
        <section id="features" className="container py-12">
          <h2 className="mb-8 text-center text-2xl font-bold">Funcionalidades</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg border border-border bg-background p-6">
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-muted py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HRFlow. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: '⏰ Ponto Eletrônico',
    description: 'Registro de ponto com geolocalização e validação automática de jornada.',
  },
  {
    title: '📢 Comunicação Interna',
    description: 'Feed de notícias e comunicados com sistema de aprovações.',
  },
  {
    title: '👥 Gestão de Funcionários',
    description: 'Cadastro completo, hierarquia e controle de acesso baseado em papéis.',
  },
  {
    title: '🏖️ Gestão de Férias',
    description: 'Solicitação, aprovação e acompanhamento de férias e licenças.',
  },
  {
    title: '📊 Relatórios e Dashboard',
    description: 'Visualização em tempo real e relatórios gerenciais customizáveis.',
  },
  {
    title: '🔐 Autenticação Segura',
    description: 'Sistema robusto com JWT e autenticação de dois fatores.',
  },
]; 