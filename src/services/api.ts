import pb from '@/lib/pocketbase/client'
import type { Client, PoolModel, OptionalItem, Budget, Setting } from '@/types/beluga'

export const clientService = {
  async list(filter = '', sort = 'name'): Promise<Client[]> {
    return pb.collection('clients').getFullList<Client>({
      filter,
      sort,
    })
  },

  async getById(id: string): Promise<Client> {
    return pb.collection('clients').getOne<Client>(id)
  },

  async create(data: Partial<Client>): Promise<Client> {
    return pb.collection('clients').create<Client>(data)
  },

  async update(id: string, data: Partial<Client>): Promise<Client> {
    return pb.collection('clients').update<Client>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    return pb.collection('clients').delete(id)
  },
}

export const poolModelService = {
  async list(filter = '', sort = 'catalog_page,name'): Promise<PoolModel[]> {
    return pb.collection('pool_models').getFullList<PoolModel>({
      filter,
      sort,
    })
  },

  async getById(id: string): Promise<PoolModel> {
    return pb.collection('pool_models').getOne<PoolModel>(id)
  },

  async create(data: Partial<PoolModel> | FormData): Promise<PoolModel> {
    return pb.collection('pool_models').create<PoolModel>(data)
  },

  async update(id: string, data: Partial<PoolModel> | FormData): Promise<PoolModel> {
    return pb.collection('pool_models').update<PoolModel>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    return pb.collection('pool_models').delete(id)
  },

  async approve(id: string): Promise<PoolModel> {
    return pb.collection('pool_models').update<PoolModel>(id, {
      is_approved: true,
      needs_review: false,
    })
  },

  async reject(id: string, reason?: string): Promise<PoolModel> {
    return pb.collection('pool_models').update<PoolModel>(id, {
      is_approved: false,
      needs_review: true,
      review_notes: reason || 'Rejeitado na revisão técnica',
    })
  },

  getImageUrl(model: PoolModel, fileName?: string): string {
    if (fileName) {
      return pb.files.getURL(model as any, fileName)
    }
    if (model.images && model.images.length > 0) {
      return pb.files.getURL(model as any, model.images[0])
    }
    if (model.image_url) {
      return model.image_url
    }
    return ''
  },
}

export const optionalItemService = {
  async list(filter = 'is_active = true', sort = 'category,price'): Promise<OptionalItem[]> {
    return pb.collection('optional_items').getFullList<OptionalItem>({
      filter,
      sort,
    })
  },

  async getById(id: string): Promise<OptionalItem> {
    return pb.collection('optional_items').getOne<OptionalItem>(id)
  },

  async create(data: Partial<OptionalItem> | FormData): Promise<OptionalItem> {
    return pb.collection('optional_items').create<OptionalItem>(data)
  },

  async update(id: string, data: Partial<OptionalItem> | FormData): Promise<OptionalItem> {
    return pb.collection('optional_items').update<OptionalItem>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    return pb.collection('optional_items').delete(id)
  },
}

export const budgetService = {
  async list(filter = '', sort = '-created'): Promise<Budget[]> {
    return pb.collection('budgets').getFullList<Budget>({
      filter,
      sort,
      expand: 'client_id,pool_model_id,consultant_id',
    })
  },

  async getById(id: string): Promise<Budget> {
    return pb.collection('budgets').getOne<Budget>(id, {
      expand: 'client_id,pool_model_id,consultant_id,previous_version_id',
    })
  },

  async create(data: Partial<Budget>): Promise<Budget> {
    return pb.collection('budgets').create<Budget>(data)
  },

  async update(id: string, data: Partial<Budget>): Promise<Budget> {
    return pb.collection('budgets').update<Budget>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    return pb.collection('budgets').delete(id)
  },

  async duplicate(
    originalId: string,
    currentUserId: string,
    currentUserName: string,
  ): Promise<Budget> {
    const original = await this.getById(originalId)
    let clientSnapshot = original.client_snapshot ? JSON.parse(original.client_snapshot) : {}
    if (clientSnapshot.name) {
      clientSnapshot.name = `${clientSnapshot.name} (cópia)`
    }

    const newBudgetData: Partial<Budget> = {
      client_id: original.client_id,
      client_snapshot: JSON.stringify(clientSnapshot),
      consultant_id: currentUserId,
      consultant_name: currentUserName,
      pool_model_id: original.pool_model_id,
      pool_config: original.pool_config,
      included_items: original.included_items,
      optional_items: original.optional_items,
      base_price: original.base_price,
      optional_total: original.optional_total,
      discount: original.discount,
      total_value: original.total_value,
      payment_condition: original.payment_condition,
      payment_details: original.payment_details,
      installment_count: original.installment_count,
      installment_value: original.installment_value,
      validity_days: original.validity_days,
      warranty_text: original.warranty_text,
      delivery_deadline: original.delivery_deadline,
      client_responsibilities: original.client_responsibilities,
      observations: original.observations,
      status: 'Rascunho',
      version: 1,
    }

    return this.create(newBudgetData)
  },

  async createNewVersion(previousId: string, updatedData: Partial<Budget>): Promise<Budget> {
    const prev = await this.getById(previousId)
    const newVersion = (prev.version || 1) + 1

    const data: Partial<Budget> = {
      ...updatedData,
      previous_version_id: prev.id,
      version: newVersion,
      status: 'Rascunho',
    }

    return this.create(data)
  },
}

export const settingsService = {
  async getAll(): Promise<Record<string, any>> {
    const records = await pb.collection('settings').getFullList<Setting>()
    const map: Record<string, any> = {}
    for (const rec of records) {
      try {
        map[rec.key] = JSON.parse(rec.value)
      } catch (_) {
        map[rec.key] = rec.value
      }
    }
    return map
  },

  async get(key: string, defaultValue?: any): Promise<any> {
    try {
      const rec = await pb.collection('settings').getFirstListItem<Setting>(`key = "${key}"`)
      return JSON.parse(rec.value)
    } catch (_) {
      return defaultValue
    }
  },

  async set(key: string, value: any, description?: string): Promise<void> {
    const stringified = JSON.stringify(value)
    try {
      const rec = await pb.collection('settings').getFirstListItem<Setting>(`key = "${key}"`)
      await pb.collection('settings').update(rec.id, {
        value: stringified,
        description: description || rec.description,
      })
    } catch (_) {
      await pb.collection('settings').create({
        key,
        value: stringified,
        description,
      })
    }
  },
}
