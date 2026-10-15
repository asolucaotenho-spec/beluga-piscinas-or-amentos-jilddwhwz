import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { clientService } from '@/services/api'
import type { Client } from '@/types/beluga'
import { formatPhone } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Users,
  Search,
  Plus,
  FilePlus,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  X,
  Save,
} from 'lucide-react'

const BRAZILIAN_STATES = [
  'SC',
  'RS',
  'PR',
  'SP',
  'RJ',
  'MG',
  'ES',
  'BA',
  'GO',
  'DF',
  'MT',
  'MS',
  'PE',
  'CE',
]

export const ClientsList: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal de cadastro/edição
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('SC')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchClients = async () => {
    try {
      const data = await clientService.list()
      setClients(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar clientes',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  useRealtime<Client>('clients', (e) => {
    if (e.action === 'create') {
      setClients((prev) => [e.record, ...prev.filter((c) => c.id !== e.record.id)])
    } else if (e.action === 'update') {
      setClients((prev) => prev.map((c) => (c.id === e.record.id ? e.record : c)))
    } else if (e.action === 'delete') {
      setClients((prev) => prev.filter((c) => c.id !== e.record.id))
    }
  })

  const handleOpenCreate = () => {
    setEditingClient(null)
    setName('')
    setPhone('')
    setPhoneWhatsapp('')
    setCity('')
    setState('SC')
    setAddress('')
    setEmail('')
    setNotes('')
    setModalOpen(true)
  }

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c)
    setName(c.name)
    setPhone(c.phone)
    setPhoneWhatsapp(c.phone_whatsapp || '')
    setCity(c.city)
    setState(c.state || 'SC')
    setAddress(c.address || '')
    setEmail(c.email || '')
    setNotes(c.notes || '')
    setModalOpen(true)
  }

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !city.trim()) return
    setSaving(true)
    try {
      const payload: Partial<Client> = {
        name: name.trim(),
        phone: phone.trim(),
        phone_whatsapp: phoneWhatsapp.trim() || phone.trim(),
        city: city.trim(),
        state,
        address: address.trim(),
        email: email.trim(),
        notes: notes.trim(),
        created_by: user?.id,
      }

      if (editingClient) {
        await clientService.update(editingClient.id, payload)
        toast({ title: 'Cliente atualizado com sucesso' })
      } else {
        await clientService.create(payload)
        toast({ title: 'Cliente cadastrado com sucesso' })
      }
      setModalOpen(false)
      await fetchClients()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar cliente', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClient = async (id: string, clientName: string) => {
    if (!window.confirm(`Deseja realmente excluir o cliente "${clientName}"?`)) return
    try {
      await clientService.delete(id)
      setClients((prev) => prev.filter((c) => c.id !== id))
      toast({ title: 'Cliente excluído' })
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  // Ação rápida: criar orçamento já pré-preenchendo a Etapa 1
  const handleCreateBudget = (clientId: string) => {
    navigate(`/budgets/new?clientId=${clientId}`)
  }

  const filteredClients = clients.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0B3D5C]">Clientes Cadastrados</h1>
          <p className="text-xs text-[#5B6B78] mt-0.5">
            Base de contatos e histórico de interessados em piscinas Beluga.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="h-11 px-5 bg-[#0B3D5C] hover:bg-[#125B7C] text-white rounded-xl text-xs font-bold gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#EDF1F4] shadow-sm">
        <div className="relative">
          <Search className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone, cidade ou e-mail..."
            className="pl-9 h-11 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#5B6B78] flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1CA0D8] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Carregando lista de clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#EDF1F4] p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EDF1F4] text-[#0B3D5C] flex items-center justify-center mx-auto">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B3D5C]">Nenhum cliente encontrado</h3>
            <p className="text-xs text-[#5B6B78] mt-1 max-w-sm mx-auto">
              Cadastre seus clientes para agilizar a criação de orçamentos e propostas comerciais.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#0B3D5C] text-white text-xs h-10 px-6 rounded-xl"
          >
            Cadastrar Cliente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((c) => (
            <Card
              key={c.id}
              className="border-[#EDF1F4] hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <h3 className="font-black text-sm text-[#0B3D5C] leading-snug">{c.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#5B6B78]">
                    {c.city}/{c.state}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#5B6B78]">
                  <div className="flex items-center gap-1.5 font-medium text-[#142A36]">
                    <Phone className="h-3.5 w-3.5 text-[#1CA0D8]" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{c.address}</span>
                    </div>
                  )}
                </div>

                {c.notes && (
                  <p className="text-[11px] text-[#5B6B78] bg-slate-50 p-2 rounded-lg line-clamp-2">
                    {c.notes}
                  </p>
                )}
              </CardContent>

              <div className="p-3 bg-[#F8FAFC] border-t border-[#EDF1F4] flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  onClick={() => handleCreateBudget(c.id)}
                  className="h-8 px-3 text-[11px] bg-[#1CA0D8] hover:bg-[#158bbd] text-white font-bold rounded-lg gap-1.5"
                >
                  <FilePlus className="h-3.5 w-3.5" />
                  <span>Criar Orçamento</span>
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(c)}
                    className="h-8 w-8 p-0 text-[#0B3D5C]"
                    title="Editar"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClient(c.id, c.name)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal / Dialog de Cadastro/Edição de Cliente */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#0B3D5C]">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nome Completo *</Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Telefone / WhatsApp *</Label>
                  <Input
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(48) 99999-9999"
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">WhatsApp Secundário</Label>
                  <Input
                    value={phoneWhatsapp}
                    onChange={(e) => setPhoneWhatsapp(formatPhone(e.target.value))}
                    placeholder="Opcional"
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Cidade *</Label>
                  <Input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Florianópolis"
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Estado (UF)</Label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-10 rounded-lg border border-[#D6DEE4] bg-white px-2.5 text-xs focus:ring-2 focus:ring-[#1CA0D8]"
                  >
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Endereço da Obra</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, bairro ou condomínio"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Observações Internas</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferências, horários, etc."
                  className="h-10 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
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
                  {saving ? 'Salvando...' : 'Salvar Cliente'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
