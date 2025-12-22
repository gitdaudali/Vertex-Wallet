export const formatBTC = (btc: string | number): string => {
  const num = typeof btc === 'string' ? parseFloat(btc) : btc
  if (isNaN(num)) return '0.00000000'
  
  // Format to 8 decimal places
  return num.toFixed(8)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

