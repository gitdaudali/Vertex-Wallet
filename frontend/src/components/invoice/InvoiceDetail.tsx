import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ArrowLeft, Copy, CheckCircle, Clock, Calendar } from 'lucide-react'
import { invoiceService } from '../../services/invoice'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import QRCodeBox from '../ui/QRCodeBox'
import Skeleton from '../ui/Skeleton'
import { formatBTC, formatDate } from '../../utils/format'
import { useState } from 'react'
import { useToast } from '../../hooks/useToast'

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>()
  const invoiceId = parseInt(id || '0')
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const { data: invoice, isLoading } = useQuery(
    ['invoice', invoiceId],
    () => invoiceService.getById(invoiceId),
    { refetchInterval: 10000 }
  )

  const copyAddress = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice.btc_address)
      setCopied(true)
      showToast('Address copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <Skeleton className="h-64" />
          </Card>
          <Card>
            <Skeleton className="h-64" />
          </Card>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice not found</h2>
        <Link to="/invoices">
          <Button variant="outline" className="mt-4">
            Back to Invoices
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <Link to="/invoices">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.id}</h1>
          <Badge
            variant={
              invoice.status === 'paid'
                ? 'success'
                : invoice.status === 'expired'
                ? 'error'
                : 'warning'
            }
            size="md"
          >
            {invoice.status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-gray-600">Payment details and QR code</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {formatBTC(invoice.amount_btc)} BTC
              </h2>
              {invoice.amount_usd && (
                <p className="text-lg text-gray-600">
                  ${invoice.amount_usd.toFixed(2)} USD
                </p>
              )}
            </div>

            {invoice.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{invoice.description}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Bitcoin Address</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono text-gray-700 break-all">
                  {invoice.btc_address}
                </code>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <p className="font-medium text-gray-900">{formatDate(invoice.created_at)}</p>
              </div>
              {invoice.expires_at && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="h-4 w-4" />
                    Expires
                  </div>
                  <p className="font-medium text-gray-900">{formatDate(invoice.expires_at)}</p>
                </div>
              )}
              {invoice.paid_at && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    Paid At
                  </div>
                  <p className="font-medium text-gray-900">{formatDate(invoice.paid_at)}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment QR Code</h3>
            <p className="text-sm text-gray-600">Scan this QR code to send payment</p>
          </div>
          {invoice.qr_code_data && (
            <QRCodeBox
              value={invoice.qr_code_data}
              address={invoice.btc_address}
            />
          )}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Send the exact amount to the address above. The invoice will be marked as paid once the transaction is confirmed.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default InvoiceDetail
