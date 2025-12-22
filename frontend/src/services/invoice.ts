import api from './api'

export interface Invoice {
  id: number
  btc_address: string
  amount_btc: string
  amount_usd?: number
  status: string
  description?: string
  qr_code_data?: string
  expires_at?: string
  created_at: string
  paid_at?: string
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  total: number
  limit: number
  offset: number
}

export interface CreateInvoiceRequest {
  amount_btc?: string
  amount_usd?: number
  description?: string
  expires_in_hours?: number
}

export const invoiceService = {
  create: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await api.post('/api/invoices/create', data)
    return response.data
  },

  list: async (status?: string, limit = 10, offset = 0): Promise<InvoiceListResponse> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())
    
    const response = await api.get(`/api/invoices?${params.toString()}`)
    return response.data
  },

  getById: async (id: number): Promise<Invoice> => {
    const response = await api.get(`/api/invoices/${id}`)
    return response.data
  },
}

