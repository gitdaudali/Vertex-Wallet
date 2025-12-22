import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { PlusCircle, Filter, ArrowRight } from 'lucide-react'
import { invoiceService } from '../../services/invoice'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Skeleton from '../ui/Skeleton'
import { formatBTC, formatDate } from '../../utils/format'

const InvoiceList = () => {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(0)
  const limit = 10

  const { data, isLoading } = useQuery(
    ['invoices', statusFilter, page],
    () => invoiceService.list(statusFilter || undefined, limit, page * limit),
    { refetchInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage your payment invoices</p>
        </div>
        <Link to="/invoices/create">
          <Button size="lg" className="w-full sm:w-auto">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Invoice
          </Button>
        </Link>
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
              <option value="paid">Paid</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          {data && data.total > 0 && (
            <p className="text-sm text-gray-600">
              {data.total} invoice{data.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {data?.invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <PlusCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600 mb-6">Create your first invoice to start accepting payments</p>
            <Link to="/invoices/create">
              <Button>Create Invoice</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  to={`/invoices/${invoice.id}`}
                  className="block group"
                >
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'success'
                            : invoice.status === 'expired'
                            ? 'error'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {invoice.status}
                      </Badge>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-bitcoin transition-colors" />
                    </div>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {formatBTC(invoice.amount_btc)}
                      </p>
                      {invoice.amount_usd && (
                        <p className="text-sm text-gray-600">
                          ${invoice.amount_usd.toFixed(2)} USD
                        </p>
                      )}
                    </div>
                    {invoice.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {invoice.description}
                      </p>
                    )}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {formatDate(invoice.created_at)}
                      </p>
                      <code className="text-xs font-mono text-gray-400 block mt-1 truncate">
                        {invoice.btc_address.substring(0, 20)}...
                      </code>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {data && data.total > limit && (
              <div className="flex items-center justify-center gap-4 pt-6">
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

export default InvoiceList
