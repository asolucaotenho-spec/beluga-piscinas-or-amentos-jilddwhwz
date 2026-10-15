migrate(
  (app) => {
    // 1. Atualizar campos da coleção users (auth)
    const usersCol = app.findCollectionByNameOrId('users')

    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'vendor'],
          maxSelect: 1,
          required: false,
        }),
      )
    }

    if (!usersCol.fields.getByName('phone')) {
      usersCol.fields.add(
        new TextField({
          name: 'phone',
          required: false,
        }),
      )
    }

    if (!usersCol.fields.getByName('discount_limit')) {
      usersCol.fields.add(
        new NumberField({
          name: 'discount_limit',
          required: false,
          min: 0,
          max: 100,
        }),
      )
    }

    if (!usersCol.fields.getByName('is_active')) {
      usersCol.fields.add(
        new BoolField({
          name: 'is_active',
          required: false,
        }),
      )
    }

    usersCol.listRule = "@request.auth.id != ''"
    usersCol.viewRule = "@request.auth.id != ''"
    usersCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || (id = @request.auth.id && @request.body.role:changed = false && @request.body.discount_limit:changed = false))"
    usersCol.deleteRule = "@request.auth.role = 'admin'"

    app.save(usersCol)

    // 2. Coleção clients
    const clientsCol = new Collection({
      name: 'clients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'phone_whatsapp', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'state', type: 'text', required: true },
        { name: 'address', type: 'text' },
        { name: 'zip', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'notes', type: 'text' },
        { name: 'created_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_clients_name ON clients (name)',
        'CREATE INDEX idx_clients_phone ON clients (phone)',
        'CREATE INDEX idx_clients_created ON clients (created DESC)',
      ],
    })
    app.save(clientsCol)

    // 3. Coleção pool_models
    const poolModelsCol = new Collection({
      name: 'pool_models',
      type: 'base',
      listRule: "@request.auth.id != '' && (@request.auth.role = 'admin' || is_approved = true)",
      viewRule: "@request.auth.id != '' && (@request.auth.role = 'admin' || is_approved = true)",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'dimensions', type: 'text' },
        { name: 'depth', type: 'text' },
        { name: 'structure_type', type: 'text' },
        { name: 'finishes', type: 'text' },
        { name: 'default_finish', type: 'text' },
        { name: 'base_price', type: 'number', required: true },
        {
          name: 'images',
          type: 'file',
          maxSelect: 5,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'image_url', type: 'text' },
        { name: 'is_approved', type: 'bool' },
        { name: 'image_pending', type: 'bool' },
        { name: 'needs_review', type: 'bool' },
        { name: 'review_notes', type: 'text' },
        { name: 'variations', type: 'text' },
        { name: 'technical_specs', type: 'text' },
        { name: 'commercial_notes', type: 'text' },
        { name: 'catalog_page', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_pool_models_name ON pool_models (name)',
        'CREATE INDEX idx_pool_models_is_approved ON pool_models (is_approved)',
        'CREATE UNIQUE INDEX idx_pool_models_slug ON pool_models (slug)',
      ],
    })
    app.save(poolModelsCol)

    // 4. Coleção optional_items
    const optionalItemsCol = new Collection({
      name: 'optional_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'Tratamento da água',
            'Cascatas e acabamento',
            'Iluminação',
            'Acessibilidade',
            'Outros opcionais',
          ],
          maxSelect: 1,
        },
        { name: 'price', type: 'number', required: true },
        { name: 'unit', type: 'text' },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'applicable_models', type: 'text' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_optional_category ON optional_items (category)',
        'CREATE INDEX idx_optional_price ON optional_items (price)',
      ],
    })
    app.save(optionalItemsCol)

    // 5. Coleção settings (chave/valor)
    const settingsCol = new Collection({
      name: 'settings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_settings_key ON settings (key)'],
    })
    app.save(settingsCol)

    // 6. Coleção catalog_imports
    const catalogImportsCol = new Collection({
      name: 'catalog_imports',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'file',
          type: 'file',
          maxSelect: 1,
          maxSize: 20971520,
          mimeTypes: ['application/pdf'],
        },
        { name: 'status', type: 'text', required: true },
        { name: 'models_found', type: 'number' },
        { name: 'models_imported', type: 'number' },
        { name: 'duplicates_skipped', type: 'number' },
        { name: 'report', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_catalog_imports_created ON catalog_imports (created DESC)'],
    })
    app.save(catalogImportsCol)

    // 7. Coleção budgets (sem previous_version_id inicialmente)
    const budgetsCol = new Collection({
      name: 'budgets',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || consultant_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || consultant_id = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || consultant_id = @request.auth.id)",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'number', type: 'text', required: true },
        { name: 'client_id', type: 'relation', collectionId: clientsCol.id, maxSelect: 1 },
        { name: 'client_snapshot', type: 'text' },
        { name: 'consultant_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'consultant_name', type: 'text' },
        { name: 'pool_model_id', type: 'relation', collectionId: poolModelsCol.id, maxSelect: 1 },
        { name: 'pool_config', type: 'text' },
        { name: 'included_items', type: 'text' },
        { name: 'optional_items', type: 'text' },
        { name: 'base_price', type: 'number' },
        { name: 'optional_total', type: 'number' },
        { name: 'discount', type: 'number' },
        { name: 'total_value', type: 'number' },
        { name: 'payment_condition', type: 'text' },
        { name: 'payment_details', type: 'text' },
        { name: 'installment_count', type: 'number' },
        { name: 'installment_value', type: 'number' },
        { name: 'due_date', type: 'date' },
        { name: 'validity_days', type: 'number' },
        { name: 'warranty_text', type: 'text' },
        { name: 'delivery_deadline', type: 'text' },
        { name: 'client_responsibilities', type: 'text' },
        { name: 'observations', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: [
            'Rascunho',
            'Finalizado',
            'Enviado',
            'Em negociação',
            'Aprovado',
            'Recusado',
            'Expirado',
          ],
          maxSelect: 1,
        },
        { name: 'version', type: 'number' },
        {
          name: 'pdf_url',
          type: 'file',
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ['application/pdf'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_budgets_number ON budgets (number)',
        'CREATE INDEX idx_budgets_status ON budgets (status)',
        'CREATE INDEX idx_budgets_consultant ON budgets (consultant_id)',
        'CREATE INDEX idx_budgets_client ON budgets (client_id)',
        'CREATE INDEX idx_budgets_created ON budgets (created DESC)',
      ],
    })
    app.save(budgetsCol)

    // Agora adicionamos o campo previous_version_id com collectionId = budgetsCol.id
    budgetsCol.fields.add(
      new RelationField({
        name: 'previous_version_id',
        collectionId: budgetsCol.id,
        maxSelect: 1,
      }),
    )
    app.save(budgetsCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('budgets'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('catalog_imports'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('settings'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('optional_items'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('pool_models'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('clients'))
    } catch (_) {}
  },
)
