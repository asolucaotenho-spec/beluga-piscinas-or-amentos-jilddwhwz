import type { RecordModel } from 'pocketbase'

export interface User extends RecordModel {
  email: string
  name?: string
  avatar?: string
  role?: 'admin' | 'vendor'
  phone?: string
  discount_limit?: number
  is_active?: boolean
}

export interface Client extends RecordModel {
  name: string
  phone: string
  phone_whatsapp?: string
  city: string
  state: string
  address?: string
  zip?: string
  email?: string
  notes?: string
  created_by?: string
}

export interface PoolModel extends RecordModel {
  name: string
  slug: string
  description?: string
  dimensions?: string // JSON string array ex: ["4,00 x 8,20 x 1,40 m"]
  depth?: string
  structure_type?: string
  finishes?: string // JSON string array ex: ["Tradicional", "Pastilhada"]
  default_finish?: string
  base_price: number
  images?: string[]
  image_url?: string
  is_approved?: boolean
  image_pending?: boolean
  needs_review?: boolean
  review_notes?: string
  variations?: string // JSON { [dim: string]: number }
  technical_specs?: string
  commercial_notes?: string
  catalog_page?: number
}

export interface OptionalItem extends RecordModel {
  name: string
  description?: string
  category:
    | 'Tratamento da água'
    | 'Cascatas e acabamento'
    | 'Iluminação'
    | 'Acessibilidade'
    | 'Outros opcionais'
  price: number
  unit?: string
  image?: string
  applicable_models?: string
  is_active?: boolean
}

export interface BudgetSelectedOptional {
  id: string
  name: string
  description?: string
  category: string
  qty: number
  unit_price: number
  total_price: number
  image?: string
}

export interface BudgetPoolConfig {
  model_id: string
  model_name: string
  dimensions: string
  finish: string
  depth?: string
  structure_type?: string
  image?: string
  base_price: number
  technical_specs?: string
}

export type BudgetStatus =
  | 'Rascunho'
  | 'Finalizado'
  | 'Enviado'
  | 'Em negociação'
  | 'Aprovado'
  | 'Recusado'
  | 'Expirado'

export interface Budget extends RecordModel {
  number: string
  client_id?: string
  client_snapshot?: string // JSON Client
  consultant_id?: string
  consultant_name?: string
  pool_model_id?: string
  pool_config?: string // JSON BudgetPoolConfig
  included_items?: string // JSON string[]
  optional_items?: string // JSON BudgetSelectedOptional[]
  base_price: number
  optional_total: number
  discount: number
  total_value: number
  payment_condition?: string
  payment_details?: string
  installment_count?: number
  installment_value?: number
  due_date?: string
  validity_days?: number
  warranty_text?: string
  delivery_deadline?: string
  client_responsibilities?: string // JSON string[] ou text
  observations?: string
  status: BudgetStatus
  version?: number
  previous_version_id?: string
  pdf_url?: string
}

export interface Setting extends RecordModel {
  key: string
  value: string
  description?: string
}
