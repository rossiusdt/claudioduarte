import { MapPin, Star, X } from 'lucide-react';

export const PREMIUM_TABLES = [1, 2, 3, 4, 5]; // Fileira A — mais próxima do palco
export const SOLD_TABLES = [2, 4, 8, 12, 14, 19, 23]; // Mesas já vendidas
export const PREMIUM_PRICE = 679.00;
export const STANDARD_PRICE = 497.79;

interface TableMapProps {
  selectedTable: number | null;
  onSelect: (table: number) => void;
}

const COLS = 5;
const ROWS = 5;

function tableNumber(row: number, col: number) {
  return row * COLS + col + 1;
}

function rowLabel(row: number) {
  const labels = ['E', 'D', 'C', 'B', 'A'];
  return labels[row];
}

export default function TableMap({ selectedTable, onSelect }: TableMapProps) {
  return (
    <div className="mt-4 border border-amber-200 rounded-xl overflow-hidden bg-[#fdf8f0]">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-[#5c3d20]" />
          <p className="text-sm font-semibold text-[#3b2a1a]">Escolha sua mesa</p>
        </div>

        {/* Stage */}
        <div className="flex justify-center mb-4">
          <div className="relative bg-gradient-to-b from-[#3b2a1a] to-[#5c3d20] text-[#f5e9d0] text-xs font-bold tracking-widest uppercase px-10 py-2.5 rounded-lg shadow-md w-full max-w-[220px] text-center">
            <span className="opacity-90">Palco</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#5c3d20] rotate-45" />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center mb-3">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-px h-3 bg-gray-300" />
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-300" />
          </div>
        </div>

        {/* Table grid */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const num = tableNumber(row, col);
              const isSelected = selectedTable === num;
              const isPremium = PREMIUM_TABLES.includes(num);
              const isSold = SOLD_TABLES.includes(num);

              if (isSold) {
                return (
                  <div
                    key={num}
                    title={`Mesa ${num} — Esgotada`}
                    className="relative aspect-square rounded-lg border-2 border-red-300 bg-red-100 flex flex-col items-center justify-center cursor-not-allowed"
                  >
                    <X className="w-3.5 h-3.5 text-red-400 absolute top-1 right-1" />
                    <span className="text-xs font-bold text-red-400 leading-none">{num}</span>
                    <span className="text-[9px] mt-0.5 font-normal text-red-300">
                      {rowLabel(row)}
                    </span>
                  </div>
                );
              }

              const idleClass = isPremium
                ? 'bg-amber-300 border-amber-400 hover:bg-amber-400 text-amber-900'
                : row === 1
                ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-gray-700'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700';

              return (
                <button
                  key={num}
                  onClick={() => onSelect(num)}
                  title={`Mesa ${num} — Fileira ${rowLabel(row)} — ${isPremium ? 'R$ 679,00' : 'R$ 497,79'}`}
                  className={`
                    relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                    transition-all duration-150 text-xs font-bold shadow-sm
                    ${isSelected
                      ? 'bg-[#5c3d20] border-[#3b2a1a] text-[#f5e9d0] scale-105 shadow-md ring-2 ring-[#d4a855] ring-offset-1'
                      : idleClass
                    }
                  `}
                >
                  {isPremium && !isSelected && (
                    <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-600 absolute top-1 right-1" />
                  )}
                  <span className="leading-none">{num}</span>
                  <span className={`text-[9px] mt-0.5 font-normal ${isSelected ? 'text-[#f5e9d0]/70' : isPremium ? 'text-amber-700' : 'text-gray-400'}`}>
                    {rowLabel(row)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-100">
          <div className="flex items-center gap-2 flex-wrap text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-300 border border-amber-400 inline-block" />
              Premium — R$ 679,00
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block" />
              Padrão — R$ 497,79
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
              Esgotada
            </span>
          </div>
          {selectedTable && (
            <span className="text-xs font-semibold text-[#5c3d20] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
              Mesa {selectedTable}
            </span>
          )}
        </div>
      </div>

      {!selectedTable && (
        <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100">
          <p className="text-xs text-amber-700 text-center font-medium">
            Selecione uma mesa para continuar
          </p>
        </div>
      )}
    </div>
  );
}
