import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { poolModelService } from '@/services/api'
import type { PoolModel } from '@/types/beluga'
import { formatBRL } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Upload,
  Save,
  Check,
  X,
  FilePlus,
  Layers,
} from 'lucide-react'

export const ModelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [model, setModel] = useState<PoolModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Campos editáveis por admin
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState<number>(0)
  const [depth, setDepth] = useState('1,40 m')
  const [structureType, setStructureType] = useState('Fibra em Gel')
  const [technicalSpecs, setTechnicalSpecs] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    if (!id) return
    poolModelService
      .getById(id)
      .then((m) => {
        setModel(m)
        setName(m.name)
        setDescription(m.description || '')
        setBasePrice(m.base_price || 0)
        setDepth(m.depth || '1,40 m')
        setStructureType(m.structure_type || 'Fibra em Gel')
        setTechnicalSpecs(m.technical_specs || '')
        setReviewNotes(m.review_notes || '')
        setIsApproved(!!m.is_approved)
      })
      .catch((err) => {
        toast({
          title: 'Erro ao carregar modelo',
          description: err.message,
          variant: 'destructive',
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!model) return
    setSaving(true)
    try {
      const updated = await poolModelService.update(model.id, {
        name,
        description,
        base_price: basePrice,
        depth,
        structure_type: structureType,
        technical_specs: technicalSpecs,
        review_notes: reviewNotes,
        is_approved: isApproved,
        needs_review: !isApproved,
      })
      setModel(updated)
      toast({ title: 'Modelo atualizado com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar alterações',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBudgetWithModel = () => {
    navigate('/budgets/new')
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-[#5B6B78] flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#1CA0D8] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Carregando detalhes do modelo...</p>
      </div>
    )
  }

  if (!model) {
    return <div className="p-8 text-center text-red-600">Modelo não encontrado.</div>
  }

  let dims: string[] = []
  try {
    dims = JSON.parse(model.dimensions || '[]')
  } catch {
    /* intentionally ignored */
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/models')}
          className="h-9 px-3 rounded-xl text-xs gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Voltar ao catálogo</span>
        </Button>

        <div className="flex items-center gap-2">
          {isApproved ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5 border border-emerald-300">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Aprovado para Venda</span>
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1.5 border border-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Aguardando Aprovação</span>
            </span>
          )}
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#EDF1F4] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDF1F4] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1CA0D8]">
              Página {model.catalog_page || 1} • Taquara/RS
            </span>
            <h1 className="text-2xl font-black text-[#0B3D5C]">{model.name}</h1>
          </div>
          <Button
            onClick={handleCreateBudgetWithModel}
            className="h-11 px-5 bg-[#0B3D5C] hover:bg-[#125B7C] text-white rounded-xl text-xs font-bold gap-2 shadow-sm"
          >
            <FilePlus className="h-4 w-4" />
            <span>Criar Orçamento com Este Modelo</span>
          </Button>
        </div>

        {/* Informações técnicas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-[#EDF1F4]">
            <span className="text-[10px] uppercase font-bold text-[#5B6B78]">Profundidade</span>
            <p className="text-sm font-bold text-[#0B3D5C] mt-0.5">{depth}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-[#EDF1F4]">
            <span className="text-[10px] uppercase font-bold text-[#5B6B78]">Estrutura</span>
            <p className="text-sm font-bold text-[#0B3D5C] mt-0.5">{structureType}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-[#EDF1F4]">
            <span className="text-[10px] uppercase font-bold text-[#5B6B78]">Preço Base</span>
            <p className="text-sm font-bold text-[#0B3D5C] mt-0.5 tabular-nums">
              {formatBRL(basePrice)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-[#EDF1F4]">
            <span className="text-[10px] uppercase font-bold text-[#5B6B78]">Variações</span>
            <p className="text-sm font-bold text-[#0B3D5C] mt-0.5">{dims.length} opções</p>
          </div>
        </div>

        {/* Dimensões */}
        <div>
          <Label className="text-xs font-bold text-[#0B3D5C] mb-2 block">
            Dimensões Oficiais do Catálogo:
          </Label>
          <div className="flex flex-wrap gap-2">
            {dims.map((dim, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-[#F0F7FB] border border-[#1CA0D8]/30 text-xs font-bold text-[#0B3D5C]"
              >
                {dim}
              </span>
            ))}
          </div>
        </div>

        {/* Formulário Admin de Edição */}
        {isAdmin && (
          <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-[#EDF1F4]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B3D5C]">Painel de Edição Técnica (Admin)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="approveToggle"
                  checked={isApproved}
                  onChange={(e) => setIsApproved(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor="approveToggle" className="text-xs font-bold cursor-pointer">
                  Aprovado para uso pelos vendedores
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nome do Modelo</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Valor Base Inicial (R$)</Label>
                <Input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Descrição Comercial</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs h-20"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Especificações Técnicas e Litragem</Label>
              <Input
                value={technicalSpecs}
                onChange={(e) => setTechnicalSpecs(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notas de Revisão Interna</Label>
              <Input
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Anotações técnicas sobre medidas ou fábrica"
                className="h-10 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-11 bg-[#0B3D5C] hover:bg-[#125B7C] text-white font-bold rounded-xl text-xs gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Salvando...' : 'Salvar Alterações do Modelo'}</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
