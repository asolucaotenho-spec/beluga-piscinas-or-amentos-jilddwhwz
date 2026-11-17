import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { settingsService } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import type { User } from '@/types/beluga'
import { formatPhone } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  CreditCard,
  FileText,
  CheckSquare,
  ShieldCheck,
  Plus,
  Save,
  Trash2,
  Lock,
  Edit2,
  X,
} from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<
    'vendedores' | 'condicoes' | 'textos' | 'materiais' | 'identidade'
  >('vendedores')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Aba Vendedores
  const [usersList, setUsersList] = useState<User[]>([])
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('Skip@Pass')
  const [newUserRole, setNewUserRole] = useState<'admin' | 'vendor'>('vendor')
  const [newUserDiscount, setNewUserDiscount] = useState<number>(10)

  // Aba Condições Comerciais
  const [paymentDefault, setPaymentDefault] = useState({
    condition: 'À vista ou em até 12x no cartão de crédito',
    standard_installments: 12,
    notes: 'SEMPRE EM 12X PADRÃO',
  })
  const [validityDays, setValidityDays] = useState<number>(5)

  // Aba Textos Padrão
  const [warrantyText, setWarrantyText] = useState('')
  const [deliveryDeadline, setDeliveryDeadline] = useState('A combinar')
  const [clientResponsibilities, setClientResponsibilities] = useState<string[]>([])

  // Aba Materiais Inclusos
  const [includedItems, setIncludedItems] = useState<string[]>([])
  const [newItemText, setNewItemText] = useState('')

  // Aba Identidade Visual
  const [branding, setBranding] = useState({
    company_name: 'Beluga Piscinas',
    phone: '48 99110-4301',
    whatsapp_number: '48 99110-4301',
    website: 'www.piscinasbeluga.com.br',
    instagram: '@BELUGAPISCINASSSANTACATARINA',
    factory_location: 'Taquara/RS',
    contact_email: 'belugapiscinassc@gmail.com',
    slogan:
      'A piscina é um bem para a vida toda, e a Beluga Piscinas é a parceira certa para realizar este projeto!',
  })

  const loadAllSettings = async () => {
    try {
      setLoading(true)
      const [uList, sMap] = await Promise.all([
        pb.collection('users').getFullList<User>({ sort: 'name' }),
        settingsService.getAll(),
      ])

      setUsersList(uList)

      if (sMap.payment_default) setPaymentDefault(sMap.payment_default)
      if (sMap.validity_days) setValidityDays(sMap.validity_days.days || 5)
      if (sMap.warranty_text) setWarrantyText(sMap.warranty_text.text || '')
      if (sMap.delivery_deadline) setDeliveryDeadline(sMap.delivery_deadline.text || 'A combinar')
      if (sMap.client_responsibilities) setClientResponsibilities(sMap.client_responsibilities)
      if (sMap.included_items) setIncludedItems(sMap.included_items)
      if (sMap.branding)
        setBranding((prev) => ({
          ...prev,
          ...sMap.branding,
          // Número base de WhatsApp da equipe — padrão 48 99110-4301
          whatsapp_number: sMap.branding.whatsapp_number || prev.whatsapp_number,
        }))
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar configurações',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadAllSettings()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-lg font-bold text-red-600">Acesso Restrito</h2>
        <p className="text-xs text-[#5B6B78]">
          Esta área é restrita aos administradores da Beluga Piscinas.
        </p>
      </div>
    )
  }

  // Salvar Condições Comerciais
  const handleSaveConditions = async () => {
    setSaving(true)
    try {
      await settingsService.set('payment_default', paymentDefault)
      await settingsService.set('validity_days', { days: validityDays })
      toast({ title: 'Condições comerciais salvas com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Salvar Textos Padrão
  const handleSaveTexts = async () => {
    setSaving(true)
    try {
      await settingsService.set('warranty_text', { text: warrantyText })
      await settingsService.set('delivery_deadline', { text: deliveryDeadline })
      await settingsService.set('client_responsibilities', clientResponsibilities)
      toast({ title: 'Textos padrão contratuais salvos com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Salvar Materiais Inclusos
  const handleSaveIncludedItems = async () => {
    setSaving(true)
    try {
      await settingsService.set('included_items', includedItems)
      toast({ title: 'Materiais inclusos salvos com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Salvar Identidade Visual
  const handleSaveBranding = async () => {
    setSaving(true)
    try {
      // Garante que o número base de WhatsApp da equipe nunca fique vazio
      // (padrão 48 99110-4301, usado nos links wa.me das propostas)
      await settingsService.set('branding', {
        ...branding,
        whatsapp_number: branding.whatsapp_number?.trim() || '48 99110-4301',
      })
      toast({ title: 'Dados da marca atualizados com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Criar novo usuário vendedor
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserEmail.trim()) return
    setSaving(true)
    try {
      const created = await pb.collection('users').create<User>({
        email: newUserEmail.trim(),
        name: newUserName.trim() || 'Consultor Beluga',
        phone: newUserPhone.trim(),
        password: newUserPassword,
        passwordConfirm: newUserPassword,
        role: newUserRole,
        discount_limit: newUserDiscount,
        is_active: true,
      })

      setUsersList((prev) => [...prev, created])
      setUserModalOpen(false)
      toast({ title: 'Consultor cadastrado com sucesso' })
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar consultor',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Remover usuário vendedor
  const handleDeleteUser = async (uId: string, uEmail: string) => {
    if (uEmail === 'belugapiscinassc@gmail.com') {
      toast({
        title: 'Aviso',
        description: 'O administrador principal não pode ser excluído.',
        variant: 'destructive',
      })
      return
    }
    if (!window.confirm(`Deseja realmente remover o usuário ${uEmail}?`)) return

    try {
      await pb.collection('users').delete(uId)
      setUsersList((prev) => prev.filter((u) => u.id !== uId))
      toast({ title: 'Usuário removido com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black text-[#0B3D5C]">Painel de Configurações</h1>
        <p className="text-xs text-[#5B6B78] mt-0.5">
          Gerenciamento administrativo, vendedores, contratos e parâmetros da Beluga Piscinas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-[#EDF1F4] shadow-sm">
        {[
          { id: 'vendedores', label: 'Vendedores e Acessos', icon: Users },
          { id: 'condicoes', label: 'Condições Comerciais', icon: CreditCard },
          { id: 'textos', label: 'Textos Padrão e Garantia', icon: FileText },
          { id: 'materiais', label: 'Materiais Inclusos', icon: CheckSquare },
          { id: 'identidade', label: 'Identidade e Contatos', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#0B3D5C] text-white shadow-sm'
                  : 'text-[#5B6B78] hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Conteúdo das Tabs */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#EDF1F4] shadow-sm">
        {/* ========================================================
            TAB 1: VENDEDORES
           ======================================================== */}
        {activeTab === 'vendedores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-[#0B3D5C]">Equipe de Vendas Beluga</h2>
                <p className="text-xs text-[#5B6B78]">
                  Cadastre consultores comerciais e defina os limites de desconto autorizados.
                </p>
              </div>
              <Button
                onClick={() => setUserModalOpen(true)}
                className="h-10 px-4 bg-[#0B3D5C] hover:bg-[#125B7C] text-white rounded-xl text-xs font-bold gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Vendedor</span>
              </Button>
            </div>

            <div className="divide-y divide-[#EDF1F4]">
              {usersList.map((u) => (
                <div key={u.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#0B3D5C]">{u.name || 'Sem nome'}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role === 'admin' ? 'Administrador' : 'Vendedor'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5B6B78] mt-0.5">
                      {u.email} {u.phone && `• ${u.phone}`} • Limite Desconto:{' '}
                      {u.discount_limit || 10}%
                    </p>
                  </div>

                  {u.email !== 'belugapiscinassc@gmail.com' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      <span>Remover</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: CONDIÇÕES COMERCIAIS
           ======================================================== */}
        {activeTab === 'condicoes' && (
          <div className="space-y-6 max-w-xl">
            <div className="border-b pb-4">
              <h2 className="text-base font-bold text-[#0B3D5C]">Condições Comerciais Padrão</h2>
              <p className="text-xs text-[#5B6B78]">
                Regras de parcelamento e prazos exibidos em todas as novas propostas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Texto da Condição Padrão</Label>
                <Input
                  value={paymentDefault.condition}
                  onChange={(e) =>
                    setPaymentDefault((prev) => ({ ...prev, condition: e.target.value }))
                  }
                  className="h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Número Padrão de Parcelas no Cartão</Label>
                <Input
                  type="number"
                  value={paymentDefault.standard_installments}
                  onChange={(e) =>
                    setPaymentDefault((prev) => ({
                      ...prev,
                      standard_installments: parseInt(e.target.value, 10) || 12,
                    }))
                  }
                  className="h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Validade Padrão da Proposta (em dias)
                </Label>
                <Input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value, 10) || 5)}
                  className="h-11 text-xs"
                />
              </div>

              <Button
                onClick={handleSaveConditions}
                disabled={saving}
                className="h-11 bg-[#0B3D5C] hover:bg-[#125B7C] text-white text-xs font-bold px-6 rounded-xl gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Condições Comerciais</span>
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: TEXTOS PADRÃO E GARANTIA
           ======================================================== */}
        {activeTab === 'textos' && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-base font-bold text-[#0B3D5C]">Textos Padrão e Contratuais</h2>
              <p className="text-xs text-[#5B6B78]">
                Cláusulas legais, garantia de fábrica e responsabilidades do cliente inseridas no
                PDF.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0B3D5C]">
                  Cláusula de Garantia de Fábrica (15 Anos)
                </Label>
                <Textarea
                  value={warrantyText}
                  onChange={(e) => setWarrantyText(e.target.value)}
                  className="text-xs h-24"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0B3D5C]">
                  Prazo de Entrega / Início das Obras
                </Label>
                <Input
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  className="h-11 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#0B3D5C]">
                  Responsabilidades do Cliente (uma por linha)
                </Label>
                <Textarea
                  value={clientResponsibilities.join('\n')}
                  onChange={(e) => setClientResponsibilities(e.target.value.split('\n'))}
                  className="text-xs h-36 font-mono"
                />
              </div>

              <Button
                onClick={handleSaveTexts}
                disabled={saving}
                className="h-11 bg-[#0B3D5C] hover:bg-[#125B7C] text-white text-xs font-bold px-6 rounded-xl gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Textos Contratuais</span>
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: MATERIAIS INCLUSOS
           ======================================================== */}
        {activeTab === 'materiais' && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-base font-bold text-[#0B3D5C]">Materiais e Serviços Inclusos</h2>
              <p className="text-xs text-[#5B6B78]">
                Itens-padrão que acompanham todos os orçamentos sem acréscimo de valor.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Adicionar novo item incluso (ex: 01 Peneira de alta durabilidade)..."
                className="h-10 text-xs"
              />
              <Button
                onClick={() => {
                  if (!newItemText.trim()) return
                  setIncludedItems([...includedItems, newItemText.trim()])
                  setNewItemText('')
                }}
                className="h-10 text-xs px-4 bg-[#1CA0D8] text-white font-bold shrink-0"
              >
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {includedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-[#EDF1F4] flex items-center justify-between text-xs"
                >
                  <span className="leading-snug">{item}</span>
                  <button
                    onClick={() => setIncludedItems(includedItems.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveIncludedItems}
              disabled={saving}
              className="h-11 bg-[#0B3D5C] hover:bg-[#125B7C] text-white text-xs font-bold px-6 rounded-xl gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Salvar Lista de Inclusos</span>
            </Button>
          </div>
        )}

        {/* ========================================================
            TAB 5: IDENTIDADE E CONTATOS
           ======================================================== */}
        {activeTab === 'identidade' && (
          <div className="space-y-6 max-w-xl">
            <div className="border-b pb-4">
              <h2 className="text-base font-bold text-[#0B3D5C]">Identidade Visual e Contatos</h2>
              <p className="text-xs text-[#5B6B78]">
                Dados institucionais da fábrica de Taquara/RS e contatos de Santa Catarina.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nome da Empresa</Label>
                <Input
                  value={branding.company_name}
                  onChange={(e) => setBranding({ ...branding, company_name: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  WhatsApp Base da Equipe (links enviados ao cliente)
                </Label>
                <Input
                  value={branding.whatsapp_number || ''}
                  onChange={(e) => setBranding({ ...branding, whatsapp_number: e.target.value })}
                  placeholder="48 99110-4301"
                  className="h-10 text-xs"
                />
                <p className="text-[11px] text-[#5B6B78]">
                  Número usado como contato/remetente nos links de WhatsApp das propostas. Padrão:
                  48 99110-4301.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Telefone Oficial</Label>
                  <Input
                    value={branding.phone}
                    onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Fábrica</Label>
                  <Input
                    value={branding.factory_location}
                    onChange={(e) => setBranding({ ...branding, factory_location: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Site Oficial</Label>
                  <Input
                    value={branding.website}
                    onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Instagram</Label>
                  <Input
                    value={branding.instagram}
                    onChange={(e) => setBranding({ ...branding, instagram: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Slogan de Encerramento (PDF)</Label>
                <Textarea
                  value={branding.slogan}
                  onChange={(e) => setBranding({ ...branding, slogan: e.target.value })}
                  className="text-xs h-20"
                />
              </div>

              <Button
                onClick={handleSaveBranding}
                disabled={saving}
                className="h-11 bg-[#0B3D5C] hover:bg-[#125B7C] text-white text-xs font-bold px-6 rounded-xl gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Identidade Visual</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Vendedor */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#0B3D5C]">Novo Vendedor / Acesso</h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Nome Completo</Label>
                <Input
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nome do consultor"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">E-mail de Acesso *</Label>
                <Input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="vendedor@piscinasbeluga.com.br"
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Telefone</Label>
                  <Input
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(formatPhone(e.target.value))}
                    placeholder="(48) 99999-9999"
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Limite de Desconto (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={newUserDiscount}
                    onChange={(e) => setNewUserDiscount(parseInt(e.target.value, 10) || 10)}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Senha Inicial</Label>
                <Input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Papel de Acesso</Label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-[#D6DEE4] bg-white px-2.5 text-xs focus:ring-2 focus:ring-[#1CA0D8]"
                >
                  <option value="vendor">Consultor Comercial (Vendedor)</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserModalOpen(false)}
                  className="h-10 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 bg-[#0B3D5C] hover:bg-[#125B7C] text-white text-xs font-bold px-5"
                >
                  {saving ? 'Criando...' : 'Cadastrar Vendedor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
