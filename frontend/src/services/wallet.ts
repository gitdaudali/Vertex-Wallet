import api from './api'

export interface Wallet {
  id: number
  btc_address: string
  created_at: string
}

export interface WalletBalance {
  total_balance_btc: string
  confirmed_balance_btc: string
  pending_balance_btc: string
  total_received_btc: string
  addresses: Array<{
    address: string
    balance: string
  }>
}

export const walletService = {
  generateAddress: async (): Promise<Wallet> => {
    const response = await api.post('/api/wallets/generate')
    return response.data
  },

  getBalance: async (): Promise<WalletBalance> => {
    const response = await api.get('/api/wallets/balance')
    return response.data
  },
}

