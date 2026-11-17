import React from 'react'
import { BelugaLogo } from './BelugaLogo'

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Captura exceções de render (e de ciclo de vida) que derrubariam a árvore
 * React e deixariam a tela em branco. Em vez disso, mostra uma mensagem clara
 * com a possibilidade de recarregar o app.
 */
export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Beluga] Erro de render capturado:', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center gap-4">
          <BelugaLogo size="lg" />
          <h1 className="text-xl font-bold text-[#0B3D5C]">Algo deu errado</h1>
          <p className="text-xs text-[#5B6B78] max-w-sm">
            Ocorreu um erro inesperado ao carregar esta tela. Tente recarregar a página — se
            persistir, saia e faça login novamente.
          </p>
          <pre className="text-[10px] text-[#5B6B78] bg-white border border-[#EDF1F4] rounded-lg p-3 max-w-md overflow-auto whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="h-10 px-6 rounded-xl bg-[#1CA0D8] text-white text-sm font-semibold hover:bg-[#158bbd] transition-colors"
          >
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
