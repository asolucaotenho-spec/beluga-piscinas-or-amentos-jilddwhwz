import React from 'react'
import type { Budget, BudgetPoolConfig, BudgetSelectedOptional, Client } from '@/types/beluga'
import { formatBRL } from '@/lib/formatters'
import { BelugaLogo } from '@/components/BelugaLogo'
import { Check, ShieldCheck, Sparkles, Award, Phone, Mail, MapPin, Calendar } from 'lucide-react'

interface PdfDocumentProps {
  budget: Budget
}

interface OptionalChunkPage {
  items: BudgetSelectedOptional[]
  chunkIndex: number
  totalChunks: number
  showNoticeCard: boolean
}

// Categorias organizadas
const CATEGORY_LABELS: Record<string, string> = {
  Acessórios: 'ACESSÓRIOS',
  Opcionais: 'OPCIONAIS',
  'Tratamento da água': 'TRATAMENTO DA ÁGUA',
  'Cascatas e acabamento': 'CASCATAS & ACABAMENTO',
  Iluminação: 'ILUMINAÇÃO',
  Acessibilidade: 'ACESSIBILIDADE',
  'Outros opcionais': 'OUTROS OPCIONAIS',
}

const CATEGORY_SUBTITLES: Record<string, string> = {
  Acessórios: 'Itens de apoio, segurança, iluminação e praticidade',
  Opcionais: 'Acabamentos personalizados, pastilhados e cascatas decorativas',
  'Tratamento da água': 'Equipamentos modernos para pureza e desinfecção cristalina',
  'Cascatas e acabamento': 'Design arquitetônico, hidroterapia e acabamentos finos',
  Iluminação: 'Tecnologia LED premium para conforto e segurança noturna',
  Acessibilidade: 'Apoio e acessibilidade para toda a família',
  'Outros opcionais': 'Soluções adicionais sob medida para o seu projeto',
}

export const PdfDocument: React.FC<PdfDocumentProps> = ({ budget }) => {
  let client: Partial<Client> = {}
  try {
    client = budget.client_snapshot ? JSON.parse(budget.client_snapshot) : {}
  } catch {
    /* ignore */
  }

  let poolConfig: Partial<BudgetPoolConfig> = {}
  try {
    poolConfig = budget.pool_config ? JSON.parse(budget.pool_config) : {}
  } catch {
    /* ignore */
  }

  let includedList: string[] = []
  try {
    includedList = budget.included_items ? JSON.parse(budget.included_items) : []
  } catch {
    /* ignore */
  }

  let optionalList: BudgetSelectedOptional[] = []
  try {
    optionalList = budget.optional_items ? JSON.parse(budget.optional_items) : []
  } catch {
    /* ignore */
  }

  let responsibilities: string[] = []
  try {
    responsibilities = budget.client_responsibilities
      ? JSON.parse(budget.client_responsibilities)
      : []
  } catch {
    /* ignore */
  }

  const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(budget.created || Date.now()))

  const consultantName = budget.consultant_name || 'Rafael Pegoraro'

  // ========================================================
  // PAGINAÇÃO DINÂMICA DE OPCIONAIS / ACESSÓRIOS
  // ========================================================
  // No A4 com cabeçalho (logo + num) e rodapé (Beluga Piscinas • Página X de Y),
  // se houver o card de aviso "Como incluir qualquer item" no final da página,
  // cabem confortavelmente até 6 linhas de tabela com descrição.
  // Sem o card de aviso (em páginas intermediárias), cabem até 8 linhas.
  // Se houver mais de 6 itens, quebramos dinamicamente:
  // - Se total <= 6: 1 página com todos os itens + card de aviso.
  // - Se total > 6: paginamos em blocos de no máximo 7 itens, reservando a última
  //   página para caber até 6 itens junto com o card de aviso.
  const paginateOptionals = (items: BudgetSelectedOptional[]): OptionalChunkPage[] => {
    if (items.length === 0) return []

    // Caso 1: cabe em uma única folha
    if (items.length <= 6) {
      return [
        {
          items,
          chunkIndex: 0,
          totalChunks: 1,
          showNoticeCard: true,
        },
      ]
    }

    // Caso 2: precisa de 2 ou mais folhas
    // Queremos que a última página tenha no máximo 6 itens para comportar o aviso
    const chunks: BudgetSelectedOptional[][] = []
    let remaining = [...items]

    while (remaining.length > 0) {
      // Se o que resta já cabe com folga na última folha junto com o aviso (<= 6)
      if (remaining.length <= 6) {
        chunks.push(remaining)
        break
      }

      // Se restar 7 itens, não podemos tirar 7 e deixar 0, pois 7 com aviso transborda levemente.
      // Melhor tirar 4 e deixar 3 na última folha!
      if (remaining.length === 7) {
        chunks.push(remaining.slice(0, 4))
        remaining = remaining.slice(4)
        continue
      }

      // Para páginas cheias sem o card de aviso, pegamos até 6 ou 7 itens
      const takeCount = Math.min(6, remaining.length - 2) // garante que sobram ao menos 2 pra próxima
      chunks.push(remaining.slice(0, takeCount))
      remaining = remaining.slice(takeCount)
    }

    return chunks.map((chunkItems, idx) => ({
      items: chunkItems,
      chunkIndex: idx,
      totalChunks: chunks.length,
      showNoticeCard: idx === chunks.length - 1,
    }))
  }

  const optionalPages = paginateOptionals(optionalList)

  // Cálculo do número total de páginas da proposta
  // Página 1: Capa
  // Página 2: Modelo Técnico
  // Página 3: Materiais Inclusos no Pacote Base
  // Páginas 4..4+N: Opcionais & Acessórios Cotados (N = optionalPages.length)
  // Última Página: Resumo Financeiro, Condições e Encerramento
  const basePagesBeforeOptionals = 3
  const optionalsPageCount = optionalPages.length > 0 ? optionalPages.length : 1
  const totalPages = basePagesBeforeOptionals + optionalsPageCount + 1

  return (
    <div className="pdf-print-container bg-white text-[#142A36] max-w-[210mm] mx-auto shadow-2xl rounded-sm print:shadow-none print:m-0 print:w-full print:max-w-none text-sm font-sans antialiased">
      {/* ========================================================
          PÁGINA 1: CAPA PREMIUM
         ======================================================== */}
      <section className="pdf-page relative flex flex-col justify-between p-[14mm] bg-gradient-to-b from-white via-[#F0F7FB] to-[#E5F2F8] border-b border-[#EDF1F4] print:border-none print:page-break-after-always">
        {/* Topo da Capa */}
        <div className="flex items-center justify-between border-b border-[#1CA0D8]/30 pb-5">
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
        <div className="my-auto py-8 space-y-6">
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
            <div className="text-xs text-[#5B6B78] space-y-1">
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
        <div className="border-t border-[#1CA0D8]/30 pt-5 flex items-center justify-between text-xs text-[#5B6B78]">
          <div>
            <p className="font-semibold text-[#0B3D5C]">Consultor de Vendas: {consultantName}</p>
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
      <section className="pdf-page flex flex-col justify-between p-[14mm] border-b border-[#EDF1F4] print:border-none print:page-break-after-always">
        <div>
          {/* Header da Página */}
          <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4 mb-6">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B3D5C] to-[#125B7C] text-white space-y-3 mb-6">
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
          <span>Beluga Piscinas • Proposta Comercial</span>
          <span className="font-semibold text-[#0B3D5C]">Página 2 de {totalPages}</span>
        </div>
      </section>

      {/* ========================================================
          PÁGINA 3: MATERIAIS E SERVIÇOS INCLUSOS NO PACOTE BASE
         ======================================================== */}
      <section className="pdf-page flex flex-col justify-between p-[14mm] border-b border-[#EDF1F4] print:border-none print:page-break-after-always">
        <div>
          <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4 mb-6">
            <BelugaLogo size="sm" />
            <span className="text-xs font-semibold text-[#5B6B78]">
              Orçamento nº {budget.number} • Escopo de Fornecimento Base
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-[#2CA35C]" />
              <h3 className="text-xl font-bold text-[#0B3D5C] tracking-tight">
                Materiais e Serviços Inclusos (Sem Custo Adicional)
              </h3>
            </div>
            <p className="text-xs text-[#5B6B78]">
              Itens essenciais que já acompanham a instalação completa da sua piscina Beluga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs mb-6">
            {includedList.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EDF1F4] flex items-start gap-2.5 shadow-sm"
              >
                <span className="text-[#2CA35C] font-black text-sm leading-none mt-0.5">✓</span>
                <span className="text-[#142A36] leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#F0F7FB] border border-[#1CA0D8]/30 flex items-start gap-3 text-xs text-[#0B3D5C]">
            <ShieldCheck className="h-5 w-5 text-[#1CA0D8] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Tranquilidade e Garantia de Entrega</p>
              <p className="text-[#5B6B78] mt-0.5 leading-relaxed">
                Todos os itens acima são entregues e conferidos juntamente com a estrutura da
                piscina, garantindo a compatibilidade hidrostática e o funcionamento do conjunto
                filtrante.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé da página 3 */}
        <div className="border-t border-[#EDF1F4] pt-4 flex items-center justify-between text-[11px] text-[#5B6B78]">
          <span>Beluga Piscinas • Proposta Comercial</span>
          <span className="font-semibold text-[#0B3D5C]">Página 3 de {totalPages}</span>
        </div>
      </section>

      {/* ========================================================
          PÁGINAS DINÂMICAS: ACESSÓRIOS & OPCIONAIS COTADOS
         ======================================================== */}
      {optionalPages.length > 0 ? (
        optionalPages.map((chunkPage, pageIdx) => {
          const currentPageNumber = basePagesBeforeOptionals + pageIdx + 1

          return (
            <section
              key={`opt-page-${pageIdx}`}
              className="pdf-page flex flex-col justify-between p-[14mm] border-b border-[#EDF1F4] print:border-none print:page-break-after-always"
            >
              <div>
                {/* Header da Página */}
                <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4 mb-4">
                  <BelugaLogo size="sm" />
                  <span className="text-xs font-semibold text-[#5B6B78]">
                    Orçamento nº {budget.number} • Opcionais Cotados
                  </span>
                </div>

                {/* Título Principal do Bloco */}
                <div className="p-5 rounded-2xl bg-white border border-[#EDF1F4] shadow-sm mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#0B3D5C] tracking-tight">
                        Acessórios &amp; Opcionais Cotados
                        {chunkPage.totalChunks > 1 && (
                          <span className="ml-2 text-xs font-normal text-[#5B6B78]">
                            (Folha {chunkPage.chunkIndex + 1} de {chunkPage.totalChunks})
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#5B6B78] mt-0.5">
                        Valores unitários e individuais para sua livre escolha (não somados no total
                        da piscina).
                      </p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-[#1CA0D8]/10 text-[#0B3D5C] text-[11px] font-bold">
                      Preços individuais por item
                    </span>
                  </div>
                </div>

                {/* Tabela de Opcionais com Badge e Linhas Confortáveis */}
                <div className="border border-[#EDF1F4] rounded-2xl overflow-hidden shadow-sm bg-white mb-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#EDF1F4] text-[10px] uppercase font-bold text-[#5B6B78] tracking-wider">
                        <th className="py-2.5 px-4 w-[58%]">Item</th>
                        <th className="py-2.5 px-3 text-center w-[14%]">Qtd</th>
                        <th className="py-2.5 px-4 text-right w-[28%]">Preço Individual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF1F4]">
                      {chunkPage.items.map((op, itemIdx) => {
                        const isAcessorio =
                          op.category === 'Acessórios' ||
                          op.category === 'Iluminação' ||
                          op.category === 'Acessibilidade'
                        const badgeColor = isAcessorio
                          ? 'bg-[#1CA0D8]/15 text-[#0B3D5C]'
                          : 'bg-amber-100 text-amber-900'

                        return (
                          <tr key={op.id || itemIdx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-[#0B3D5C] text-xs">{op.name}</span>
                                <span
                                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${badgeColor}`}
                                >
                                  {op.category || 'Opcional'}
                                </span>
                              </div>
                              {op.description && (
                                <p className="text-[11px] text-[#5B6B78] line-clamp-1 leading-snug">
                                  {op.description}
                                </p>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-[#142A36]">
                              {op.qty || 1} un
                            </td>
                            <td className="py-2.5 px-4 text-right font-black text-[#0B3D5C] tabular-nums text-xs">
                              {formatBRL(op.unit_price ?? op.total_price ?? 0)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Card Explicativo: Como incluir qualquer item (Exibido na última folha de opcionais) */}
                {chunkPage.showNoticeCard && (
                  <div className="p-4 rounded-xl border border-[#1CA0D8]/30 bg-[#F0F7FB] text-xs text-[#142A36]">
                    <p className="leading-relaxed">
                      <strong className="text-[#0B3D5C]">Como incluir qualquer item:</strong> Estes
                      itens são individuais para enriquecer o seu projeto de lazer e não somam ao
                      valor da piscina. Para adicionar qualquer acessório ou opcional ao seu pedido,
                      basta avisar o consultor {consultantName} antes da assinatura do contrato.
                    </p>
                  </div>
                )}
              </div>

              {/* Rodapé Dinâmico da Página de Opcionais */}
              <div className="border-t border-[#EDF1F4] pt-4 flex items-center justify-between text-[11px] text-[#5B6B78]">
                <span>Beluga Piscinas • Proposta Comercial</span>
                <span className="font-semibold text-[#0B3D5C]">
                  Página {currentPageNumber} de {totalPages}
                </span>
              </div>
            </section>
          )
        })
      ) : (
        /* Caso em que não há nenhum opcional selecionado */
        <section className="pdf-page flex flex-col justify-between p-[14mm] border-b border-[#EDF1F4] print:border-none print:page-break-after-always">
          <div>
            <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4 mb-4">
              <BelugaLogo size="sm" />
              <span className="text-xs font-semibold text-[#5B6B78]">
                Orçamento nº {budget.number} • Opcionais Cotados
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EDF1F4] shadow-sm mb-6">
              <h3 className="text-lg font-bold text-[#0B3D5C]">
                Acessórios &amp; Opcionais Cotados
              </h3>
              <p className="text-xs text-[#5B6B78] mt-1">
                Nenhum opcional complementar foi adicionado nesta versão do orçamento.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#1CA0D8]/30 bg-[#F0F7FB] text-xs text-[#142A36]">
              <p className="leading-relaxed">
                <strong className="text-[#0B3D5C]">Como incluir qualquer item:</strong> Você poderá
                adicionar iluminação LED, cascatas, gerador de cloro ou ozônio diretamente com o
                consultor {consultantName} antes do fechamento.
              </p>
            </div>
          </div>

          <div className="border-t border-[#EDF1F4] pt-4 flex items-center justify-between text-[11px] text-[#5B6B78]">
            <span>Beluga Piscinas • Proposta Comercial</span>
            <span className="font-semibold text-[#0B3D5C]">Página 4 de {totalPages}</span>
          </div>
        </section>
      )}

      {/* ========================================================
          ÚLTIMA PÁGINA: INVESTIMENTO TOTAL, CONDIÇÕES E ENCERRAMENTO
         ======================================================== */}
      <section className="pdf-page flex flex-col justify-between p-[14mm] print:page-break-after-avoid">
        <div>
          <div className="flex items-center justify-between border-b border-[#EDF1F4] pb-4 mb-5">
            <BelugaLogo size="sm" />
            <span className="text-xs font-semibold text-[#5B6B78]">
              Orçamento nº {budget.number} • Proposta Final
            </span>
          </div>

          {/* Card Central de Investimento */}
          <div className="p-6 rounded-2xl bg-[#0B3D5C] text-white shadow-xl mb-5">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5">
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
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 mb-5">
              <strong>Observações Específicas:</strong> {budget.observations}
            </div>
          )}

          {/* Frase oficial de encerramento da marca */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#F0F7FB] to-white border border-[#1CA0D8]/30 text-center space-y-1.5 mb-5">
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

        {/* Rodapé Oficial com Assinatura e Numeração Dinâmica */}
        <div>
          <div className="border-t border-[#EDF1F4] pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-[#5B6B78] gap-4">
            <div>
              <p className="font-bold text-[#0B3D5C]">{consultantName}</p>
              <p>Atendimento Comercial • (48) 99110-4301</p>
            </div>
            <div className="text-center md:text-right">
              <p className="font-mono text-[11px]">Proposta gerada em {dateFormatted}</p>
              <p className="text-[10px] text-[#5B6B78]/70">
                Válido por {budget.validity_days || 5} dias após a data de envio.
              </p>
            </div>
          </div>

          <div className="border-t border-[#EDF1F4] mt-3 pt-2 flex items-center justify-between text-[11px] text-[#5B6B78]">
            <span>Beluga Piscinas • Proposta Comercial</span>
            <span className="font-semibold text-[#0B3D5C]">
              Página {totalPages} de {totalPages}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
