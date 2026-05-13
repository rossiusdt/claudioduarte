import { MapPin, ExternalLink } from 'lucide-react';

export default function EventLocation() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Local</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">CLUBE ATLÉTICO ARAÇAMAN</h3>
          <div className="text-gray-600 space-y-1">
            <p>Santo André, SP</p>
          </div>
        </div>

        <button className="flex items-center gap-2 text-[#3d0f0f] hover:text-[#5a1515] font-semibold border border-[#3d0f0f] hover:border-[#5a1515] px-4 py-2 rounded-full transition-colors">
          <MapPin className="w-4 h-4" />
          VER NO MAPA
        </button>

        <div className="pt-6 border-t">
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#" className="text-[#3d0f0f] hover:text-[#5a1515] flex items-center gap-1">
              Termos e políticas
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="text-[#3d0f0f] hover:text-[#5a1515] flex items-center gap-1">
              Denunciar este evento
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
