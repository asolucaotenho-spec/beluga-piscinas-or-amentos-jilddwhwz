import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  FilePlus,
  FileText,
  Layers,
  Sparkles,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { BelugaLogo } from './BelugaLogo'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      to: '/budgets/new',
      label: 'Novo Orçamento',
      icon: FilePlus,
      primary: true,
    },
    {
      to: '/budgets',
      label: 'Meus Orçamentos',
      icon: FileText,
    },
    {
      to: '/models',
      label: 'Modelos de Piscinas',
      icon: Layers,
    },
    {
      to: '/products',
      label: 'Produtos e Opcionais',
      icon: Sparkles,
    },
    {
      to: '/clients',
      label: 'Clientes',
      icon: Users,
    },
    ...(isAdmin
      ? [
          {
            to: '/settings',
            label: 'Configurações',
            icon: Settings,
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#142A36] flex flex-col md:flex-row antialiased">
      {/* Top bar móvel */}
      <header className="md:hidden h-16 bg-[#0B3D5C] text-white px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <NavLink to="/" className="flex items-center gap-2">
          <BelugaLogo variant="white" size="sm" />
        </NavLink>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-[#125B7C]"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Drawer móvel */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-[280px] h-full bg-[#0B3D5C] text-white p-5 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="pb-6 mb-6 border-b border-[#1A5072] flex items-center justify-between">
                <BelugaLogo variant="white" size="md" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-white/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 px-3 py-2.5 rounded-lg bg-[#08293E] text-xs">
                <div className="text-white/60">Conectado como</div>
                <div className="font-semibold text-white truncate">{user?.name || user?.email}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#2CA35C]"></span>
                  <span className="text-[11px] text-[#7CD4EF] font-medium capitalize">
                    {user?.role === 'admin' ? 'Administrador' : 'Consultor Comercial'}
                  </span>
                </div>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.to === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.to)

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                        item.primary
                          ? 'bg-[#1CA0D8] text-white font-semibold shadow-md hover:bg-[#158bbd]'
                          : isActive
                            ? 'bg-[#125B7C] text-white'
                            : 'text-white/80 hover:bg-[#0E476B] hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#1A5072] space-y-2">
              <a
                href="https://www.piscinasbeluga.com.br"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-xs text-white/70 hover:text-[#7CD4EF] px-3 py-2"
              >
                <span>piscinasbeluga.com.br</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#0B3D5C] text-white shrink-0 sticky top-0 h-screen justify-between shadow-xl">
        <div className="p-5 flex flex-col h-full">
          {/* Logo & Marca */}
          <div className="pb-6 border-b border-[#1A5072]">
            <NavLink to="/" className="block">
              <BelugaLogo variant="white" size="md" />
            </NavLink>
            <p className="text-[11px] text-[#7CD4EF] mt-2 tracking-wide font-medium">
              Sistema de Orçamentos Comerciais
            </p>
          </div>

          {/* Usuário logado */}
          <div className="my-5 p-3 rounded-xl bg-[#08293E] text-xs border border-[#125B7C]/40">
            <div className="text-white/60 text-[11px]">Consultor conectado</div>
            <div className="font-semibold text-white truncate text-sm mt-0.5">
              {user?.name || user?.email}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2CA35C]"></span>
              <span className="text-[11px] text-[#7CD4EF] font-medium">
                {isAdmin ? 'Administrador' : 'Consultor Comercial'}
              </span>
            </div>
          </div>

          {/* Navegação principal */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    item.primary
                      ? 'bg-gradient-to-r from-[#1CA0D8] to-[#1280ae] text-white font-semibold shadow-md hover:brightness-105 active:scale-[0.98]'
                      : isActive
                        ? 'bg-[#125B7C] text-white font-semibold'
                        : 'text-white/80 hover:bg-[#0E476B] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.primary && <ChevronRight className="h-4 w-4" />}
                </NavLink>
              )
            })}
          </nav>

          {/* Rodapé da sidebar */}
          <div className="pt-4 mt-auto border-t border-[#1A5072] space-y-2">
            <a
              href="https://www.piscinasbeluga.com.br"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-xs text-white/60 hover:text-[#7CD4EF] px-2 py-1 transition-colors"
            >
              <span>Site oficial Beluga</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-xs text-red-200 hover:text-red-100 hover:bg-red-500/20 h-9 px-3 gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair da conta</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 flex-1">{children}</div>

        {/* Rodapé discreto */}
        <footer className="py-4 px-6 text-center text-xs text-[#5B6B78] border-t border-[#EDF1F4] bg-white">
          Beluga Piscinas • Fábrica Taquara/RS • Contato: (48) 99110-4301 •
          www.piscinasbeluga.com.br
        </footer>
      </main>
    </div>
  )
}
