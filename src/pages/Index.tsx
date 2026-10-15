import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { budgetService } from '@/services/api'
import type { Budget } from '@/types/beluga'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  FilePlus,
  FileText,
  Layers,
  Sparkles,
  Users,
  Settings,
  ArrowRight,
  TrendingUp,
  Send,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'

export const Index: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    budgetService
      .list()
      .then((res) => setBudgets(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalCreated = budgets.length
  const totalSent = budgets.filter((b) =>
    ['Enviado', 'Em negociação', 'Aprovado'].includes(b.status),
  ).length
  const totalApproved = budgets.filter((b) => b.status === 'Aprovado').length

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Boas-vindas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#EDF1F4]">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0B3D5C] tracking-tight">
            Olá, {user?.name || 'Consultor Beluga'}!
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B78] mt-1 capitalize">
            {capitalize(todayStr)} • Fábrica Taquara/RS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Catálogo Oficial Ativo
          </span>
        </div>
      </div>

      {/* Cartão de Ação Primária em Destaque */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B3D5C] via-[#125B7C] to-[#1CA0D8] p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider text-white">
            Proposta Comercial A4 Premium
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Emita um orçamento completo e personalizado em minutos
          </h2>
          <p className="text-xs md:text-sm text-white/80 leading-relaxed">
            Selecione o modelo da piscina, dimensões, opcionais exclusivos e gere um PDF com
            diagramação editorial de alto padrão para encantar seu cliente.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => navigate('/budgets/new')}
              size="lg"
              className="h-14 px-8 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold rounded-xl text-base shadow-lg transition-transform active:scale-95 flex items-center gap-3"
            >
              <FilePlus className="h-6 w-6" />
              <span>NOVO ORÇAMENTO</span>
            </Button>
          </div>
        </div>

        {/* Efeito visual decorativo no card */}
        <div className="absolute right-[-40px] bottom-[-40px] w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Linha discreta de Métricas / Contadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#EDF1F4] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#5B6B78]">Orçamentos criados</p>
              <p className="text-2xl md:text-3xl font-black text-[#0B3D5C] mt-1 tabular-nums">
                {loading ? '-' : totalCreated}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#EDF1F4] text-[#0B3D5C] flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#EDF1F4] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#5B6B78]">Orçamentos enviados</p>
              <p className="text-2xl md:text-3xl font-black text-[#1CA0D8] mt-1 tabular-nums">
                {loading ? '-' : totalSent}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1CA0D8]/10 text-[#1CA0D8] flex items-center justify-center">
              <Send className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#EDF1F4] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#5B6B78]">Orçamentos aprovados</p>
              <p className="text-2xl md:text-3xl font-black text-[#2CA35C] mt-1 tabular-nums">
                {loading ? '-' : totalApproved}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#2CA35C]/10 text-[#2CA35C] flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Ações Secundárias */}
      <div>
        <h3 className="text-base font-bold text-[#0B3D5C] mb-4">Módulos do Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            onClick={() => navigate('/budgets')}
            className="cursor-pointer border-[#EDF1F4] hover:border-[#1CA0D8]/40 hover:shadow-lg transition-all group"
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B3D5C]/5 text-[#0B3D5C] group-hover:bg-[#0B3D5C] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#142A36] text-sm group-hover:text-[#0B3D5C]">
                    Meus Orçamentos
                  </h4>
                  <ArrowRight className="h-4 w-4 text-[#5B6B78] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-[#5B6B78] mt-1 line-clamp-2">
                  Histórico completo, filtros por status, novas versões e download de propostas em
                  PDF.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/models')}
            className="cursor-pointer border-[#EDF1F4] hover:border-[#1CA0D8]/40 hover:shadow-lg transition-all group"
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1CA0D8]/10 text-[#1CA0D8] group-hover:bg-[#1CA0D8] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <Layers className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#142A36] text-sm group-hover:text-[#1CA0D8]">
                    Modelos de Piscinas
                  </h4>
                  <ArrowRight className="h-4 w-4 text-[#5B6B78] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-[#5B6B78] mt-1 line-clamp-2">
                  Catálogo oficial com 18 modelos, fotos, dimensões, acabamentos e área técnica.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/products')}
            className="cursor-pointer border-[#EDF1F4] hover:border-[#1CA0D8]/40 hover:shadow-lg transition-all group"
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F28C28]/10 text-[#F28C28] group-hover:bg-[#F28C28] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#142A36] text-sm group-hover:text-[#F28C28]">
                    Produtos e Opcionais
                  </h4>
                  <ArrowRight className="h-4 w-4 text-[#5B6B78] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-[#5B6B78] mt-1 line-clamp-2">
                  Geradores de ozônio, cloro, cascatas em inox, iluminação LED e acessórios.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/clients')}
            className="cursor-pointer border-[#EDF1F4] hover:border-[#1CA0D8]/40 hover:shadow-lg transition-all group"
          >
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#142A36] text-sm group-hover:text-purple-600">
                    Clientes
                  </h4>
                  <ArrowRight className="h-4 w-4 text-[#5B6B78] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-[#5B6B78] mt-1 line-clamp-2">
                  Base de contatos com busca e atalho para criar novos orçamentos já
                  pré-preenchidos.
                </p>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card
              onClick={() => navigate('/settings')}
              className="cursor-pointer border-[#EDF1F4] hover:border-[#1CA0D8]/40 hover:shadow-lg transition-all group"
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#142A36] group-hover:bg-[#142A36] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Settings className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#142A36] text-sm group-hover:text-[#142A36]">
                      Configurações Admin
                    </h4>
                    <ArrowRight className="h-4 w-4 text-[#5B6B78] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-[#5B6B78] mt-1 line-clamp-2">
                    Vendedores, limites de desconto, prazos, garantia e revisão de modelos do
                    catálogo.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
