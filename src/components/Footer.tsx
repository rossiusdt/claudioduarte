import { Shield, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">

          {/* Coluna esquerda — Segurança */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Compre com total segurança</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Os dados sensíveis são criptografados e<br className="hidden sm:block" />
              não serão salvos em nossos servidores.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Google Safe Browsing */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-[#3d0f0f] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] font-bold text-gray-800">Google</p>
                  <p className="text-[10px] text-gray-500">Safe Browsing</p>
                </div>
              </div>

              {/* PCI DSS */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <div className="bg-[#1c3f6e] rounded px-2 py-1 flex-shrink-0">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[11px] font-black text-white tracking-tight">PCI</span>
                    <span className="text-[8px] font-bold text-[#f5a623]">/DSS</span>
                  </div>
                  <p className="text-[7px] text-blue-200 font-semibold tracking-widest uppercase text-center">Compliant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita — Ajuda */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Precisando de ajuda?</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Acessa a nossa{' '}
              <a
                href="https://sympla.com.br/ajuda"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3d0f0f] hover:underline"
              >
                Central de Ajuda
              </a>{' '}
              Sympla ou Fale com o produtor.
            </p>

            <a
              href="mailto:contato@modasememoriasevento.com.br"
              className="inline-flex items-center gap-2 border-2 border-[#3d0f0f] text-[#3d0f0f] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Fale com o produtor
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Pier Rock Festival. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Vendas via</span>
            <img src="/sympla-logo.png" alt="Sympla" className="h-4 ml-1 opacity-60" />
          </div>
        </div>
      </div>
    </footer>
  );
}
