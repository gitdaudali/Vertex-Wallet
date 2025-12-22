import api from './api'

export interface Transaction {
  id: number
  tx_hash: string
  amount_btc: string
  confirmations: number
  status: string
  btc_address: string
  created_at: string
  confirmed_at?: string
}

export interface TransactionListResponse {
  transactions: Transaction[]
  total: number
  limit: number
  offset: number
}

export const transactionService = {
  list: async (status?: string, limit = 20, offset = 0): Promise<TransactionListResponse> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())
    
    const response = await api.get(`/api/transactions?${params.toString()}`)
    return response.data
  },
}

