import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  clientService,
  poolModelService,
  optionalItemService,
  settingsService,
  budgetService,
} from '@/services/api'
import type {
  Client,
  PoolModel,
  OptionalItem,
  Budget,
  BudgetPoolConfig,
  BudgetSelectedOptional,
} from '@/types/beluga'
import { formatBRL, formatPhone } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  User,
  Layers,
  CheckSquare,
  Sparkles,
  Calculator,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Info,
  Calendar,
  Save,
  CheckCircle2,
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

export const BudgetWizard: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const editBudgetId = searchParams.get('id')
  const prefillClientId = searchParams.get('clientId')

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [savingDraft, setSavingDraft] = useState(false)
  const [budgetId, setBudgetId] = useState<string | null>(editBudgetId)
  const [budgetNumber, setBudgetNumber] = useState<string>('')

  // Dados auxiliares carregados do sistema
  const [clientsList, setClientsList] = useState<Client[]>([])
  const [poolModels, setPoolModels] = useState<PoolModel[]>([])
  const [optionalItems, setOptionalItems] = useState<OptionalItem[]>([])
  const [systemSettings, setSystemSettings] = useState<Record<string, any>>({})

  // ETAPA 1: DADOS DO CLIENTE
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientWhatsapp, setClientWhatsapp] = useState('')
  const [clientCity, setClientCity] = useState('')
  const [clientState, setClientState] = useState('SC')
  const [clientAddress, setClientAddress] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [budgetDate, setBudgetDate] = useState(new Date().toISOString().split('T')[0])
  const [consultantName, setConsultantName] = useState(user?.name || 'Beluga Consultor')
  const [saveAsClientRecord, setSaveAsClientRecord] = useState(true)

  // ETAPA 2: SELEÇÃO DA PISCINA
  const [selectedModel, setSelectedModel] = useState<PoolModel | null>(null)
  const [selectedDimension, setSelectedDimension] = useState<string>('')
  const [selectedFinish, setSelectedFinish] = useState<string>('Tradicional')
  const [poolSearch, setPoolSearch] = useState('')

  // ETAPA 3: MATERIAIS E SERVIÇOS INCLUSOS
  const [includedItemsList, setIncludedItemsList] = useState<string[]>([])

  // ETAPA 4: SELEÇÃO DE OPCIONAIS
  const [selectedOptionals, setSelectedOptionals] = useState<
    Record<string, { item: OptionalItem; qty: number }>
  >({})

  // ETAPA 5: VALORES E PAGAMENTO
  const [basePrice, setBasePrice] = useState<number>(0)
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [paymentCondition, setPaymentCondition] = useState<string>('cartao_12x')
  const [customPaymentText, setCustomPaymentText] = useState<string>('')
  const [downPayment, setDownPayment] = useState<number>(0)
  const [installmentsCount, setInstallmentsCount] = useState<number>(12)

  // ETAPA 6: PRAZO, GARANTIA E OBSERVAÇÕES
  const [warrantyText, setWarrantyText] = useState<string>('')
  const [deliveryDeadline, setDeliveryDeadline] = useState<string>('A combinar')
  const [validityDays, setValidityDays] = useState<number>(5)
  const [clientResponsibilities, setClientResponsibilities] = useState<string[]>([])
  const [observations, setObservations] = useState<string>('')

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [cList, mList, oList, sMap] = await Promise.all([
          clientService.list(),
          poolModelService.list(),
          optionalItemService.list(),
          settingsService.getAll(),
        ])

        setClientsList(cList)
        setPoolModels(mList)
        setOptionalItems(oList)
        setSystemSettings(sMap)

        // Preencher textos padrão das configurações
        if (sMap.included_items) {
          setIncludedItemsList(sMap.included_items)
        }
        if (sMap.warranty_text) {
          setWarrantyText(sMap.warranty_text.text || '')
        }
        if (sMap.delivery_deadline) {
          setDeliveryDeadline(sMap.delivery_deadline.text || 'A combinar')
        }
        if (sMap.validity_days) {
          setValidityDays(sMap.validity_days.days || 5)
        }
        if (sMap.client_responsibilities) {
          setClientResponsibilities(sMap.client_responsibilities)
        }

        // Se veio clientId pela URL, pré-preencher
        if (prefillClientId) {
          const preClient = cList.find((c) => c.id === prefillClientId)
          if (preClient) {
            selectClient(preClient)
          }
        }

        // Se está editando um orçamento existente
        if (editBudgetId) {
          const b = await budgetService.getById(editBudgetId)
          setBudgetId(b.id)
          setBudgetNumber(b.number)

          if (b.client_snapshot) {
            try {
              const snap = JSON.parse(b.client_snapshot)
              setClientName(snap.name || '')
              setClientPhone(snap.phone || '')
              setClientWhatsapp(snap.phone_whatsapp || '')
              setClientCity(snap.city || '')
              setClientState(snap.state || 'SC')
              setClientAddress(snap.address || '')
              setClientEmail(snap.email || '')
            } catch {
              /* intentionally ignored */
            }
          }

          if (b.consultant_name) setConsultantName(b.consultant_name)

          // Configuração da piscina
          if (b.pool_config) {
            try {
              const cfg = JSON.parse(b.pool_config)
              const m = mList.find((x) => x.id === cfg.model_id || x.name === cfg.model_name)
              if (m) setSelectedModel(m)
              setSelectedDimension(cfg.dimensions || '')
              setSelectedFinish(cfg.finish || 'Tradicional')
            } catch {
              /* intentionally ignored */
            }
          }

          if (b.included_items) {
            try {
              setIncludedItemsList(JSON.parse(b.included_items))
            } catch {
              /* intentionally ignored */
            }
          }

          if (b.optional_items) {
            try {
              const optList: BudgetSelectedOptional[] = JSON.parse(b.optional_items)
              const map: Record<string, { item: OptionalItem; qty: number }> = {}
              for (const opt of optList) {
                const foundItem = oList.find((o) => o.id === opt.id || o.name === opt.name)
                if (foundItem) {
                  map[foundItem.id] = { item: foundItem, qty: opt.qty }
                }
              }
              setSelectedOptionals(map)
            } catch {
              /* intentionally ignored */
            }
          }

          setBasePrice(b.base_price || 0)
          setDiscountValue(b.discount || 0)
          if (b.payment_condition) setPaymentCondition(b.payment_condition)
          if (b.payment_details) setCustomPaymentText(b.payment_details)
          if (b.installment_count) setInstallmentsCount(b.installment_count)
          if (b.warranty_text) setWarrantyText(b.warranty_text)
          if (b.delivery_deadline) setDeliveryDeadline(b.delivery_deadline)
          if (b.validity_days) setValidityDays(b.validity_days)
          if (b.observations) setObservations(b.observations)
        }
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar dados',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [editBudgetId, prefillClientId])

  // Atualizar preço base e acabamento quando o modelo ou dimensão mudam
  useEffect(() => {
    if (!selectedModel) return

    let dims: string[] = []
    try {
      dims = JSON.parse(selectedModel.dimensions || '[]')
    } catch (_) {
      dims = []
    }

    // Se dimensão não selecionada, escolher a primeira
    if (!selectedDimension && dims.length > 0) {
      setSelectedDimension(dims[0])
    }

    // Calcular preço base de acordo com variações
    let price = selectedModel.base_price || 0
    if (selectedModel.variations && selectedDimension) {
      try {
        const varMap = JSON.parse(selectedModel.variations)
        if (varMap[selectedDimension]) {
          price = varMap[selectedDimension]
        }
      } catch {
        /* intentionally ignored */
      }
    }

    setBasePrice(price)
  }, [selectedModel, selectedDimension])

  // Preencher campos a partir de cliente existente
  const selectClient = (c: Client) => {
    setSelectedClientId(c.id)
    setClientName(c.name)
    setClientPhone(c.phone)
    setClientWhatsapp(c.phone_whatsapp || c.phone)
    setClientCity(c.city)
    setClientState(c.state || 'SC')
    setClientAddress(c.address || '')
    setClientEmail(c.email || '')
    setSaveAsClientRecord(false)
  }

  // Calcular totais financeiros
  const optionalsTotal = Object.values(selectedOptionals).reduce((acc, curr) => {
    return acc + curr.item.price * curr.qty
  }, 0)

  const subtotal = basePrice + optionalsTotal
  const userMaxDiscount = user?.discount_limit ?? 10
  const maxAllowedDiscountValue = (subtotal * userMaxDiscount) / 100
  const totalValue = Math.max(0, subtotal - discountValue)

  // Parcela padrão (sem juros inventados)
  const currentInstallments = installmentsCount || 12
  const installmentValue =
    paymentCondition === 'entrada_saldo'
      ? Math.max(0, (totalValue - downPayment) / Math.max(1, currentInstallments))
      : totalValue / Math.max(1, currentInstallments)

  // Autosave rascunho
  const saveDraft = async (silent = true) => {
    if (!clientName.trim()) {
      if (!silent) {
        toast({
          title: 'Atenção',
          description: 'Preencha o nome do cliente antes de salvar o rascunho.',
          variant: 'destructive',
        })
      }
      return null
    }

    setSavingDraft(true)
    try {
      // 1. Persistir cliente se solicitado
      let cId = selectedClientId
      if (saveAsClientRecord && !cId && clientName.trim() && clientPhone.trim()) {
        try {
          const newClient = await clientService.create({
            name: clientName.trim(),
            phone: clientPhone.trim(),
            phone_whatsapp: clientWhatsapp.trim() || clientPhone.trim(),
            city: clientCity.trim() || 'Florianópolis',
            state: clientState || 'SC',
            address: clientAddress.trim(),
            email: clientEmail.trim(),
            created_by: user?.id,
          })
          cId = newClient.id
          setSelectedClientId(cId)
        } catch {
          /* intentionally ignored */
        }
      }

      const clientSnapshot = {
        id: cId,
        name: clientName.trim(),
        phone: clientPhone.trim(),
        phone_whatsapp: clientWhatsapp.trim() || clientPhone.trim(),
        city: clientCity.trim(),
        state: clientState,
        address: clientAddress.trim(),
        email: clientEmail.trim(),
        date: budgetDate,
      }

      const poolConfig: BudgetPoolConfig = {
        model_id: selectedModel?.id || '',
        model_name: selectedModel?.name || '',
        dimensions: selectedDimension || '',
        finish: selectedFinish || 'Tradicional',
        depth: selectedModel?.depth || '1,40 m',
        structure_type: selectedModel?.structure_type || 'Fibra em Gel',
        image: selectedModel ? poolModelService.getImageUrl(selectedModel) : '',
        base_price: basePrice,
        technical_specs: selectedModel?.technical_specs || '',
      }

      const optPayload: BudgetSelectedOptional[] = Object.values(selectedOptionals).map((op) => ({
        id: op.item.id,
        name: op.item.name,
        description: op.item.description,
        category: op.item.category,
        qty: op.qty,
        unit_price: op.item.price,
        total_price: op.item.price * op.qty,
        image: op.item.image,
      }))

      const budgetData: Partial<Budget> = {
        client_id: cId || undefined,
        client_snapshot: JSON.stringify(clientSnapshot),
        consultant_id: user?.id,
        consultant_name: consultantName,
        pool_model_id: selectedModel?.id || undefined,
        pool_config: JSON.stringify(poolConfig),
        included_items: JSON.stringify(includedItemsList),
        optional_items: JSON.stringify(optPayload),
        base_price: basePrice,
        optional_total: optionalsTotal,
        discount: discountValue,
        total_value: totalValue,
        payment_condition: paymentCondition,
        payment_details:
          paymentCondition === 'personalizada'
            ? customPaymentText
            : paymentCondition === 'entrada_saldo'
              ? `Entrada de ${formatBRL(downPayment)} + ${currentInstallments}x de ${formatBRL(installmentValue)}`
              : `Em até ${currentInstallments}x de ${formatBRL(installmentValue)}`,
        installment_count: currentInstallments,
        installment_value: installmentValue,
        validity_days: validityDays,
        warranty_text: warrantyText,
        delivery_deadline: deliveryDeadline,
        client_responsibilities: JSON.stringify(clientResponsibilities),
        observations: observations,
        status: 'Rascunho',
      }

      let savedRecord: Budget
      if (budgetId) {
        savedRecord = await budgetService.update(budgetId, budgetData)
      } else {
        savedRecord = await budgetService.create(budgetData)
        setBudgetId(savedRecord.id)
        setBudgetNumber(savedRecord.number)
      }

      if (!silent) {
        toast({
          title: 'Rascunho salvo',
          description: `Orçamento ${savedRecord.number || ''} salvo com sucesso.`,
        })
      }
      return savedRecord
    } catch (err: any) {
      if (!silent) {
        toast({
          title: 'Erro ao salvar',
          description: err.message,
          variant: 'destructive',
        })
      }
      return null
    } finally {
      setSavingDraft(false)
    }
  }

  const handleNextStep = async () => {
    // Validações por etapa
    if (currentStep === 1) {
      if (!clientName.trim()) {
        toast({
          title: 'Campo obrigatório',
          description: 'Informe o nome do cliente.',
          variant: 'destructive',
        })
        return
      }
      if (!clientPhone.trim()) {
        toast({
          title: 'Campo obrigatório',
          description: 'Informe o telefone/WhatsApp do cliente.',
          variant: 'destructive',
        })
        return
      }
      if (!clientCity.trim()) {
        toast({
          title: 'Campo obrigatório',
          description: 'Informe a cidade da instalação.',
          variant: 'destructive',
        })
        return
      }
    }

    if (currentStep === 2) {
      if (!selectedModel) {
        toast({
          title: 'Selecione um modelo',
          description: 'Escolha uma piscina do catálogo para prosseguir.',
          variant: 'destructive',
        })
        return
      }
      if (!selectedDimension) {
        toast({
          title: 'Dimensão obrigatória',
          description: 'Escolha uma dimensão disponível para o modelo.',
          variant: 'destructive',
        })
        return
      }
    }

    if (currentStep === 5) {
      if (discountValue > maxAllowedDiscountValue) {
        toast({
          title: 'Limite de desconto excedido',
          description: `Seu limite autorizado é de ${userMaxDiscount}% (${formatBRL(maxAllowedDiscountValue)}).`,
          variant: 'destructive',
        })
        return
      }
    }

    // Salvar rascunho automaticamente a cada avanço
    await saveDraft(true)

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Avançar para revisão final
      const rec = await saveDraft(false)
      if (rec) {
        navigate(`/budgets/${rec.id}`)
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Toggle opcional
  const toggleOptional = (item: OptionalItem) => {
    setSelectedOptionals((prev) => {
      const copy = { ...prev }
      if (copy[item.id]) {
        delete copy[item.id]
      } else {
        copy[item.id] = { item, qty: 1 }
      }
      return copy
    })
  }

  const setOptionalQty = (itemId: string, delta: number) => {
    setSelectedOptionals((prev) => {
      const copy = { ...prev }
      if (!copy[itemId]) return prev
      const newQty = Math.max(1, copy[itemId].qty + delta)
      copy[itemId] = { ...copy[itemId], qty: newQty }
      return copy
    })
  }

  const stepsHeader = [
    { num: 1, title: 'Cliente', icon: User },
    { num: 2, title: 'Piscina', icon: Layers },
    { num: 3, title: 'Inclusos', icon: CheckSquare },
    { num: 4, title: 'Opcionais', icon: Sparkles },
    { num: 5, title: 'Valores', icon: Calculator },
    { num: 6, title: 'Condições', icon: FileCheck },
  ]

  if (loading) {
    return (
      <div className="py-20 text-center text-[#5B6B78] flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#1CA0D8] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Carregando catálogo e configurações...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Cabeçalho do Wizard e indicador de progresso */}
      <div className="bg-white p-5 rounded-2xl border border-[#EDF1F4] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#0B3D5C]">
              {editBudgetId ? 'Editar Orçamento' : 'Novo Orçamento Comercial'}
            </h1>
            <p className="text-xs text-[#5B6B78]">
              {budgetNumber
                ? `Orçamento nº ${budgetNumber}`
                : 'Preencha as 6 etapas para emitir a proposta'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveDraft(false)}
            disabled={savingDraft}
            className="text-xs h-9 gap-1.5 border-[#1CA0D8] text-[#1CA0D8] hover:bg-[#1CA0D8]/10"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{savingDraft ? 'Salvando...' : 'Salvar rascunho'}</span>
          </Button>
        </div>

        {/* Barra de Passos */}
        <div className="grid grid-cols-6 gap-1 md:gap-2 pt-2 border-t border-[#EDF1F4]">
          {stepsHeader.map((s) => {
            const Icon = s.icon
            const isDone = s.num < currentStep
            const isCurrent = s.num === currentStep

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num <= currentStep || budgetId) {
                    setCurrentStep(s.num)
                  }
                }}
                className={`flex flex-col items-center text-center p-1.5 md:p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-[#0B3D5C] text-white shadow-sm'
                    : isDone
                      ? 'bg-[#EDF1F4] text-[#0B3D5C] hover:bg-[#dfe5ea]'
                      : 'text-[#5B6B78]/60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs font-bold mb-1">
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 text-[#2CA35C]" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span className="text-[10px] md:text-xs font-medium truncate w-full hidden sm:block">
                  {s.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* CONTEÚDO DA ETAPA ATUAL */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#EDF1F4] shadow-sm transition-all">
        {/* ========================================================
            ETAPA 1: DADOS DO CLIENTE
           ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#EDF1F4] pb-3">
              <h2 className="text-lg font-bold text-[#0B3D5C] flex items-center gap-2">
                <User className="h-5 w-5 text-[#1CA0D8]" />
                <span>Etapa 1: Dados do Cliente</span>
              </h2>
              <p className="text-xs text-[#5B6B78] mt-0.5">
                Identificação do comprador e local da obra em Santa Catarina ou região.
              </p>
            </div>

            {/* Selecionar cliente pré-existente */}
            {clientsList.length > 0 && (
              <div className="p-4 rounded-xl bg-[#F0F7FB] border border-[#1CA0D8]/20 space-y-2">
                <Label className="text-xs font-semibold text-[#0B3D5C] flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-[#1CA0D8]" />
                  <span>Selecionar cliente já cadastrado</span>
                </Label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    const found = clientsList.find((c) => c.id === e.target.value)
                    if (found) selectClient(found)
                    else setSelectedClientId('')
                  }}
                  className="w-full h-11 rounded-lg border border-[#D6DEE4] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CA0D8]"
                >
                  <option value="">
                    -- Escolher cliente cadastrado ou preencher novo abaixo --
                  </option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.phone} ({c.city}/{c.state})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold">
                  Nome completo do cliente <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: João Carlos da Silva"
                  className="h-11 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(formatPhone(e.target.value))}
                  placeholder="(48) 99999-9999"
                  className="h-11 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">E-mail para envio (opcional)</Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="h-11 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Cidade da instalação <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  placeholder="Ex: Florianópolis"
                  className="h-11 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estado (UF)</Label>
                <select
                  value={clientState}
                  onChange={(e) => setClientState(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#D6DEE4] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CA0D8]"
                >
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold">
                  Endereço da obra / bairro (opcional)
                </Label>
                <Input
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Rua, número, bairro ou condomínio"
                  className="h-11 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Data da proposta</Label>
                <Input
                  type="date"
                  value={budgetDate}
                  onChange={(e) => setBudgetDate(e.target.value)}
                  className="h-11 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Consultor responsável</Label>
                <Input
                  value={consultantName}
                  onChange={(e) => setConsultantName(e.target.value)}
                  placeholder="Nome do consultor"
                  className="h-11 text-sm bg-slate-50"
                />
              </div>
            </div>

            {!selectedClientId && (
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  id="saveClient"
                  checked={saveAsClientRecord}
                  onCheckedChange={(v) => setSaveAsClientRecord(!!v)}
                />
                <Label htmlFor="saveClient" className="text-xs text-[#5B6B78] cursor-pointer">
                  Salvar automaticamente na base de clientes para orçamentos futuros
                </Label>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            ETAPA 2: SELEÇÃO DA PISCINA
           ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#EDF1F4] pb-3">
              <h2 className="text-lg font-bold text-[#0B3D5C] flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#1CA0D8]" />
                <span>Etapa 2: Seleção da Piscina</span>
              </h2>
              <p className="text-xs text-[#5B6B78] mt-0.5">
                Escolha o modelo oficial Beluga, as dimensões e o tipo de acabamento.
              </p>
            </div>

            {/* Busca rápida de modelos */}
            <div className="relative">
              <Search className="h-4 w-4 text-[#5B6B78] absolute left-3 top-3.5" />
              <Input
                value={poolSearch}
                onChange={(e) => setPoolSearch(e.target.value)}
                placeholder="Buscar modelo por nome (ex: Afrodite, Iris, Zeus, Brisêis...)"
                className="pl-9 h-11 text-sm"
              />
            </div>

            {/* Grid visual dos modelos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
              {poolModels
                .filter((m) => m.name.toLowerCase().includes(poolSearch.toLowerCase()))
                .map((m) => {
                  const isSelected = selectedModel?.id === m.id
                  const isPastilhada = m.name.toLowerCase().includes('pastilhada')

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m)
                        try {
                          const dims = JSON.parse(m.dimensions || '[]')
                          if (dims.length > 0) setSelectedDimension(dims[0])
                        } catch {
                          /* intentionally ignored */
                        }
                        setSelectedFinish(isPastilhada ? 'Pastilhada' : 'Tradicional')
                      }}
                      className={`cursor-pointer rounded-xl p-3 border transition-all text-left ${
                        isSelected
                          ? 'border-[#1CA0D8] bg-[#F0F7FB] ring-2 ring-[#1CA0D8]/30 shadow-md'
                          : 'border-[#EDF1F4] bg-white hover:border-[#1CA0D8]/40 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="font-bold text-sm text-[#0B3D5C]">{m.name}</span>
                        {isPastilhada && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1CA0D8]/10 text-[#1CA0D8]">
                            Pastilhada
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5B6B78] line-clamp-2 mb-2">
                        {m.description || 'Piscina de fibra de alta resistência.'}
                      </p>
                      <div className="text-xs font-semibold text-[#1CA0D8]">
                        A partir de {formatBRL(m.base_price)}
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Painel de Configuração do Modelo Escolhido */}
            {selectedModel && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F0F7FB] to-[#EDF1F4]/40 border border-[#1CA0D8]/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1CA0D8]/20 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#1CA0D8] uppercase tracking-wider">
                      Modelo Selecionado
                    </span>
                    <h3 className="text-lg font-black text-[#0B3D5C]">{selectedModel.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#5B6B78]">Valor-base:</span>
                    <p className="text-lg font-black text-[#0B3D5C] tabular-nums">
                      {formatBRL(basePrice)}
                    </p>
                  </div>
                </div>

                {/* Subetapa: Dimensões disponíveis */}
                <div>
                  <Label className="text-xs font-semibold text-[#142A36] mb-2 block">
                    Selecione a Dimensão Disponível:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const dims: string[] = JSON.parse(selectedModel.dimensions || '[]')
                        return dims.map((dim) => (
                          <button
                            key={dim}
                            type="button"
                            onClick={() => setSelectedDimension(dim)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              selectedDimension === dim
                                ? 'bg-[#0B3D5C] text-white shadow-sm'
                                : 'bg-white border border-[#D6DEE4] text-[#142A36] hover:border-[#0B3D5C]'
                            }`}
                          >
                            {dim}
                          </button>
                        ))
                      } catch (_) {
                        return <span className="text-xs text-red-500">Erro ao ler dimensões.</span>
                      }
                    })()}
                  </div>
                </div>

                {/* Subetapa: Acabamento */}
                <div>
                  <Label className="text-xs font-semibold text-[#142A36] mb-2 block">
                    Acabamento da Borda / Estrutura:
                  </Label>
                  <div className="flex gap-2">
                    {['Tradicional', 'Pastilhada'].map((fin) => (
                      <button
                        key={fin}
                        type="button"
                        onClick={() => setSelectedFinish(fin)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          selectedFinish === fin
                            ? 'bg-[#1CA0D8] text-white shadow-sm'
                            : 'bg-white border border-[#D6DEE4] text-[#142A36] hover:border-[#1CA0D8]'
                        }`}
                      >
                        {fin}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedModel.needs_review && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Aviso do Catálogo:</span>{' '}
                      {selectedModel.review_notes ||
                        'Algumas medidas deste modelo necessitam confirmação da fábrica.'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            ETAPA 3: MATERIAIS E SERVIÇOS INCLUSOS
           ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#EDF1F4] pb-3">
              <h2 className="text-lg font-bold text-[#0B3D5C] flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-[#1CA0D8]" />
                <span>Etapa 3: Materiais e Serviços Inclusos</span>
              </h2>
              <p className="text-xs text-[#5B6B78] mt-0.5">
                Itens-padrão já inclusos no valor base da piscina instalada (sem custo adicional).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Tudo incluso na proposta:</strong> Itens carregados automaticamente das
                diretrizes da fábrica. Somente leitura para o consultor comercial.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {includedItemsList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[#EDF1F4] bg-[#F8FAFC] flex items-start gap-2.5 text-xs text-[#142A36]"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            ETAPA 4: SELEÇÃO DE OPCIONAIS
           ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#EDF1F4] pb-3">
              <h2 className="text-lg font-bold text-[#0B3D5C] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#F28C28]" />
                <span>Etapa 4: Seleção de Opcionais e Acessórios</span>
              </h2>
              <p className="text-xs text-[#5B6B78] mt-0.5">
                Tratamento da água, cascatas em inox, iluminação LED e opcionais exclusivos.
              </p>
            </div>

            {/* Agrupamento por Categorias */}
            {[
              'Tratamento da água',
              'Cascatas e acabamento',
              'Iluminação',
              'Acessibilidade',
              'Outros opcionais',
            ].map((cat) => {
              const catItems = optionalItems.filter((i) => i.category === cat)
              if (catItems.length === 0) return null

              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B3D5C] bg-[#EDF1F4]/70 px-3 py-1.5 rounded-lg inline-block">
                    {cat}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {catItems.map((item) => {
                      const selectedInfo = selectedOptionals[item.id]
                      const isChecked = !!selectedInfo

                      // Validação: pastilhado na borda só aplica para fibra em gel tradicional
                      const isPastilhadoNaBorda = item.name
                        .toLowerCase()
                        .includes('pastilhado na borda')
                      const isAlreadyPastilhada = selectedModel?.name
                        .toLowerCase()
                        .includes('pastilhada')

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isChecked
                              ? 'border-[#1CA0D8] bg-[#F0F7FB] shadow-sm'
                              : 'border-[#EDF1F4] bg-white hover:border-[#D6DEE4]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={`opt-${item.id}`}
                              checked={isChecked}
                              onCheckedChange={() => toggleOptional(item)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={`opt-${item.id}`}
                                  className="font-bold text-sm text-[#0B3D5C] cursor-pointer"
                                >
                                  {item.name}
                                </Label>
                                <span className="font-extrabold text-xs text-[#1CA0D8] tabular-nums">
                                  {formatBRL(item.price)}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#5B6B78] mt-1 leading-snug">
                                {item.description}
                              </p>

                              {isPastilhadoNaBorda && isAlreadyPastilhada && (
                                <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                  Piscina já é pastilhada de fábrica
                                </span>
                              )}

                              {/* Stepper de quantidade quando selecionado */}
                              {isChecked && (
                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1CA0D8]/20">
                                  <span className="text-xs text-[#5B6B78]">Quantidade:</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setOptionalQty(item.id, -1)}
                                      className="w-6 h-6 rounded-md bg-white border border-[#D6DEE4] flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="text-xs font-bold w-5 text-center">
                                      {selectedInfo.qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setOptionalQty(item.id, 1)}
                                      className="w-6 h-6 rounded-md bg-white border border-[#D6DEE4] flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Barra fixa de resumo dos opcionais */}
            <div className="p-4 rounded-xl bg-[#0B3D5C] text-white flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs text-[#7CD4EF]">Opcionais Selecionados</span>
                <p className="text-sm font-bold">
                  {Object.keys(selectedOptionals).length} item(ns)
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#7CD4EF]">Total dos Opcionais</span>
                <p className="text-lg font-black text-white tabular-nums">
                  {formatBRL(optionalsTotal)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ETAPA 5: VALORES E PAGAMENTO
           ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#EDF1F4] pb-3">
              <h2 className="text-lg font-bold text-[#0B3D5C] flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#1CA0D8]" />
                <span>Etapa 5: Valores e Condições de Pagamento</span>
              </h2>
              <p className="text-xs text-[#5B6B78] mt-0.5">
                Simulação financeira precisa e cálculo automático de parcelas em até 12x.
              </p>
            </div>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-[#EDF1F4]">
                <span className="text-xs text-[#5B6B78]">Valor-base da piscina:</span>
                <p className="text-lg font-bold text-[#0B3D5C] tabular-nums mt-0.5">
                  {formatBRL(basePrice)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-[#EDF1F4]">
                <span className="text-xs text-[#5B6B78]">Total dos opcionais:</span>
                <p className="text-lg font-bold text-[#1CA0D8] tabular-nums mt-0.5">
                  {formatBRL(optionalsTotal)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-[#EDF1F4]">
                <span className="text-xs text-[#5B6B78]">Subtotal do projeto:</span>
                <p className="text-lg font-bold text-[#142A36] tabular-nums mt-0.5">
                  {formatBRL(subtotal)}
                </p>
              </div>
            </div>

            {/* Campo de Desconto Autorizado */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="discount" className="text-xs font-bold text-amber-900">
                  Desconto Comercial Autorizado (R$)
                </Label>
                <span className="text-[11px] font-semibold text-amber-700">
                  Seu limite máximo: {userMaxDiscount}% ({formatBRL(maxAllowedDiscountValue)})
                </span>
              </div>
              <Input
                id="discount"
                type="number"
                min="0"
                max={maxAllowedDiscountValue}
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="h-11 bg-white text-sm font-semibold"
              />
              {discountValue > maxAllowedDiscountValue && (
                <p className="text-xs text-red-600 font-medium">
                  Atenção: O desconto inserido excede o seu limite autorizado de {userMaxDiscount}%.
                </p>
              )}
            </div>

            {/* Valor Final do Investimento em Grande Destaque */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B3D5C] to-[#125B7C] text-white shadow-lg text-center space-y-1">
              <span className="text-xs uppercase tracking-widest text-[#7CD4EF] font-bold">
                Valor Total do Investimento
              </span>
              <p className="text-3xl md:text-4xl font-black tabular-nums tracking-tight text-white">
                {formatBRL(totalValue)}
              </p>
              <p className="text-xs text-white/80">
                Piscina instalada com todos os materiais, frete e mão de obra de escavação.
              </p>
            </div>

            {/* Opções de Condições de Pagamento */}
            <div className="space-y-4">
              <Label className="text-xs font-bold text-[#0B3D5C] uppercase tracking-wider block">
                Condição Comercial Escolhida:
              </Label>
              <RadioGroup
                value={paymentCondition}
                onValueChange={(val) => setPaymentCondition(val)}
                className="space-y-3"
              >
                <div className="flex items-start gap-3 p-4 rounded-xl border border-[#EDF1F4] bg-white cursor-pointer hover:border-[#1CA0D8]">
                  <RadioGroupItem value="cartao_12x" id="p-12x" className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor="p-12x"
                      className="font-bold text-sm text-[#0B3D5C] cursor-pointer"
                    >
                      Cartão de Crédito em até 12x (Padrão de Fábrica)
                    </Label>
                    <p className="text-xs text-[#5B6B78] mt-0.5">
                      12 parcelas de{' '}
                      <strong className="text-[#0B3D5C] font-black">
                        {formatBRL(totalValue / 12)}
                      </strong>{' '}
                      sem acréscimo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border border-[#EDF1F4] bg-white cursor-pointer hover:border-[#1CA0D8]">
                  <RadioGroupItem value="a_vista" id="p-vista" className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor="p-vista"
                      className="font-bold text-sm text-[#0B3D5C] cursor-pointer"
                    >
                      À Vista (Transferência / PIX)
                    </Label>
                    <p className="text-xs text-[#5B6B78] mt-0.5">
                      Investimento integral de {formatBRL(totalValue)} na confirmação do pedido.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border border-[#EDF1F4] bg-white cursor-pointer hover:border-[#1CA0D8]">
                  <RadioGroupItem value="entrada_saldo" id="p-entrada" className="mt-1" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label
                        htmlFor="p-entrada"
                        className="font-bold text-sm text-[#0B3D5C] cursor-pointer"
                      >
                        Entrada + Saldo Parcelado
                      </Label>
                      <p className="text-xs text-[#5B6B78] mt-0.5">
                        Sinal na contratação e saldo remanescente em parcelas combinadas.
                      </p>
                    </div>

                    {paymentCondition === 'entrada_saldo' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <Label className="text-xs text-[#5B6B78]">Valor da entrada (R$)</Label>
                          <Input
                            type="number"
                            value={downPayment || ''}
                            onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 5000"
                            className="h-10 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-[#5B6B78]">Número de parcelas</Label>
                          <Input
                            type="number"
                            min="1"
                            max="24"
                            value={installmentsCount}
                            onChange={(e) =>
                              setInstallmentsCount(parseInt(e.target.value, 10) || 12)
                            }
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border border-[#EDF1F4] bg-white cursor-pointer hover:border-[#1CA0D8]">
                  <RadioGroupItem value="personalizada" id="p-custom" className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <Label
                      htmlFor="p-custom"
                      className="font-bold text-sm text-[#0B3D5C] cursor-pointer"
                    >
                      Condição Especial Personalizada
                    </Label>
                    {paymentCondition === 'personalizada' && (
                      <Textarea
                        value={customPaymentText}
                        onChange={(e) => setCustomPaymentText(e.target.value)}
                        placeholder="Ex: 30% de entrada, 30% na entrega e saldo em 6x no boleto bancário..."
                        className="text-xs"
                      />
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* ========================================================
            ETAPA 6: PRAZO, GARANTIA E OBSERVAÇÕES
           ======================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#EDF1F4] pb-3">
              <h2 className="text-lg font-bold text-[#0B3D5C] flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#1CA0D8]" />
                <span>Etapa 6: Prazo, Garantia e Observações</span>
              </h2>
              <p className="text-xs text-[#5B6B78] mt-0.5">
                Cláusulas contratuais oficiais, responsabilidades do cliente e notas finais.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0B3D5C]">Garantia de Fábrica</Label>
                <Textarea
                  value={warrantyText}
                  onChange={(e) => setWarrantyText(e.target.value)}
                  className="text-xs leading-relaxed h-20 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#0B3D5C]">
                    Prazo de Entrega / Início
                  </Label>
                  <Input
                    value={deliveryDeadline}
                    onChange={(e) => setDeliveryDeadline(e.target.value)}
                    placeholder="A combinar"
                    className="h-11 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#0B3D5C]">
                    Validade da Proposta (dias)
                  </Label>
                  <Input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value, 10) || 5)}
                    className="h-11 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#0B3D5C]">
                  Responsabilidades do Cliente (Contratual)
                </Label>
                <div className="p-4 rounded-xl bg-slate-50 border border-[#EDF1F4] space-y-2 text-xs text-[#5B6B78]">
                  {clientResponsibilities.map((resp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-bold text-[#0B3D5C]">•</span>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0B3D5C]">
                  Observações Comerciais da Negociação
                </Label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Informações adicionais acertadas com o cliente sobre o terreno, horários de acesso ou especificações especiais..."
                  className="text-xs h-24"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BARRA FIXA DE NAVEGAÇÃO ENTRE ETAPAS (MOBILE & DESKTOP) */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#EDF1F4]">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="h-12 px-6 rounded-xl text-xs font-semibold"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          <span>Voltar</span>
        </Button>

        <div className="text-xs text-[#5B6B78] font-medium hidden sm:block">
          Etapa {currentStep} de 6
        </div>

        <Button
          onClick={handleNextStep}
          disabled={savingDraft}
          className="h-12 px-8 bg-[#0B3D5C] hover:bg-[#125B7C] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
        >
          <span>{currentStep === 6 ? 'Avançar para Revisão e PDF' : 'Avançar'}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
