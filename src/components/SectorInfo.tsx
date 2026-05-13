import { Ticket, Star } from 'lucide-react';

export default function SectorInfo() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Opções de Ingresso</h2>

      <div className="space-y-6">
        {/* PASSAPORTE ALL-INCLUSIVE */}
        <div className="border-2 border-[#0d5c54] rounded-lg p-6 bg-gradient-to-br from-teal-50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#0d5c54] rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">PASSAPORTE ALL-INCLUSIVE</h3>
          </div>

          <p className="text-lg font-semibold text-[#0d5c54] mb-3">
            A experiência completa do Réveillon Arcanjos 2027.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            Acesso a todos os dias do evento — de 28 de dezembro a 1 de janeiro — sem precisar se preocupar com mais nada. O pacote mais vantajoso para quem quer aproveitar tudo.
          </p>

          <div className="bg-gradient-to-r from-[#5ee8d8]/20 to-[#0d5c54]/10 border-2 border-[#0d5c54]/40 rounded-lg p-5">
            <p className="text-xl font-bold text-[#0d5c54] mb-1">R$ 990,97</p>
            <p className="text-gray-700 text-sm">Acesso DIA e NOITE, todos os dias, de 28 de dezembro a 1 de janeiro.</p>
          </div>
        </div>

        {/* FESTA ÚNICA */}
        <div className="border-2 border-[#5ee8d8] rounded-lg p-6 bg-gradient-to-br from-teal-50/50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#5ee8d8] rounded-lg">
              <Ticket className="w-6 h-6 text-[#0a3d38]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">FESTA ÚNICA</h3>
          </div>

          <p className="text-lg font-semibold text-[#0d5c54] mb-3">
            Escolha exatamente o dia e período que você quer curtir.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            Selecione um dia entre 28 de dezembro e 1 de janeiro e opte pelo período DIA ou NOITE. Ideal para quem quer participar em uma ocasião específica.
          </p>

          <div className="bg-white/80 rounded-lg p-4 border border-teal-100">
            <p className="font-semibold text-gray-900 mb-2">Como funciona:</p>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>• Escolha um dia: 28, 29, 30, 31 de dezembro ou 1 de janeiro</li>
              <li>• Escolha o período: DIA ou NOITE</li>
              <li>• R$ 297,97 por ingresso</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
