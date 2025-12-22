import { TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react'
import Card from '../ui/Card'
import { formatBTC } from '../../utils/format'

interface BalanceCardProps {
  title: string
  amount: string
  subtitle?: string
  icon?: 'total' | 'confirmed' | 'pending' | 'received'
  trend?: string
}

const BalanceCard = ({ title, amount, subtitle, icon = 'total', trend }: BalanceCardProps) => {
  const icons = {
    total: TrendingUp,
    confirmed: CheckCircle,
    pending: Clock,
    received: DollarSign,
  }
  
  const Icon = icons[icon]
  
  const gradients = {
    total: 'from-bitcoin to-bitcoin-dark',
    confirmed: 'from-success to-green-600',
    pending: 'from-warning to-yellow-600',
    received: 'from-blue-500 to-blue-600',
  }
  
  return (
    <Card hover className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[icon]} opacity-5`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradients[icon]} shadow-sm`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">
            {formatBTC(amount)}
          </p>
          <span className="text-lg font-semibold text-gray-500">BTC</span>
        </div>
        {trend && (
          <p className="text-sm text-gray-600 mt-2">{trend}</p>
        )}
      </div>
    </Card>
  )
}

export default BalanceCard

