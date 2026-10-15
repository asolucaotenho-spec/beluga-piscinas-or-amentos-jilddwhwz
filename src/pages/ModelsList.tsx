import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { poolModelService } from '@/services/api'
import type { PoolModel } from '@/types/beluga'
import { formatBRL } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Layers,
  Search,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
} from 'lucide-react'

export const ModelsList: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [models, setModels] = useState<PoolModel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPending, setFilterPending] = useState(false)

  const fetchModels = async () => {
    try {
      const data = await poolModelService.list()
      setModels(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar modelos',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  useRealtime<PoolModel>('pool_models', (e) => {
    if (e.action === 'create') {
      setModels((prev) => [e.record, ...prev.filter((m) => m.id !== e.record.id)])
    } else if (e.action === 'update') {
      setModels((prev) => prev.map((m) => (m.id === e.record.id ? e.record : m)))
    } else if (e.action === 'delete') {
      setModels((prev) => prev.filter((m) => m.id !== e.record.id))
    }
  })

  const handleApprove = async (e: React.MouseEvent, m: PoolModel) => {
    e.stopPropagation()
    try {
      const updated = await poolModelService.approve(m.id)
      setModels((prev) => prev.map((item) => (item.id === m.id ? updated : item)))
      toast({
        title: 'Modelo Aprovado',
        description: `O modelo ${m.name} agora está visível no catálogo comercial.`,
      })
    } catch (err: any) {
      toast({ title: 'Erro ao aprovar', description: err.message, variant: 'destructive' })
    }
  }

  const handleApproveAll = async () => {
    if (
      !window.confirm(
        'Deseja aprovar todos os modelos do catálogo para uso imediato pelos vendedores?',
      )
    )
      return
    try {
      const pendingList = models.filter((m) => !m.is_approved)
      for (const m of pendingList) {
        await poolModelService.approve(m.id)
      }
      await fetchModels()
      toast({ title: 'Todos os modelos foram aprovados com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro na aprovação em lote',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const filteredModels = models.filter((m) => {
    if (filterPending && m.is_approved) return false
    if (search.trim()) {
      return (
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(search.toLowerCase())
      )
    }
    return true
  })

  const pendingCount = models.filter((m) => !m.is_approved).length

  return (
    <div className="space-y-6">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0B3D5C]">Catálogo de Piscinas Beluga</h1>
          <p className="text-xs text-[#5B6B78] mt-0.5">
            Modelos oficiais extraídos do catálogo de fábrica de Taquara/RS.
          </p>
        </div>

        {isAdmin && pendingCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleApproveAll}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Aprovar Todos ({pendingCount})</span>
            </Button>
          </div>
        )}
      </div>

      {/* Alerta de Revisão Admin */}
      {isAdmin && pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                Existem {pendingCount} modelo(s) aguardando aprovação administrativa.
              </p>
              <p className="text-amber-800 mt-0.5">
                Conforme as regras de controle de qualidade, modelos pendentes necessitam de
                validação do administrador antes de aparecerem no orçamento dos vendedores.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilterPending(!filterPending)}
            className="h-9 text-xs border-amber-400 text-amber-900 hover:bg-amber-100 shrink-0"
          >
            {filterPending ? 'Mostrar Todos' : 'Filtrar Pendentes'}
          </Button>
        </div>
      )}

      {/* Busca */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDF1F4] shadow-sm">
        <div className="relative">
          <Search className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar modelo por nome (ex: Brisêis, Afrodite, Iris, Zeus...)"
            className="pl-9 h-11 text-xs"
          />
        </div>
      </div>

      {/* Grid de Modelos */}
      {loading ? (
        <div className="py-20 text-center text-[#5B6B78] flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1CA0D8] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Carregando catálogo de modelos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((m) => {
            let dims: string[] = []
            try {
              dims = JSON.parse(m.dimensions || '[]')
            } catch {
              /* intentionally ignored */
            }

            const isPastilhada = m.name.toLowerCase().includes('pastilhada')

            return (
              <Card
                key={m.id}
                onClick={() => navigate(`/models/${m.id}`)}
                className="cursor-pointer border-[#EDF1F4] hover:border-[#1CA0D8]/40 hover:shadow-lg transition-all group overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Faixa superior de tags */}
                  <div className="p-4 bg-gradient-to-r from-[#0B3D5C] to-[#125B7C] text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7CD4EF]">
                        Página {m.catalog_page || 1} do Catálogo
                      </span>
                      <h3 className="text-lg font-black">{m.name}</h3>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {m.is_approved ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Aprovado</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Pendente</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-[#5B6B78] line-clamp-2 leading-relaxed">
                      {m.description ||
                        'Piscina de fibra fabricada em Taquara/RS com alta durabilidade.'}
                    </p>

                    {/* Dimensões */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B78] block mb-1">
                        Dimensões ({dims.length} opção/ões):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dims.map((dim, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold bg-[#EDF1F4] text-[#142A36] px-2 py-0.5 rounded-md"
                          >
                            {dim}
                          </span>
                        ))}
                      </div>
                    </div>

                    {m.needs_review && (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                        <strong>Revisão necessária:</strong> {m.review_notes}
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Rodapé do Card */}
                <div className="p-4 pt-0 flex items-center justify-between border-t border-[#EDF1F4] mt-2">
                  <div>
                    <span className="text-[10px] text-[#5B6B78] block">A partir de</span>
                    <strong className="text-sm font-black text-[#0B3D5C] tabular-nums">
                      {formatBRL(m.base_price)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && !m.is_approved && (
                      <Button
                        size="sm"
                        onClick={(e) => handleApprove(e, m)}
                        className="h-8 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                      >
                        Aprovar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#1CA0D8] group-hover:translate-x-1 transition-transform"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
