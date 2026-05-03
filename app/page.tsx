import { FilterPanel } from "@/components/FilterPanel"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="border-b border-[#2e2e2e] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#c9a84c] glow-gold tracking-wide">
              WICKED BUILD OPTIMIZER
            </h1>
            <p className="text-xs text-[#7a7268] mt-0.5">No Rest for the Wicked</p>
          </div>
          <a
            href="https://www.norestforthewicked.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#7a7268] hover:text-[#c9a84c] transition-colors"
          >
            norestforthewicked.gg ↗
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 lg:px-6">
        <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-8">

          {/* Sidebar com filtros (desktop) */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-[#e8e0d0] uppercase tracking-widest">
                  Montar Build
                </h2>
                <p className="text-xs text-[#7a7268] mt-1">
                  Selecione seu estilo de jogo e receba até 5 builds completas.
                </p>
              </div>
              <div className="divider-gold mb-5" />
              <FilterPanel />
            </div>
          </aside>

          {/* Área principal — conteúdo quando não há busca */}
          <section className="hidden lg:flex flex-col items-center justify-center text-center py-16">
            <div className="space-y-4 max-w-sm">
              <div className="text-4xl">⚔</div>
              <h2 className="text-xl font-semibold text-[#e8e0d0]">
                Encontre sua build ideal
              </h2>
              <p className="text-sm text-[#7a7268] leading-relaxed">
                Selecione o tipo de arma ao lado e clique em{" "}
                <span className="text-[#c9a84c]">Encontrar Builds</span> para
                receber recomendações completas e explicadas.
              </p>
              <div className="divider-gold" />
              <p className="text-xs text-[#4a4540]">
                Sem login. Sem custo. Open source.
              </p>
            </div>
          </section>

          {/* Filtros mobile (abaixo do header) */}
          <section className="lg:hidden mt-4">
            <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-5">
              <h2 className="text-sm font-semibold text-[#e8e0d0] uppercase tracking-widest mb-4">
                Montar Build
              </h2>
              <FilterPanel />
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2e2e2e] px-6 py-4 text-center">
        <p className="text-xs text-[#4a4540]">
          Dados:{" "}
          <a href="https://www.norestforthewicked.gg" target="_blank" rel="noopener noreferrer"
             className="hover:text-[#7a7268] transition-colors">
            norestforthewicked.gg
          </a>
          {" · "}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             className="hover:text-[#7a7268] transition-colors">
            Código aberto no GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
