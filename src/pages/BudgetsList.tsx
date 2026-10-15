import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { budgetService } from '@/services/api'
import type { Budget, BudgetStatus } from '@/types/beluga'
import { formatBRL } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  FilePlus,
  FileText,
  Search,
  Filter,
  Eye,
  Copy,
  Trash2,
  Calendar,
  User,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

const STATUS_TABS: (BudgetStatus | 'Todos')[] = [
  'Todos',
  'Rascunho',
  'Finalizado',
  'Enviado',
  'Em negociação',
  'Aprovado',
  'Recusado',
  'Expirado',
]

export const BudgetsList: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BudgetStatus | 'Todos'>('Todos')

  // Carregar dados
  const fetchBudgets = async () => {
    try {
      const data = await budgetService.list()
      setBudgets(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar orçamentos',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  // Inscrição Realtime para atualizações em tempo real
  useRealtime<Budget>('budgets', (e) => {
    if (e.action === 'create') {
      setBudgets((prev) => [e.record, ...prev.filter((b) => b.id !== e.record.id)])
    } else if (e.action === 'update') {
      setBudgets((prev) => prev.map((b) => (b.id === e.record.id ? e.record : b)))
    } else if (e.action === 'delete') {
      setBudgets((prev) => prev.filter((b) => b.id !== e.record.id))
    }
  })

  // Duplicar
  const handleDuplicate = async (e: React.MouseEvent, b: Budget) => {
    e.stopPropagation()
    try {
      const dup = await budgetService.duplicate(b.id, user?.id || '', user?.name || 'Consultor')
      toast({ title: 'Duplicado com sucesso', description: 'Abrindo cópia...' })
      navigate(`/budgets/new?id=${dup.id}`)
    } catch (err: any) {
      toast({ title: 'Erro ao duplicar', description: err.message, variant: 'destructive' })
    }
  }

  // Excluir (somente admin)
  const handleDelete = async (e: React.MouseEvent, b: Budget) => {
    e.stopPropagation()
    if (!window.confirm(`Deseja realmente excluir o orçamento ${b.number}?`)) return

    try {
      await budgetService.delete(b.id)
      setBudgets((prev) => prev.filter((item) => item.id !== b.id))
      toast({ title: 'Orçamento excluído' })
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  // Filtragem
  const filteredBudgets = budgets.filter((b) => {
    if (selectedStatus !== 'Todos' && b.status !== selectedStatus) {
      return false
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      let clientName = ''
      let poolModel = ''
      try {
        if (b.client_snapshot) clientName = JSON.parse(b.client_snapshot).name || ''
      } catch {
        /* intentionally ignored */
      }
      try {
        if (b.pool_config) poolModel = JSON.parse(b.pool_config).model_name || ''
      } catch {
        /* intentionally ignored */
      }

      const matchesNum = (b.number || '').toLowerCase().includes(q)
      const matchesClient = clientName.toLowerCase().includes(q)
      const matchesModel = poolModel.toLowerCase().includes(q)
      const matchesConsultant = (b.consultant_name || '').toLowerCase().includes(q)

      return matchesNum || matchesClient || matchesModel || matchesConsultant
    }

    return true
  })

  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Em negociação':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Enviado':
        return 'bg-sky-100 text-sky-800 border-sky-300'
      case 'Finalizado':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'Recusado':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      case 'Expirado':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Rascunho':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Topo da lista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0B3D5C]">Meus Orçamentos</h1>
          <p className="text-xs text-[#5B6B78] mt-0.5">
            Gerencie propostas comerciais, emita PDFs e acompanhe o fechamento de vendas.
          </p>
        </div>
        <Button
          onClick={() => navigate('/budgets/new')}
          className="h-11 px-5 bg-[#0B3D5C] hover:bg-[#125B7C] text-white rounded-xl text-xs font-bold gap-2 shadow-sm"
        >
          <FilePlus className="h-4 w-4" />
          <span>Novo Orçamento</span>
        </Button>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDF1F4] shadow-sm space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, número do orçamento, modelo ou consultor..."
            className="pl-9 h-11 text-xs"
          />
        </div>

        {/* Chips de Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isSelected = selectedStatus === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedStatus(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0B3D5C] text-white shadow-sm'
                    : 'bg-[#F8FAFC] text-[#5B6B78] hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* Listagem */}
      {loading ? (
        <div className="py-20 text-center text-[#5B6B78] flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1CA0D8] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Carregando histórico de orçamentos...</p>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#EDF1F4] p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EDF1F4] text-[#0B3D5C] flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B3D5C]">Nenhum orçamento encontrado</h3>
            <p className="text-xs text-[#5B6B78] mt-1 max-w-sm mx-auto">
              {search || selectedStatus !== 'Todos'
                ? 'Tente ajustar os filtros ou o termo de busca pesquisado.'
                : 'Você ainda não possui orçamentos cadastrados. Crie seu primeiro agora!'}
            </p>
          </div>
          <Button
            onClick={() => navigate('/budgets/new')}
            className="bg-[#0B3D5C] text-white text-xs h-10 px-6 rounded-xl"
          >
            Criar Orçamento
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBudgets.map((b) => {
            let clientName = 'Cliente'
            let clientPhone = ''
            let clientCity = ''
            try {
              if (b.client_snapshot) {
                const snap = JSON.parse(b.client_snapshot)
                clientName = snap.name || 'Cliente'
                clientPhone = snap.phone || ''
                clientCity = snap.city || ''
              }
            } catch {
              /* intentionally ignored */
            }

            let poolModel = 'Piscina Beluga'
            let poolDimensions = ''
            try {
              if (b.pool_config) {
                const cfg = JSON.parse(b.pool_config)
                poolModel = cfg.model_name || 'Piscina'
                poolDimensions = cfg.dimensions || ''
              }
            } catch {
              /* intentionally ignored */
            }

            const dateStr = b.created
              ? new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(b.created))
              : ''

            return (
              <Card
                key={b.id}
                onClick={() => navigate(`/budgets/${b.id}`)}
                className="cursor-pointer border-[#EDF1F4] hover:border-[#1CA0D8]/50 hover:shadow-md transition-all group"
              >
                <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Informações Principais */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-[#0B3D5C]">
                        {b.number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          b.status,
                        )}`}
                      >
                        {b.status}
                      </span>
                      {b.version && b.version > 1 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          v{b.version}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-[#142A36] group-hover:text-[#0B3D5C] truncate">
                      {clientName}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#5B6B78] flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-[#0B3D5C]">
                        <Layers className="h-3.5 w-3.5 text-[#1CA0D8]" />
                        <span>
                          {poolModel} {poolDimensions && `(${poolDimensions})`}
                        </span>
                      </span>
                      {clientCity && <span>• {clientCity}</span>}
                      {b.consultant_name && <span>• Consultor: {b.consultant_name}</span>}
                      <span>• {dateStr}</span>
                    </div>
                  </div>

                  {/* Valor e Ações */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#EDF1F4]">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5B6B78] block">
                        Valor Total
                      </span>
                      <p className="text-base md:text-lg font-black text-[#0B3D5C] tabular-nums">
                        {formatBRL(b.total_value)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDuplicate(e, b)}
                        title="Duplicar proposta"
                        className="h-9 w-9 text-[#5B6B78] hover:text-[#0B3D5C]"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, b)}
                          title="Excluir orçamento"
                          className="h-9 w-9 text-red-400 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      <div className="w-8 h-8 rounded-full bg-[#F0F7FB] text-[#1CA0D8] group-hover:bg-[#1CA0D8] group-hover:text-white flex items-center justify-center transition-colors ml-1">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
