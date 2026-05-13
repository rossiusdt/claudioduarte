import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart2, Users, ShoppingCart, Eye, TrendingUp, RefreshCw, DollarSign, MousePointerClick, Copy, AlertCircle } from 'lucide-react';

interface AnalyticsEvent {
  id: string;
  event: string;
  data: Record<string, unknown>;
  session_id: string;
  created_at: string;
}

interface Stats {
  pageViews: number;
  uniqueSessions: number;
  checkoutOpens: number;
  pixGenerated: number;
  pixCopied: number;
  paymentSuccess: number;
  paymentError: number;
  ticketAdds: number;
  totalRevenue: number;
  recentEvents: AnalyticsEvent[];
}

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Visualização de página',
  ticket_add: 'Ingresso adicionado',
  ticket_remove: 'Ingresso removido',
  checkout_open: 'Checkout aberto',
  pix_generated: 'Pix gerado',
  pix_copied: 'Pix copiado',
  payment_success: 'Pagamento confirmado',
  payment_error: 'Erro no pagamento',
};

const EVENT_COLORS: Record<string, string> = {
  page_view: 'bg-blue-100 text-blue-700',
  ticket_add: 'bg-amber-100 text-amber-700',
  ticket_remove: 'bg-orange-100 text-orange-700',
  checkout_open: 'bg-yellow-100 text-yellow-700',
  pix_generated: 'bg-emerald-100 text-emerald-700',
  pix_copied: 'bg-teal-100 text-teal-700',
  payment_success: 'bg-green-100 text-green-700',
  payment_error: 'bg-red-100 text-red-700',
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(iso));
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filterDays, setFilterDays] = useState(7);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const since = new Date();
      since.setDate(since.getDate() - filterDays);

      const { data, error: err } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (err) throw err;

      const events: AnalyticsEvent[] = data ?? [];

      const sessionSet = new Set(events.map(e => e.session_id).filter(Boolean));
      const pageViews = events.filter(e => e.event === 'page_view').length;
      const uniqueSessions = sessionSet.size;
      const checkoutOpens = events.filter(e => e.event === 'checkout_open').length;
      const pixGenerated = events.filter(e => e.event === 'pix_generated').length;
      const pixCopied = events.filter(e => e.event === 'pix_copied').length;
      const paymentSuccess = events.filter(e => e.event === 'payment_success').length;
      const paymentError = events.filter(e => e.event === 'payment_error').length;
      const ticketAdds = events.filter(e => e.event === 'ticket_add').length;

      const totalRevenue = events
        .filter(e => e.event === 'payment_success')
        .reduce((sum, e) => sum + ((e.data?.total as number) ?? 0), 0);

      setStats({
        pageViews,
        uniqueSessions,
        checkoutOpens,
        pixGenerated,
        pixCopied,
        paymentSuccess,
        paymentError,
        ticketAdds,
        totalRevenue,
        recentEvents: events.slice(0, 50),
      });
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [filterDays]);

  useEffect(() => { loadStats(); }, [loadStats]);

  // auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(loadStats, 30_000);
    return () => clearInterval(t);
  }, [loadStats]);

  const conversionRate = stats && stats.pageViews > 0
    ? ((stats.paymentSuccess / stats.pageViews) * 100).toFixed(1)
    : '0.0';

  const checkoutRate = stats && stats.checkoutOpens > 0
    ? ((stats.paymentSuccess / stats.checkoutOpens) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#f8f4ee]">
      {/* Header */}
      <header className="bg-[#3b2a1a] text-[#f5e9d0] px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-[#d4a855]" />
            <div>
              <h1 className="text-lg font-bold">Painel Administrativo</h1>
              <p className="text-xs text-[#d4a855]">Modas &amp; Memórias — Almir Sater e Sérgio Reis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#f5e9d0]/60">
              Atualizado: {formatDate(lastRefresh.toISOString())}
            </span>
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-2 bg-[#5c3d20] hover:bg-[#4a3218] text-[#f5e9d0] px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Período:</span>
          {[1, 7, 30].map(d => (
            <button
              key={d}
              onClick={() => setFilterDays(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterDays === d
                  ? 'bg-[#5c3d20] text-[#f5e9d0]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#d4a855]'
              }`}
            >
              {d === 1 ? 'Hoje' : d === 7 ? '7 dias' : '30 dias'}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && !stats && (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-8 h-8 animate-spin text-[#5c3d20]" />
          </div>
        )}

        {stats && (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Eye}
                label="Visualizações"
                value={stats.pageViews}
                sub={`${stats.uniqueSessions} sessões únicas`}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                icon={MousePointerClick}
                label="Ingressos adicionados"
                value={stats.ticketAdds}
                color="bg-amber-100 text-amber-600"
              />
              <StatCard
                icon={ShoppingCart}
                label="Checkouts abertos"
                value={stats.checkoutOpens}
                sub={`${checkoutRate}% converteram`}
                color="bg-yellow-100 text-yellow-600"
              />
              <StatCard
                icon={DollarSign}
                label="Receita confirmada"
                value={formatCurrency(stats.totalRevenue)}
                sub={`${stats.paymentSuccess} pagamentos`}
                color="bg-green-100 text-green-600"
              />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={TrendingUp}
                label="Taxa de conversão"
                value={`${conversionRate}%`}
                sub="visitas → pagamentos"
                color="bg-emerald-100 text-emerald-600"
              />
              <StatCard
                icon={Users}
                label="Pix gerados"
                value={stats.pixGenerated}
                color="bg-teal-100 text-teal-600"
              />
              <StatCard
                icon={Copy}
                label="Pix copiados"
                value={stats.pixCopied}
                color="bg-cyan-100 text-cyan-600"
              />
              <StatCard
                icon={AlertCircle}
                label="Erros de pagamento"
                value={stats.paymentError}
                color="bg-red-100 text-red-600"
              />
            </div>

            {/* Funnel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Funil de conversão</h2>
              <div className="space-y-3">
                {[
                  { label: 'Visitantes (page_view)', value: stats.pageViews, max: stats.pageViews, color: 'bg-blue-400' },
                  { label: 'Adicionaram ingresso', value: stats.ticketAdds, max: stats.pageViews, color: 'bg-amber-400' },
                  { label: 'Abriram checkout', value: stats.checkoutOpens, max: stats.pageViews, color: 'bg-yellow-400' },
                  { label: 'Geraram Pix', value: stats.pixGenerated, max: stats.pageViews, color: 'bg-teal-400' },
                  { label: 'Pagamento confirmado', value: stats.paymentSuccess, max: stats.pageViews, color: 'bg-green-500' },
                ].map(({ label, value, max, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{ width: max > 0 ? `${Math.min(100, (value / max) * 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent events table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Eventos recentes</h2>
                <p className="text-sm text-gray-500 mt-0.5">Últimos 50 eventos do período selecionado</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Evento</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Dados</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Sessão</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Data/hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recentEvents.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                          Nenhum evento registrado no período
                        </td>
                      </tr>
                    )}
                    {stats.recentEvents.map(ev => (
                      <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EVENT_COLORS[ev.event] ?? 'bg-gray-100 text-gray-700'}`}>
                            {EVENT_LABELS[ev.event] ?? ev.event}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-600 max-w-xs">
                          {Object.keys(ev.data ?? {}).length > 0 ? (
                            <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100 block truncate">
                              {JSON.stringify(ev.data)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-400 font-mono text-xs">
                          {ev.session_id ? ev.session_id.slice(-8) : '—'}
                        </td>
                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(ev.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
