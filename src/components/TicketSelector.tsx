import { useState } from 'react';
import { BadgeCheck, Minus, Plus } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import { track } from '../lib/analytics';

const TICKETS = [
  {
    id: 'bronze',
    label: 'CADEIRA BRONZE',
    badge: 'Solidário',
    price: 7700,
    display: 'R$ 77,00',
    hasQuantity: true,
  },
  {
    id: 'prata',
    label: 'CADEIRA PRATA',
    badge: 'Solidário',
    price: 11700,
    display: 'R$ 117,00',
    hasQuantity: true,
  },
  {
    id: 'ouro',
    label: 'CADEIRA OURO',
    badge: 'Solidário',
    price: 14700,
    display: 'R$ 147,00',
    hasQuantity: true,
  },
  {
    id: 'camarote',
    label: 'CAMAROTE PARA 10 PESSOAS',
    badge: null,
    price: 91700,
    display: 'R$ 917,00',
    hasQuantity: false,
  },
] as const;

type TicketId = typeof TICKETS[number]['id'];

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export default function TicketSelector() {
  const [selected, setSelected] = useState<TicketId | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({ bronze: 1, prata: 1, ouro: 1 });
  const [modalOpen, setModalOpen] = useState(false);

  const selectedTicket = TICKETS.find(t => t.id === selected) ?? null;
  const qty = selected && selectedTicket?.hasQuantity ? (quantities[selected] ?? 1) : 1;
  const totalAmount = selectedTicket ? selectedTicket.price * qty : 0;

  const changeQty = (id: string, delta: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, Math.min(20, (prev[id] ?? 1) + delta)) }));
  };

  const pixItems = selectedTicket
    ? [{ title: `${selectedTicket.label} — Cláudio Duarte - Santo André`, unitPrice: selectedTicket.price, quantity: qty }]
    : [];

  const selectedSummary = selectedTicket
    ? qty > 1
      ? `${selectedTicket.label} × ${qty}`
      : selectedTicket.label
    : '';

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
        <p className="text-gray-700 font-medium mb-4">Escolha uma opção</p>

        <div className="space-y-3 mb-6">
          {TICKETS.map(ticket => {
            const isSelected = selected === ticket.id;
            const ticketQty = ticket.hasQuantity ? (quantities[ticket.id] ?? 1) : 1;

            return (
              <div key={ticket.id}>
                <button
                  onClick={() => setSelected(isSelected ? null : ticket.id)}
                  className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                    isSelected
                      ? 'border-[#3d0f0f] bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      {ticket.badge && (
                        <span className="text-xs font-bold text-white bg-[#3d0f0f] px-2 py-0.5 rounded-full uppercase tracking-wide mb-1 inline-block">
                          {ticket.badge}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 text-sm">{ticket.label}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-gray-900">{ticket.display}</p>
                      <p className="text-xs text-gray-400">por pessoa</p>
                    </div>
                  </div>
                </button>

                {isSelected && ticket.hasQuantity && (
                  <div className="border-x-2 border-b-2 border-[#3d0f0f] rounded-b-xl bg-red-50 px-4 py-3 flex items-center justify-between -mt-1">
                    <span className="text-sm font-medium text-gray-700">Quantidade</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => changeQty(ticket.id, -1)}
                        disabled={ticketQty <= 1}
                        className="w-8 h-8 rounded-full border-2 border-[#3d0f0f] flex items-center justify-center text-[#3d0f0f] hover:bg-[#3d0f0f] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-gray-900">{ticketQty}</span>
                      <button
                        onClick={() => changeQty(ticket.id, 1)}
                        disabled={ticketQty >= 20}
                        className="w-8 h-8 rounded-full border-2 border-[#3d0f0f] flex items-center justify-center text-[#3d0f0f] hover:bg-[#3d0f0f] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[#3d0f0f]">{formatCurrency(ticket.price * ticketQty)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            if (!selectedTicket) return;
            setModalOpen(true);
            track('checkout_open', { summary: selectedSummary, total: totalAmount });
          }}
          disabled={!selectedTicket}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-colors"
        >
          {selectedTicket ? `Finalizar Compra — ${formatCurrency(totalAmount)}` : 'Selecione um Ingresso'}
        </button>

        <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <BadgeCheck className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-bold text-green-800 leading-tight">Reembolso garantido</p>
            <p className="text-xs text-green-700 mt-0.5 leading-snug">
              Em caso de desistência, seu dinheiro será devolvido integralmente.
            </p>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <CheckoutModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedSummary={selectedSummary}
          items={pixItems}
          totalAmount={totalAmount}
        />
      )}
    </>
  );
}
