import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { optionalItemService } from '@/services/api'
import type { OptionalItem } from '@/types/beluga'
import { formatBRL } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Sparkles, Plus, Edit2, Trash2, Search, CheckCircle, X, Save } from 'lucide-react'

const CATEGORIES = [
  'Tratamento da água',
  'Cascatas e acabamento',
  'Iluminação',
  'Acessibilidade',
  'Outros opcionais',
] as const

export const ProductsList: React.FC = () => {
  const { isAdmin } = useAuth()
  const { toast } = useToast()

  const [items, setItems] = useState<OptionalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')

  // Modal / Form para criar ou editar item
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OptionalItem | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<OptionalItem['category']>('Tratamento da água')
  const [price, setPrice] = useState<number>(0)
  const [unit, setUnit] = useState('unid')
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    try {
      const data = await optionalItemService.list('id != ""')
      setItems(data)
    } catch (err: any) {
      toast({ title: 'Erro ao carregar itens', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useRealtime<OptionalItem>('optional_items', (e) => {
    if (e.action === 'create') {
      setItems((prev) => [e.record, ...prev.filter((i) => i.id !== e.record.id)])
    } else if (e.action === 'update') {
      setItems((prev) => prev.map((i) => (i.id === e.record.id ? e.record : i)))
    } else if (e.action === 'delete') {
      setItems((prev) => prev.filter((i) => i.id !== e.record.id))
    }
  })

  const handleOpenCreate = () => {
    setEditingItem(null)
    setName('')
    setDescription('')
    setCategory('Tratamento da água')
    setPrice(0)
    setUnit('unid')
    setModalOpen(true)
  }

  const handleOpenEdit = (it: OptionalItem) => {
    setEditingItem(it)
    setName(it.name)
    setDescription(it.description || '')
    setCategory(it.category)
    setPrice(it.price || 0)
    setUnit(it.unit || 'unid')
    setModalOpen(true)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const payload: Partial<OptionalItem> = {
        name: name.trim(),
        description: description.trim(),
        category,
        price,
        unit,
        is_active: true,
      }

      if (editingItem) {
        await optionalItemService.update(editingItem.id, payload)
        toast({ title: 'Item atualizado com sucesso' })
      } else {
        await optionalItemService.create(payload)
        toast({ title: 'Item criado com sucesso' })
      }
      setModalOpen(false)
      await fetchItems()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar item', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (id: string, itemName: string) => {
    if (!window.confirm(`Deseja realmente excluir "${itemName}"?`)) return
    try {
      await optionalItemService.delete(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast({ title: 'Item excluído' })
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  const filteredItems = items.filter((it) => {
    if (selectedCategory !== 'Todas' && it.category !== selectedCategory) {
      return false
    }
    if (search.trim()) {
      return (
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        (it.description || '').toLowerCase().includes(search.toLowerCase())
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0B3D5C]">Produtos e Opcionais</h1>
          <p className="text-xs text-[#5B6B78] mt-0.5">
            Valores de referência de acessórios, geradores de ozônio/cloro e iluminação.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={handleOpenCreate}
            className="h-11 px-5 bg-[#0B3D5C] hover:bg-[#125B7C] text-white rounded-xl text-xs font-bold gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Opcional</span>
          </Button>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDF1F4] shadow-sm space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar acessório ou opcional por nome..."
            className="pl-9 h-11 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['Todas', ...CATEGORIES].map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0B3D5C] text-white shadow-sm'
                    : 'bg-[#F8FAFC] text-[#5B6B78] hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid de Itens */}
      {loading ? (
        <div className="py-20 text-center text-[#5B6B78] flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1CA0D8] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Carregando opcionais e produtos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border-[#EDF1F4] hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1CA0D8]/10 text-[#1CA0D8]">
                    {item.category}
                  </span>
                  <span className="text-base font-black text-[#0B3D5C] tabular-nums">
                    {formatBRL(item.price)}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#142A36] leading-snug">{item.name}</h3>

                <p className="text-xs text-[#5B6B78] leading-relaxed line-clamp-3">
                  {item.description || 'Acessório de alta qualidade para a sua piscina.'}
                </p>
              </CardContent>

              {isAdmin && (
                <div className="p-3 bg-slate-50 border-t border-[#EDF1F4] flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 px-2.5 text-xs text-[#0B3D5C]"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="h-8 px-2.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>Excluir</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal / Dialog de Criar / Editar (Admin) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#0B3D5C]">
                {editingItem ? 'Editar Opcional' : 'Novo Opcional'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nome do Item</Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Gerador de Ozônio"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Categoria</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-[#D6DEE4] bg-white px-2.5 text-xs focus:ring-2 focus:ring-[#1CA0D8]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Preço Referência (R$)</Label>
                  <Input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Unidade</Label>
                  <Input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="unid, ponto, kit"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Descrição Comercial</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes e benefícios do item para o cliente..."
                  className="text-xs h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="h-10 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 bg-[#0B3D5C] hover:bg-[#125B7C] text-white text-xs font-bold px-5"
                >
                  {saving ? 'Salvando...' : 'Salvar Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
