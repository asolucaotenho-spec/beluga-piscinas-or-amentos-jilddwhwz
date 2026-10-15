/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.warn('Rota não encontrada:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-[#EDF1F4] shadow-sm space-y-3">
        <h1 className="text-4xl font-black text-[#0B3D5C]">404</h1>
        <p className="text-base font-bold text-[#142A36]">Página não encontrada</p>
        <p className="text-xs text-[#5B6B78]">O endereço acessado não existe ou foi movido.</p>
        <div className="pt-2">
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#0B3D5C] hover:bg-[#125B7C] text-white text-xs font-bold transition-colors shadow-sm"
          >
            Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  )
}

export default NotFound
