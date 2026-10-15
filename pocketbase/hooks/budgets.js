// Rota de geração de PDF e numeração de orçamentos
routerAdd('POST', '/backend/v1/pdf/generate', (e) => {
  const info = e.requestInfo()
  const auth = info.auth
  if (!auth) {
    throw new UnauthorizedError('Autenticação necessária para gerar PDF.')
  }

  const data = e.requestData()
  const budgetId = data.budgetId

  if (!budgetId) {
    throw new BadRequestError('budgetId é obrigatório.')
  }

  const budget = $app.findRecordById('budgets', budgetId)
  if (!budget) {
    throw new NotFoundError('Orçamento não encontrado.')
  }

  const isConsultant = budget.getString('consultant_id') === auth.id
  const isAdmin = auth.getString('role') === 'admin'
  if (!isConsultant && !isAdmin) {
    throw new ForbiddenError('Sem permissão para acessar este orçamento.')
  }

  return e.json(200, {
    success: true,
    message: 'PDF estruturado com sucesso',
    budgetId: budget.id,
    number: budget.getString('number'),
  })
})

// Numeração automática de orçamentos ORG-YYYY-NNNN
onRecordCreate((e) => {
  if (e.collection.name !== 'budgets') {
    e.next()
    return
  }

  const year = new Date().getFullYear()
  const currentNum = e.record.getString('number')

  if (!currentNum || currentNum === '') {
    const filter = `number ~ 'ORG-${year}-'`
    let count = 0
    try {
      const records = $app.findRecordsByFilter('budgets', filter, '-number', 1, 0)
      if (records && records.length > 0) {
        const lastNumStr = records[0].getString('number')
        const parts = lastNumStr.split('-')
        if (parts.length === 3) {
          count = parseInt(parts[2], 10) || 0
        }
      }
    } catch (_) {}

    const nextSeq = String(count + 1).padStart(4, '0')
    e.record.set('number', `ORG-${year}-${nextSeq}`)
  }

  if (!e.record.get('version') || e.record.getInt('version') === 0) {
    e.record.set('version', 1)
  }

  e.next()
})
