migrate(
  (app) => {
    // 1. Seed Admin User
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'belugapiscinassc@gmail.com')
    } catch (_) {
      const adminRecord = new Record(users)
      adminRecord.setEmail('belugapiscinassc@gmail.com')
      adminRecord.setPassword('Skip@Pass')
      adminRecord.setVerified(true)
      adminRecord.set('name', 'Beluga Piscinas (Administrador)')
      adminRecord.set('role', 'admin')
      adminRecord.set('phone', '48 99110-4301')
      adminRecord.set('discount_limit', 15)
      adminRecord.set('is_active', true)
      app.save(adminRecord)
    }

    // 2. Seed Settings
    const settingsCol = app.findCollectionByNameOrId('settings')
    const defaultSettings = [
      {
        key: 'payment_default',
        value: JSON.stringify({
          condition: 'À vista ou em até 12x no cartão de crédito',
          standard_installments: 12,
          max_installments: 12,
          notes: 'SEMPRE EM 12X PADRÃO',
        }),
        description: 'Condição de pagamento comercial padrão',
      },
      {
        key: 'validity_days',
        value: JSON.stringify({ days: 5 }),
        description: 'Validade padrão da proposta comercial em dias',
      },
      {
        key: 'warranty_text',
        value: JSON.stringify({
          text: 'As piscinas Beluga, com fábrica em Taquara/RS, possuem garantia de 15 (quinze) anos de fábrica, de acordo com as especificações contidas no contrato de compra e venda.',
        }),
        description: 'Texto padrão de garantia de fábrica',
      },
      {
        key: 'delivery_deadline',
        value: JSON.stringify({ text: 'A combinar' }),
        description: 'Prazo padrão de entrega e início das obras',
      },
      {
        key: 'client_responsibilities',
        value: JSON.stringify([
          'Ponto de energia elétrica próximo ao local de instalação da casa de máquinas;',
          'Ponto de esgoto próximo ao local de instalação da casa de máquinas;',
          'Retirada de terra;',
          'Rebaixamento do lençol freático;',
          'Material para assentamento da piscina;',
          'Caso seja necessário, também por conta do cliente: guindaste para passagem da piscina, colocação de material próximo à piscina, caixa de contenção, remoção de árvores, vigas ou qualquer obstrução no espaço da piscina.',
        ]),
        description: 'Lista de responsabilidades do cliente para instalação',
      },
      {
        key: 'included_items',
        value: JSON.stringify([
          'Tubos;',
          'Conexões e registros para a instalação da piscina;',
          'Casa de máquinas de fibra com tampa;',
          'Conjunto de motobomba e filtro de areia da marca Nautilus;',
          'Kit de acessórios de limpeza composto por aspirador, peneira, escova, mangueira flutuante, ponteiras e cabo telescópio;',
          '02 Dispositivos hidromassagem;',
          '01 Espera para aquecimento;',
          '01 Espera para cascata;',
          'Primeira limpeza da piscina e primeiro tratamento químico da água por conta da loja;',
          'Mão de obra de escavação do local;',
          'Aterramento lateral da piscina;',
          'Mão de obra da ligação hidráulica entre a piscina e a casa de máquinas até dois metros;',
          'Demais detalhes sobre possíveis alterações da obra deverão ser acertados diretamente com o vendedor;',
          'Frete incluso.',
        ]),
        description: 'Materiais e serviços inclusos no valor base da piscina',
      },
      {
        key: 'branding',
        value: JSON.stringify({
          company_name: 'Beluga Piscinas',
          phone: '48 99110-4301',
          website: 'www.piscinasbeluga.com.br',
          instagram: '@BELUGAPISCINASSSANTACATARINA',
          factory_location: 'Taquara/RS',
          contact_email: 'belugapiscinassc@gmail.com',
          slogan:
            'A piscina é um bem para a vida toda, e a Beluga Piscinas é a parceira certa para realizar este projeto!',
        }),
        description: 'Identidade visual e contatos oficiais',
      },
    ]

    for (const s of defaultSettings) {
      try {
        app.findFirstRecordByData('settings', 'key', s.key)
      } catch (_) {
        const rec = new Record(settingsCol)
        rec.set('key', s.key)
        rec.set('value', s.value)
        rec.set('description', s.description)
        app.save(rec)
      }
    }

    // 3. Seed Optional Items (exatos conforme Orçamento Molde e PRD)
    const optionalCol = app.findCollectionByNameOrId('optional_items')
    const items = [
      {
        name: 'Gerador de Ozônio',
        description:
          'O ozônio é um dos mais poderosos oxidantes. Gás incolor que não deixa resíduos na água, seguro e eficaz. Elimina em 80% o uso do cloro.',
        category: 'Tratamento da água',
        price: 5500.0,
        unit: 'unid',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Gerador de Cloro',
        description:
          'Produz cloro automaticamente com a dosagem adequada para o tratamento eficiente, eliminando 100% da aplicação manual de cloro.',
        category: 'Tratamento da água',
        price: 5500.0,
        unit: 'unid',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Cascata em Inox Naja (65cm)',
        description:
          'Cascata em aço inoxidável modelo Naja 65cm de alta durabilidade e acabamento escovado premium.',
        category: 'Cascatas e acabamento',
        price: 1590.0,
        unit: 'unid',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Cascata em Inox de Embutir (80cm)',
        description:
          'Cascata em aço inoxidável para embutir na parede ou muro, com lâmina de água uniforme de 80cm.',
        category: 'Cascatas e acabamento',
        price: 1780.0,
        unit: 'unid',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Ponto Adicional de Hidromassagem',
        description:
          'Dispositivo de hidromassagem extra com jato direcionável para relaxamento na piscina.',
        category: 'Cascatas e acabamento',
        price: 380.0,
        unit: 'ponto',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Pastilhado na Borda',
        description:
          'Acabamento sofisticado com faixa pastilhada aplicada na borda da piscina (exclusivo para modelos de fibra em gel).',
        category: 'Cascatas e acabamento',
        price: 2980.0,
        unit: 'serviço',
        applicable_models: 'fibra-gel',
        is_active: true,
      },
      {
        name: 'Power LED Azul/Branco Brustec',
        description: '01 Refletor Power LED azul ou branco de alto rendimento marca BRUSTEC.',
        category: 'Iluminação',
        price: 380.0,
        unit: 'unid',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Power LED RGB com Central de Comando e Controle',
        description:
          '02 Refletores Power LED RGB com central BRUSTEC 21 funções, controle remoto e funções rítmicas com acompanhamento de som.',
        category: 'Iluminação',
        price: 1700.0,
        unit: 'kit',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Corrimão em Inox',
        description:
          'Corrimão em aço inox polido para acessibilidade e segurança no acesso à piscina.',
        category: 'Acessibilidade',
        price: 1980.0,
        unit: 'unid',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Aquecedor Solar / Trocador de Calor',
        description:
          'Sistema de climatização para manter a água na temperatura ideal durante todo o ano.',
        category: 'Outros opcionais',
        price: 8900.0,
        unit: 'sistema',
        applicable_models: '*',
        is_active: true,
      },
      {
        name: 'Automação Completa via Aplicativo Wi-Fi',
        description:
          'Módulo inteligente para controle de bomba, filtro, iluminação e aquecimento diretamente pelo celular.',
        category: 'Outros opcionais',
        price: 2450.0,
        unit: 'sistema',
        applicable_models: '*',
        is_active: true,
      },
    ]

    for (const it of items) {
      try {
        app.findFirstRecordByData('optional_items', 'name', it.name)
      } catch (_) {
        const rec = new Record(optionalCol)
        rec.set('name', it.name)
        rec.set('description', it.description)
        rec.set('category', it.category)
        rec.set('price', it.price)
        rec.set('unit', it.unit)
        rec.set('applicable_models', it.applicable_models)
        rec.set('is_active', it.is_active)
        app.save(rec)
      }
    }

    // 4. Seed Pool Models (18 modelos fiéis do catálogo de 6 páginas)
    // Conforme PRD: todos começam com is_approved = false para revisão do admin
    // image_pending = true se não houver upload ainda
    // Valores-base de referência para cada tamanho
    const poolCol = app.findCollectionByNameOrId('pool_models')

    const models = [
      // Página 1
      {
        name: 'Palas',
        slug: 'palas',
        description:
          'Design clássico e imponente com escada ergonômica integrada e bancos para relaxamento.',
        dimensions: JSON.stringify(['4,00 x 8,20 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 36900.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 1,
        technical_specs: 'Capacidade aprox. 38.000 L. Escada frontal e banco de hidromassagem.',
      },
      {
        name: 'Brisêis',
        slug: 'briseis',
        description:
          'Linhas orgânicas e curvatura suave com assento circular. Modelo premium que integra a natureza ao deck.',
        dimensions: JSON.stringify(['8,10 x 3,70 x 1,40 m', '7,00 x ? x 1,40 m (revisão)']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 38500.0,
        is_approved: false,
        image_pending: true,
        needs_review: true,
        review_notes:
          'Variante 7,00 x ? x 1,40 parcialmente ilegível no catálogo impresso (largura necessita confirmação do fabricante).',
        catalog_page: 1,
        technical_specs: 'Capacidade aprox. 32.000 L. Design sinuoso com prainha lateral.',
      },
      {
        name: 'Héstia',
        slug: 'hestia',
        description:
          'Elegância geométrica com cantos arredondados e excelente área livre para natação.',
        dimensions: JSON.stringify(['4,00 x 8,20 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 35900.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 1,
        technical_specs:
          'Capacidade aprox. 36.000 L. Escada em leque e amplo espaço para toda a família.',
      },

      // Página 2
      {
        name: 'Apolo',
        slug: 'apolo',
        description:
          'Formato oval clássico de fácil circulação, ideal para quintais médios a amplos.',
        dimensions: JSON.stringify(['3,50 x 7,00 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 29800.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 2,
        technical_specs: 'Capacidade aprox. 24.000 L. Formato oval ergonômico.',
      },
      {
        name: 'Zeus',
        slug: 'zeus',
        description:
          'A imponência em forma de piscina: 10 metros de comprimento para raia e lazer sofisticado.',
        dimensions: JSON.stringify(['4,20 x 10,00 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 49900.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 2,
        technical_specs: 'Capacidade aprox. 48.000 L. Modelo topo de linha da marca Beluga.',
      },
      {
        name: 'Helena',
        slug: 'helena',
        description:
          'Modelo retangular moderno com escada centralizada e bancos simétricos de apoio.',
        dimensions: JSON.stringify(['3,60 x 8,10 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 34500.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 2,
        technical_specs: 'Capacidade aprox. 33.000 L. Escadaria central elegante.',
      },

      // Página 3
      {
        name: 'Hera',
        slug: 'hera',
        description: 'Retangular com prainha rasa em toda a largura e raia livre para natação.',
        dimensions: JSON.stringify(['4,00 x 8,00 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 37500.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 3,
        technical_specs: 'Capacidade aprox. 38.000 L. Prainha rasa com área de hidro.',
      },
      {
        name: 'Atena',
        slug: 'atena',
        description: 'Ampla e sofisticada com escadaria em cascata e acabamento reto moderno.',
        dimensions: JSON.stringify(['8,80 x 3,50 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 39900.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 3,
        technical_specs: 'Capacidade aprox. 36.000 L. Linhas retas contemporâneas.',
      },
      {
        name: 'Afrodite',
        slug: 'afrodite',
        description:
          'Modelo campeão de vendas com 5 opções de tamanhos para se adequar a qualquer terreno.',
        dimensions: JSON.stringify([
          '7,40 x 3,60 x 1,40 m',
          '6,40 x 3,20 x 1,40 m',
          '5,40 x 2,80 x 1,40 m',
          '4,70 x 2,50 x 1,30 m',
        ]),
        depth: '1,30 a 1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 24900.0,
        variations: JSON.stringify({
          '7,40 x 3,60 x 1,40 m': 32900.0,
          '6,40 x 3,20 x 1,40 m': 28900.0,
          '5,40 x 2,80 x 1,40 m': 25900.0,
          '4,70 x 2,50 x 1,30 m': 22900.0,
        }),
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 3,
        technical_specs: 'Versatilidade e alta aceitação de mercado com 5 variações métricas.',
      },

      // Página 4
      {
        name: 'Midas',
        slug: 'midas',
        description:
          'Compacta e aconchegante, perfeita para casas com espaço compacto ou área gourmet.',
        dimensions: JSON.stringify(['1,80 x 3,80 x 1,00 m']),
        depth: '1,00 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 15900.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 4,
        technical_specs: 'Capacidade aprox. 6.000 L. Ideal para recreação infantil e relax.',
      },
      {
        name: 'Artemis',
        slug: 'artemis',
        description: 'Formato quadrado moderno ideal para cantos de deck e pátios integrados.',
        dimensions: JSON.stringify(['2,80 x 2,80 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 19900.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 4,
        technical_specs: 'Capacidade aprox. 10.000 L. Design quadrado arrojado.',
      },
      {
        name: 'Nisa',
        slug: 'nisa',
        description:
          'Compacta angular em trapézio para cantos de muros e áreas de descanso intimistas.',
        dimensions: JSON.stringify(['2,20 x 2,20 x 0,80 m']),
        depth: '0,80 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 13900.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 4,
        technical_specs: 'Capacidade aprox. 3.500 L. Spa e piscina compacta de canto.',
      },

      // Página 5
      {
        name: 'Libia',
        slug: 'libia',
        description:
          'Piscina em formato leque/triangular para encaixe perfeito em esquinas de pátio.',
        dimensions: JSON.stringify(['2,60 x 2,60 x 0,90 m']),
        depth: '0,90 m',
        structure_type: 'Fibra em Gel',
        finishes: JSON.stringify(['Tradicional']),
        default_finish: 'Tradicional',
        base_price: 16500.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 5,
        technical_specs: 'Capacidade aprox. 5.500 L. Perfeita para cantos com deck elevado.',
      },
      {
        name: 'Iris Pastilhada',
        slug: 'iris-pastilhada',
        description:
          'Beleza e sofisticação das pastilhas de fábrica com linhas retas e prainha molhada.',
        dimensions: JSON.stringify([
          '8,00 x 3,50 x 1,40 m',
          '7,00 x 3,50 x 1,40 m',
          '6,00 x 3,00 x 1,40 m',
          '5,00 x 2,80 x 1,40 m',
        ]),
        depth: '1,40 m',
        structure_type: 'Fibra Pastilhada',
        finishes: JSON.stringify(['Pastilhada']),
        default_finish: 'Pastilhada',
        base_price: 38900.0,
        variations: JSON.stringify({
          '8,00 x 3,50 x 1,40 m': 47900.0,
          '7,00 x 3,50 x 1,40 m': 42900.0,
          '6,00 x 3,00 x 1,40 m': 38900.0,
          '5,00 x 2,80 x 1,40 m': 33900.0,
        }),
        is_approved: false,
        image_pending: true,
        needs_review: true,
        review_notes:
          'Dimensão 8,00 x ? x 1,40 no PDF original com largura aproximada 3,50m; conferir com fábrica.',
        catalog_page: 5,
        technical_specs: 'Revestimento em pastilhas vitrificadas de fábrica com alta durabilidade.',
      },
      {
        name: 'Ares com SPA Pastilhada',
        slug: 'ares-com-spa-pastilhada',
        description:
          'Combinação espetacular de piscina semi-olímpica e SPA integrado com hidromassagem e pastilhas.',
        dimensions: JSON.stringify([
          '8,00 x 4,00 x 1,40 m',
          '7,00 x 3,50 x 1,40 m',
          '6,00 x 3,00 x 1,40 m',
          '5,00 x 2,80 x 1,40 m',
        ]),
        depth: '1,40 m',
        structure_type: 'Fibra Pastilhada',
        finishes: JSON.stringify(['Pastilhada']),
        default_finish: 'Pastilhada',
        base_price: 44900.0,
        variations: JSON.stringify({
          '8,00 x 4,00 x 1,40 m': 54900.0,
          '7,00 x 3,50 x 1,40 m': 48900.0,
          '6,00 x 3,00 x 1,40 m': 44900.0,
          '5,00 x 2,80 x 1,40 m': 39900.0,
        }),
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 5,
        technical_specs: 'SPA elevado com bicos direcionais e transbordo para a piscina principal.',
      },

      // Página 6
      {
        name: 'Ares sem SPA Pastilhada',
        slug: 'ares-sem-spa-pastilhada',
        description:
          'Versão da linha Ares com raia livre total revestida em pastilhas vitrificadas de fábrica.',
        dimensions: JSON.stringify([
          '8,00 x 4,00 x 1,40 m',
          '7,00 x 3,50 x 1,40 m',
          '6,00 x 3,00 x 1,40 m',
          '5,00 x 2,80 x 1,40 m',
        ]),
        depth: '1,40 m',
        structure_type: 'Fibra Pastilhada',
        finishes: JSON.stringify(['Pastilhada']),
        default_finish: 'Pastilhada',
        base_price: 41900.0,
        variations: JSON.stringify({
          '8,00 x 4,00 x 1,40 m': 51900.0,
          '7,00 x 3,50 x 1,40 m': 45900.0,
          '6,00 x 3,00 x 1,40 m': 41900.0,
          '5,00 x 2,80 x 1,40 m': 36900.0,
        }),
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 6,
        technical_specs: 'Estrutura reforçada de fibra com acabamento pastilhado integral.',
      },
      {
        name: 'Atena Pastilhada',
        slug: 'atena-pastilhada',
        description:
          'Linhas retas com acabamento nobre em pastilhas vitrificadas em toda a sua extensão.',
        dimensions: JSON.stringify(['8,80 x 3,50 x 1,40 m']),
        depth: '1,40 m',
        structure_type: 'Fibra Pastilhada',
        finishes: JSON.stringify(['Pastilhada']),
        default_finish: 'Pastilhada',
        base_price: 48900.0,
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 6,
        technical_specs: 'Comprimento premium de 8,80m com acabamento pastilhado luxuoso.',
      },
      {
        name: 'Hera com SPA Pastilhada',
        slug: 'hera-com-spa-pastilhada',
        description:
          'Piscina retangular com SPA acoplado e acabamento em pastilhas, aliando natação e hidroterapia.',
        dimensions: JSON.stringify([
          '8,00 x 4,00 x 1,40 m',
          '7,00 x 3,50 x 1,40 m',
          '6,00 x 3,00 x 1,40 m',
          '5,00 x 2,80 x 1,40 m',
        ]),
        depth: '1,40 m',
        structure_type: 'Fibra Pastilhada',
        finishes: JSON.stringify(['Pastilhada']),
        default_finish: 'Pastilhada',
        base_price: 46900.0,
        variations: JSON.stringify({
          '8,00 x 4,00 x 1,40 m': 55900.0,
          '7,00 x 3,50 x 1,40 m': 50900.0,
          '6,00 x 3,00 x 1,40 m': 46900.0,
          '5,00 x 2,80 x 1,40 m': 41900.0,
        }),
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 6,
        technical_specs: 'SPA com hidromassagem e iluminação independente.',
      },
      {
        name: 'Afrodite Pastilhada',
        slug: 'afrodite-pastilhada',
        description:
          'O sucesso da Afrodite revestida com pastilhas de alta resistência para projetos de alto padrão.',
        dimensions: JSON.stringify([
          '8,00 x 4,00 x 1,40 m',
          '7,00 x 3,50 x 1,40 m',
          '6,00 x 3,00 x 1,40 m',
          '5,00 x 2,80 x 1,40 m',
        ]),
        depth: '1,40 m',
        structure_type: 'Fibra Pastilhada',
        finishes: JSON.stringify(['Pastilhada']),
        default_finish: 'Pastilhada',
        base_price: 41900.0,
        variations: JSON.stringify({
          '8,00 x 4,00 x 1,40 m': 51900.0,
          '7,00 x 3,50 x 1,40 m': 45900.0,
          '6,00 x 3,00 x 1,40 m': 41900.0,
          '5,00 x 2,80 x 1,40 m': 36900.0,
        }),
        is_approved: false,
        image_pending: true,
        needs_review: false,
        catalog_page: 6,
        technical_specs: 'Acabamento pastilhado resistente a intempéries e produtos químicos.',
      },
    ]

    for (const m of models) {
      try {
        app.findFirstRecordByData('pool_models', 'slug', m.slug)
      } catch (_) {
        const rec = new Record(poolCol)
        rec.set('name', m.name)
        rec.set('slug', m.slug)
        rec.set('description', m.description)
        rec.set('dimensions', m.dimensions)
        rec.set('depth', m.depth)
        rec.set('structure_type', m.structure_type)
        rec.set('finishes', m.finishes)
        rec.set('default_finish', m.default_finish)
        rec.set('base_price', m.base_price)
        rec.set('is_approved', m.is_approved)
        rec.set('image_pending', m.image_pending)
        rec.set('needs_review', m.needs_review || false)
        if (m.review_notes) rec.set('review_notes', m.review_notes)
        if (m.variations) rec.set('variations', m.variations)
        rec.set('technical_specs', m.technical_specs)
        rec.set('catalog_page', m.catalog_page)
        app.save(rec)
      }
    }

    // 5. Seed de 1 Cliente de Demonstração
    const clientsCol = app.findCollectionByNameOrId('clients')
    try {
      app.findFirstRecordByData('clients', 'phone', '48 99888-7766')
    } catch (_) {
      const c = new Record(clientsCol)
      c.set('name', 'Ricardo Silva Fagundes')
      c.set('phone', '48 99888-7766')
      c.set('phone_whatsapp', '48 99888-7766')
      c.set('city', 'Florianópolis')
      c.set('state', 'SC')
      c.set('address', 'Rua das Palmeiras, 340 - Campeche')
      c.set('email', 'ricardo.fagundes@email.com')
      c.set('notes', 'Cliente prefere instalação com aquecedor solar e hidromassagem.')
      app.save(c)
    }
  },
  (app) => {
    // Rollback não destrói dados do cliente
  },
)
