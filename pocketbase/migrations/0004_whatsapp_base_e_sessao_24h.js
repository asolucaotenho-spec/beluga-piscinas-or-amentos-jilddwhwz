// Migração 0004:
// 1. Garante que o telefone base da equipe comercial (48 99110-4301) esteja salvo
//    nas configurações (key 'branding'), usado nos links de WhatsApp do sistema.
// 2. Aumenta a duração do authToken da coleção users para no mínimo 24 horas.

migrate(
  (app) => {
    // --- 1. Telefone base da equipe para WhatsApp (idempotente) ---
    try {
      const rec = app.findFirstRecordByFilter('settings', "key = 'branding'")
      let branding = {}
      try {
        branding = JSON.parse(rec.getString('value')) ?? {}
      } catch (_) {
        branding = {}
      }
      if (!branding.whatsapp_number) {
        branding.whatsapp_number = '48 99110-4301'
        rec.set('value', JSON.stringify(branding))
        app.save(rec)
      }
    } catch (_) {
      // Sem registro 'branding' ainda — cria com o telefone base
      const settingsCol = app.findCollectionByNameOrId('settings')
      const newRec = new Record(settingsCol)
      newRec.set('key', 'branding')
      newRec.set(
        'value',
        JSON.stringify({
          company_name: 'Beluga Piscinas',
          phone: '48 99110-4301',
          whatsapp_number: '48 99110-4301',
          website: 'www.piscinasbeluga.com.br',
          instagram: '@BELUGAPISCINASSSANTACATARINA',
          factory_location: 'Taquara/RS',
          contact_email: 'belugapiscinassc@gmail.com',
          slogan:
            'A piscina é um bem para a vida toda, e a Beluga Piscinas é a parceira certa para realizar este projeto!',
        }),
      )
      app.save(newRec)
    }

    // --- 2. authToken com duração mínima de 24h (86400s) ---
    const usersCol = app.findCollectionByNameOrId('users')
    const authTokenField = usersCol.fields.getByName('authToken')
    if (authTokenField && authTokenField.duration < 86400) {
      authTokenField.duration = 86400
      app.save(usersCol)
    }
  },
  (app) => {
    // Reverte apenas a duração do token; o seed do WhatsApp permanece (idempotente)
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      const authTokenField = usersCol.fields.getByName('authToken')
      if (authTokenField && authTokenField.duration === 86400) {
        authTokenField.duration = 1209600
        app.save(usersCol)
      }
    } catch (_) {}
  },
)
