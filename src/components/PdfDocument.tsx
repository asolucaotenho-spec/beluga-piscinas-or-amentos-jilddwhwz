import React from 'react'
import type { Budget, BudgetPoolConfig, BudgetSelectedOptional, Client } from '@/types/beluga'
import { formatBRL } from '@/lib/formatters'
import { BelugaLogo } from '@/components/BelugaLogo'
import {
  Check,
  ShieldCheck,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react'

interface PdfDocumentProps {
  budget: Budget
}

export const PdfDocument: React.FC<PdfDocumentProps> = ({ budget }) => {
  let client: Partial<Client> = {}
  try {
    client = budget.client_snapshot ? JSON.parse(budget.client_snapshot) : {}
  } catch {
    /* intentionally ignored */
  }

  let poolConfig: Partial<BudgetPoolConfig> = {}
  try {
    poolConfig = budget.pool_config ? JSON.parse(budget.pool_config) : {}
  } catch {
    /* intentionally ignored */
  }

  let includedList: string[] = []
  try {
    includedList = budget.included_items ? JSON.parse(budget.included_items) : []
  } catch {
    /* intentionally ignored */
  }

  let optionalList: BudgetSelectedOptional[] = []
  try {
    optionalList = budget.optional_items ? JSON.parse(budget.optional_items) : []
  } catch {
    /* intentionally ignored */
  }

  let responsibilities: string[] = []
  try {
    responsibilities = budget.client_responsibilities
      ? JSON.parse(budget.client_responsibilities)
      : []
  } catch {
    /* intentionally ignored */
  }

  const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(budget.created || Date.now()))

  return (
    <div className="pdf-print-container bg-white text-[#142A36] max-w-[210mm] mx-auto shadow-2xl rounded-sm print:shadow-none print:m-0 print:w-full print:max-w-none text-sm font-sans antialiased">
      {/* ========================================================
          PÁGINA 1: CAPA PREMIUM
         ======================================================== */}
      <section className="pdf-page relative flex flex-col justify-between min-h-[297mm] p-[16mm] bg-gradient-to-b from-white via-[#F0F7FB] to-[#E5F2F8] border-b border-[#EDF1F4] print:border-none print:page-break-after-always">
        {/* Topo da Capa */}
        <div className="flex items-center justify-between border-b border-[#1CA0D8]/30 pb-6">
          <BelugaLogo size="lg" />
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-[#0B3D5C] text-white text-[11px] font-bold uppercase tracking-wider">
              Proposta Comercial Exclusiva
            </span>
            <p className="text-xs text-[#5B6B78] mt-1 font-mono font-medium">
              Nº {budget.number || 'ORG-2025-0001'}
            </p>
          </div>
        </div>

        {/* Centro da Capa */}
        <div className="my-auto py-10 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1CA0D8]/15 text-[#0B3D5C] text-xs font-bold uppercase tracking-widest">
            Fábrica Taquara/RS • Santa Catarina
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#0B3D5C] leading-tight tracking-tight">
            Seu projeto de piscina começa aqui.
          </h1>

          <p className="text-base text-[#5B6B78] max-w-lg leading-relaxed">
            Apresentamos a proposta comercial sob medida para realizar o lazer da sua família com a
            máxima segurança, durabilidade e sofisticação.
          </p>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-[#1CA0D8]/30 space-y-3 max-w-md">
            <div className="text-xs text-[#1CA0D8] font-bold uppercase tracking-wider">
              Destinatário da Proposta
            </div>
            <div className="text-xl font-black text-[#0B3D5C]">
              {client.name || 'Cliente Especial'}
            </div>
            <div className="text-xs text-[#5B6B78] space-y-0.5">
              <p>
                <strong>Cidade da obra:</strong> {client.city || 'Santa Catarina'} -{' '}
                {client.state || 'SC'}
              </p>
              <p>
                <strong>Telefone/WhatsApp:</strong> {client.phone || '(48) 99110-4301'}
              </p>
              {client.address && (
                <p>
                  <strong>Endereço:</strong> {client.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé da Capa */}
        <div className="border-t border-[#1CA0D8]/30 pt-6 flex items-center justify-between text-xs text-[#5B6B78]">
          <div>
            <p className="font-semibold text-[#0B3D5C]">
              Consultor de Vendas: {budget.consultant_name || 'Equipe Comercial Beluga'}
            </p>
            <p>Contato: (48) 99110-4301</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[#0B3D5C]">{dateFormatted}</p>
            <p>www.piscinasbeluga.com.br</p>
          </div>
        </div>
      </section>

      {/* ========================================================
          PÁGINA 2: APRESENTAÇÃO TÉCNICA DO MODELO ESCOLHIDO
         ======================================================== */}
      <section className="pdf-page flex flex-col justify-between min-h-[297mm] p-[16mm] border-b border-[#EDF1F4] print:border-none print:page-break-after-always">
        <div>
          {/* Header da Página */}
          <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4 mb-8">
            <BelugaLogo size="sm" />
            <span className="text-xs font-semibold text-[#5B6B78]">
              Orçamento nº {budget.number} • Modelo Oficial Beluga
            </span>
          </div>

          <div className="mb-6">
            <span className="text-xs font-bold text-[#1CA0D8] uppercase tracking-wider">
              Apresentação Técnica
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3D5C]">
              Piscina Modelo {poolConfig.model_name || 'Beluga Premium'}
            </h2>
          </div>

          {/* Ficha Técnica em Cards Elegantes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-[#F0F7FB] border border-[#1CA0D8]/20">
              <span className="text-[11px] font-bold text-[#5B6B78] uppercase">Dimensões</span>
              <p className="text-base font-black text-[#0B3D5C] mt-1">
                {poolConfig.dimensions || 'Sob medida'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F0F7FB] border border-[#1CA0D8]/20">
              <span className="text-[11px] font-bold text-[#5B6B78] uppercase">Profundidade</span>
              <p className="text-base font-black text-[#0B3D5C] mt-1">
                {poolConfig.depth || '1,40 m'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F0F7FB] border border-[#1CA0D8]/20">
              <span className="text-[11px] font-bold text-[#5B6B78] uppercase">Estrutura</span>
              <p className="text-base font-black text-[#0B3D5C] mt-1">
                {poolConfig.structure_type || 'Fibra em Gel'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#F0F7FB] border border-[#1CA0D8]/20">
              <span className="text-[11px] font-bold text-[#5B6B78] uppercase">Acabamento</span>
              <p className="text-base font-black text-[#0B3D5C] mt-1">
                {poolConfig.finish || 'Tradicional'}
              </p>
            </div>
          </div>

          {/* Destaque Institucional de Qualidade Beluga */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B3D5C] to-[#125B7C] text-white space-y-3 mb-8">
            <div className="flex items-center gap-2 text-[#F28C28]">
              <Award className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                15 Anos de Garantia Estrutural de Fábrica
              </span>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              Produzida com tecnologia naval em resinas de alto desempenho e barreira química
              anticorrosiva em nossa fábrica em Taquara/RS. Sua piscina é inspecionada peça por peça
              antes do transporte e assentamento.
            </p>
          </div>

          {/* Especificações técnicas complementares */}
          {poolConfig.technical_specs && (
            <div className="p-4 rounded-xl bg-[#EDF1F4]/50 border border-[#EDF1F4] text-xs text-[#5B6B78]">
              <strong className="text-[#0B3D5C] block mb-1">Notas Técnicas do Modelo:</strong>
              {poolConfig.technical_specs}
            </div>
          )}
        </div>

        {/* Rodapé da página 2 */}
        <div className="border-t border-[#EDF1F4] pt-4 flex items-center justify-between text-[11px] text-[#5B6B78]">
          <span>Beluga Piscinas • Fábrica Taquara/RS</span>
          <span>Página 2 de 4</span>
        </div>
      </section>

      {/* ========================================================
          PÁGINA 3: MATERIAIS INCLUSOS E OPCIONAIS CONTRATADOS
         ======================================================== */}
      <section className="pdf-page flex flex-col justify-between min-h-[297mm] p-[16mm] border-b border-[#EDF1F4] print:border-none print:page-break-after-always">
        <div>
          <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4 mb-6">
            <BelugaLogo size="sm" />
            <span className="text-xs font-semibold text-[#5B6B78]">
              Orçamento nº {budget.number} • Escopo Fornecido
            </span>
          </div>

          {/* Seção 1: O que está incluso no pacote base */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Check className="h-4 w-4 text-[#2CA35C]" />
              <h3 className="text-base font-bold text-[#0B3D5C] uppercase tracking-wide">
                Materiais e Serviços Inclusos (Sem Custo Adicional)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {includedList.map((item, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#EDF1F4] flex items-start gap-2"
                >
                  <span className="text-[#2CA35C] font-bold">✓</span>
                  <span className="text-[#142A36] leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Seção 2: Opcionais Contratados */}
          {optionalList.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#F28C28]" />
                <h3 className="text-base font-bold text-[#0B3D5C] uppercase tracking-wide">
                  Opcionais e Acessórios Contratados
                </h3>
              </div>

              <div className="border border-[#EDF1F4] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EDF1F4] text-[#0B3D5C] font-bold">
                    <tr>
                      <th className="p-3">Item / Descrição</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3 text-center">Qtd</th>
                      <th className="p-3 text-right">Valor Unit.</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF1F4]">
                    {optionalList.map((op, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-[#142A36]">{op.name}</td>
                        <td className="p-3 text-[#5B6B78]">{op.category}</td>
                        <td className="p-3 text-center font-bold">{op.qty}</td>
                        <td className="p-3 text-right tabular-nums">{formatBRL(op.unit_price)}</td>
                        <td className="p-3 text-right font-bold text-[#0B3D5C] tabular-nums">
                          {formatBRL(op.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé da página 3 */}
        <div className="border-t border-[#EDF1F4] pt-4 flex items-center justify-between text-[11px] text-[#5B6B78]">
          <span>Beluga Piscinas • Conectando sua família ao melhor lazer</span>
          <span>Página 3 de 4</span>
        </div>
      </section>

      {/* ========================================================
          PÁGINA 4: INVESTIMENTO TOTAL, CONDIÇÕES E ENCERRAMENTO
         ======================================================== */}
      <section className="pdf-page flex flex-col justify-between min-h-[297mm] p-[16mm] print:page-break-after-avoid">
        <div>
          <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4 mb-6">
            <BelugaLogo size="sm" />
            <span className="text-xs font-semibold text-[#5B6B78]">
              Orçamento nº {budget.number} • Proposta Final
            </span>
          </div>

          {/* Card Central de Investimento */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#0B3D5C] text-white shadow-xl mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#7CD4EF] font-bold">
                  Resumo Financeiro da Proposta
                </span>
                <h3 className="text-lg font-bold mt-0.5">Piscina Completa Instalada</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/70">Investimento Total:</span>
                <p className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tight">
                  {formatBRL(budget.total_value)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/10 p-3 rounded-xl">
                <span className="text-white/70 block">Valor-base Piscina:</span>
                <strong className="text-sm tabular-nums">{formatBRL(budget.base_price)}</strong>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <span className="text-white/70 block">Opcionais:</span>
                <strong className="text-sm tabular-nums">{formatBRL(budget.optional_total)}</strong>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <span className="text-white/70 block">Desconto Aplicado:</span>
                <strong className="text-sm text-emerald-300 tabular-nums">
                  - {formatBRL(budget.discount || 0)}
                </strong>
              </div>
              <div className="bg-[#1CA0D8] p-3 rounded-xl text-white">
                <span className="text-white/80 block">Condição Padrão:</span>
                <strong className="text-xs block">
                  {budget.payment_details || 'Em até 12x no cartão de crédito'}
                </strong>
              </div>
            </div>
          </div>

          {/* Cláusulas Contratuais e Responsabilidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
            {/* Responsabilidades do cliente */}
            <div className="p-4 rounded-xl border border-[#EDF1F4] bg-[#F8FAFC]">
              <h4 className="font-bold text-[#0B3D5C] mb-2 uppercase tracking-wide">
                Responsabilidades a Fornecer pelo Cliente:
              </h4>
              <ul className="space-y-1 text-[#5B6B78] list-disc list-inside">
                {responsibilities.map((r, idx) => (
                  <li key={idx} className="leading-tight">
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Garantia e Prazos */}
            <div className="p-4 rounded-xl border border-[#EDF1F4] bg-[#F8FAFC] space-y-3">
              <div>
                <h4 className="font-bold text-[#0B3D5C] uppercase tracking-wide">
                  Garantia de Fábrica (15 Anos):
                </h4>
                <p className="text-[#5B6B78] mt-1 leading-relaxed">
                  {budget.warranty_text ||
                    'As piscinas Beluga, com fábrica em Taquara/RS, possuem garantia de 15 (quinze) anos de fábrica.'}
                </p>
              </div>
              <div className="pt-2 border-t border-[#EDF1F4] flex justify-between">
                <span>
                  <strong>Prazo de entrega:</strong> {budget.delivery_deadline || 'A combinar'}
                </span>
                <span>
                  <strong>Validade da proposta:</strong> {budget.validity_days || 5} dias
                </span>
              </div>
            </div>
          </div>

          {/* Observações da Negociação se houver */}
          {budget.observations && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 mb-6">
              <strong>Observações Específicas:</strong> {budget.observations}
            </div>
          )}

          {/* Frase oficial de encerramento da marca */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#F0F7FB] to-white border border-[#1CA0D8]/30 text-center space-y-2">
            <p className="text-sm md:text-base font-bold italic text-[#0B3D5C]">
              “A piscina é um bem para a vida toda, e a Beluga Piscinas é a parceira certa para
              realizar este projeto!”
            </p>
            <p className="text-xs text-[#5B6B78]">
              Acesse nosso site{' '}
              <strong className="text-[#1CA0D8]">www.piscinasbeluga.com.br</strong> e confira nossa
              linha completa.
            </p>
          </div>
        </div>

        {/* Rodapé Oficial com Assinatura */}
        <div className="border-t border-[#EDF1F4] pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#5B6B78] gap-4">
          <div>
            <p className="font-bold text-[#0B3D5C]">
              {budget.consultant_name || 'Consultor Comercial Beluga Piscinas'}
            </p>
            <p>Atendimento Comercial • (48) 99110-4301</p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-mono text-[11px]">Proposta gerada em {dateFormatted}</p>
            <p className="text-[10px] text-[#5B6B78]/70">
              Válido por {budget.validity_days || 5} dias após a data de envio.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
