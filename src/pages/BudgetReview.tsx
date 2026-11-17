import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { budgetService } from '@/services/api'
import type { Budget, BudgetStatus } from '@/types/beluga'
import { PdfDocument } from '@/components/PdfDocument'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { buildClientWhatsAppLink } from '@/lib/whatsapp'
import {
  FileText,
  Edit,
  Share2,
  Mail,
  Printer,
  Download,
  Copy,
  ChevronLeft,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  MessageCircle,
} from 'lucide-react'

export const BudgetReview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [budget, setBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let cancelled = false

    // O useEffect não pode ser async: disparamos a busca por uma função
    // síncrona e cancelamos o estado se o componente desmontar/trocar de id.
    const loadBudget = () => {
      budgetService
        .getById(id)
        .then((data) => {
          if (!cancelled) setBudget(data)
        })
        .catch((err: any) => {
          if (cancelled) return
          toast({
            title: 'Erro ao carregar orçamento',
            description: err.message,
            variant: 'destructive',
          })
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    loadBudget()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="py-20 text-center text-[#5B6B78] flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#1CA0D8] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Carregando visualização da proposta comercial...</p>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-base text-red-600 font-bold">Orçamento não encontrado.</p>
        <Link to="/budgets">
          <Button variant="outline">Voltar para a lista</Button>
        </Link>
      </div>
    )
  }

  let clientName = 'Cliente'
  try {
    if (budget.client_snapshot) {
      const snap = JSON.parse(budget.client_snapshot)
      if (snap.name) clientName = snap.name
    }
  } catch {
    /* intentionally ignored */
  }

  const fileName = `Beluga_Piscinas_Orcamento_${clientName.replace(/\s+/g, '_')}_${budget.number || budget.id}.pdf`

  // Disparar impressão nativa do navegador (gera PDF A4 perfeito e selecionável)
  const handlePrint = () => {
    window.print()
  }

  // Atualizar status
  const handleUpdateStatus = async (newStatus: BudgetStatus) => {
    setUpdatingStatus(true)
    try {
      const updated = await budgetService.update(budget.id, { status: newStatus })
      setBudget(updated)
      toast({
        title: 'Status atualizado',
        description: `Orçamento marcado como "${newStatus}".`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Compartilhar WhatsApp (usa o número base da equipe das configurações,
  // padrão 48 99110-4301, como contato remetente na mensagem)
  const handleShareWhatsApp = async () => {
    let clientPhone = ''
    try {
      if (budget.client_snapshot) {
        const snap = JSON.parse(budget.client_snapshot)
        clientPhone = snap.phone_whatsapp || snap.phone || ''
      }
    } catch {
      /* intentionally ignored */
    }

    const waUrl = await buildClientWhatsAppLink(
      clientPhone,
      `Olá! Segue a proposta comercial da Beluga Piscinas (Orçamento nº ${budget.number}). Ficamos à total disposição para realizar seu projeto!`,
    )
    window.open(waUrl, '_blank')
  }

  // Compartilhar por E-mail
  const handleShareEmail = () => {
    let clientEmail = ''
    try {
      if (budget.client_snapshot) {
        const snap = JSON.parse(budget.client_snapshot)
        clientEmail = snap.email || ''
      }
    } catch {
      /* intentionally ignored */
    }

    const subject = encodeURIComponent(
      `Proposta Comercial Beluga Piscinas - Orçamento ${budget.number}`,
    )
    const body = encodeURIComponent(
      `Olá!\n\nConforme conversamos, segue em anexo a proposta comercial personalizada para a sua piscina Beluga.\n\nAtenciosamente,\n${budget.consultant_name || 'Equipe Comercial Beluga Piscinas'}`,
    )

    window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`
  }

  // Duplicar orçamento
  const handleDuplicate = async () => {
    try {
      const duplicated = await budgetService.duplicate(
        budget.id,
        user?.id || '',
        user?.name || 'Consultor',
      )
      toast({
        title: 'Orçamento duplicado',
        description: 'Nova cópia criada com sucesso como rascunho.',
      })
      navigate(`/budgets/new?id=${duplicated.id}`)
    } catch (err: any) {
      toast({
        title: 'Erro ao duplicar',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Criar nova versão (editando e versionando)
  const handleCreateNewVersion = () => {
    navigate(`/budgets/new?id=${budget.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior (Oculta na Impressão/PDF) */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-[#EDF1F4] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/budgets')}
              className="h-9 px-3 rounded-xl text-xs gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#0B3D5C]">Orçamento {budget.number}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1CA0D8]/10 text-[#1CA0D8]">
                  v{budget.version || 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-[#142A36]">
                  {budget.status}
                </span>
              </div>
              <p className="text-xs text-[#5B6B78] mt-0.5">
                Cliente: {clientName} • Consultor: {budget.consultant_name}
              </p>
            </div>
          </div>

          {/* Troca Rápida de Status Comercial */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5B6B78] font-medium hidden sm:inline">Status:</span>
            <select
              value={budget.status}
              disabled={updatingStatus}
              onChange={(e) => handleUpdateStatus(e.target.value as BudgetStatus)}
              className="h-9 rounded-xl border border-[#D6DEE4] bg-white px-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1CA0D8]"
            >
              <option value="Rascunho">Rascunho</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Enviado">Enviado</option>
              <option value="Em negociação">Em negociação</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Recusado">Recusado</option>
              <option value="Expirado">Expirado</option>
            </select>
          </div>
        </div>

        {/* Grid de Botões Principais de Ação */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#EDF1F4]">
          <Button
            onClick={handlePrint}
            className="h-11 bg-[#0B3D5C] hover:bg-[#125B7C] text-white rounded-xl text-xs font-bold gap-2 shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Gerar / Baixar PDF</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleShareWhatsApp()}
            className="h-11 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold gap-2"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>WhatsApp</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleShareEmail}
            className="h-11 border-[#1CA0D8] text-[#1CA0D8] hover:bg-[#1CA0D8]/10 rounded-xl text-xs font-bold gap-2"
          >
            <Mail className="h-4 w-4" />
            <span>E-mail</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleCreateNewVersion}
            className="h-11 rounded-xl text-xs font-bold gap-2"
          >
            <Edit className="h-4 w-4" />
            <span>Editar Proposta</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleDuplicate}
            className="h-11 rounded-xl text-xs font-bold gap-2"
          >
            <Copy className="h-4 w-4" />
            <span>Duplicar</span>
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            className="h-11 rounded-xl text-xs font-bold gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir A4</span>
          </Button>
        </div>
      </div>

      {/* RENDERIZAÇÃO REAL DO DOCUMENTO PDF A4 */}
      <div className="print:m-0 print:p-0">
        <PdfDocument budget={budget} />
      </div>
    </div>
  )
}
