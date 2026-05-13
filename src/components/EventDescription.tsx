export default function EventDescription() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição do evento</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            Uma noite de muito humor, verdades e reflexões que podem transformar a sua forma de ver a vida e os relacionamentos.
          </p>
          <p>
            Se você já ouviu o Cláudio Duarte, sabe exatamente do que estamos falando.
            Se ainda não… essa é a oportunidade.
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Mapa do Evento</h3>
          <img
            src="/mapavento.png"
            alt="Mapa do evento — setores e cadeiras"
            className="w-full max-w-sm mx-auto rounded-xl shadow-md border border-gray-100"
          />
        </div>
      </section>
    </div>
  );
}
