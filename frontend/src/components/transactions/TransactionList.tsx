import { useState } from 'react'
import { useQuery } from 'react-query'
import { Filter, ExternalLink, ArrowDownRight } from 'lucide-react'
import { transactionService } from '../../services/transaction'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Skeleton from '../ui/Skeleton'
import { formatBTC, formatDate } from '../../utils/format'

const TransactionList = () => {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading } = useQuery(
    ['transactions', statusFilter, page],
    () => transactionService.list(statusFilter || undefined, limit, page * limit),
    { refetchInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">View all your Bitcoin transactions</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
          {data && data.total > 0 && (
            <p className="text-sm text-gray-600">
              {data.total} transaction{data.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {data?.transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ArrowDownRight className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Transactions will appear here once you receive payments</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction Hash</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Address</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Confirmations</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-sm font-mono text-gray-900">
                          {tx.tx_hash.substring(0, 16)}...
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-sm font-mono text-gray-600">
                          {tx.btc_address.substring(0, 16)}...
                        </code>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatBTC(tx.amount_btc)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">BTC</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">{tx.confirmations}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={tx.status === 'confirmed' ? 'success' : 'warning'} size="sm">
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <a
                          href={`https://blockstream.info/testnet/tx/${tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {data?.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        tx.status === 'confirmed' ? 'bg-success-light' : 'bg-warning-light'
                      }`}>
                        <ArrowDownRight className={`h-4 w-4 ${
                          tx.status === 'confirmed' ? 'text-success' : 'text-warning'
                        }`} />
                      </div>
                      <div>
                        <Badge variant={tx.status === 'confirmed' ? 'success' : 'warning'} size="sm">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                    <a
                      href={`https://blockstream.info/testnet/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatBTC(tx.amount_btc)} BTC
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                      <code className="text-xs font-mono text-gray-700 break-all">
                        {tx.tx_hash}
                      </code>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm text-gray-700">{formatDate(tx.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Confirmations</p>
                        <p className="text-sm font-semibold text-gray-700">{tx.confirmations}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {data && data.total > limit && (
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {Math.ceil(data.total / limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.total}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default TransactionList
