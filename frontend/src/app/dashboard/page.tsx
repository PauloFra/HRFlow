import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - HRFlow',
  description: 'Painel de controle do HRFlow',
};

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Bem-vindo(a), Usuário</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Actions Cards */}
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-medium">Ponto Eletrônico</h3>
          <p className="mb-4 text-sm text-muted-foreground">Registre seu ponto de entrada e saída</p>
          <Link href="/time-tracking" className="btn btn-primary btn-sm w-full">
            Registrar Ponto
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-medium">Solicitações</h3>
          <p className="mb-4 text-sm text-muted-foreground">Férias, licenças e abonos</p>
          <Link href="/leaves" className="btn btn-primary btn-sm w-full">
            Nova Solicitação
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-medium">Comunicados</h3>
          <p className="mb-4 text-sm text-muted-foreground">Notícias e eventos da empresa</p>
          <Link href="/news" className="btn btn-primary btn-sm w-full">
            Ver Comunicados
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-medium">Equipe</h3>
          <p className="mb-4 text-sm text-muted-foreground">Gerenciar funcionários</p>
          <Link href="/employees" className="btn btn-primary btn-sm w-full">
            Ver Equipe
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Próximos Eventos</h2>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="text-center text-muted-foreground">
            Nenhum evento programado para os próximos dias.
          </div>
        </div>
      </div>
    </div>
  );
} 