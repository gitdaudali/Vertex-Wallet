import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { Bitcoin, DollarSign, FileText } from 'lucide-react'
import { invoiceService, CreateInvoiceRequest } from '../../services/invoice'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Badge from '../ui/Badge'
import QRCodeBox from '../ui/QRCodeBox'
import { useToast } from '../../hooks/useToast'

const CreateInvoice = () => {
  const [amountBtc, setAmountBtc] = useState('')
  const [amountUsd, setAmountUsd] = useState('')
  const [description, setDescription] = useState('')
  const [expiresInHours, setExpiresInHours] = useState(24)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const createMutation = useMutation(invoiceService.create, {
    onSuccess: () => {
      showToast('Invoice created successfully!', 'success')
      navigate('/invoices')
    },
    onError: (err: any) => {
      showToast(err.response?.data?.detail || 'Failed to create invoice', 'error')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amountBtc && !amountUsd) {
      showToast('Please enter either BTC or USD amount', 'warning')
      return
    }

    const data: CreateInvoiceRequest = {
      description: description || undefined,
      expires_in_hours: expiresInHours,
    }

    if (amountBtc) {
      data.amount_btc = amountBtc
    } else {
      data.amount_usd = parseFloat(amountUsd)
    }

    createMutation.mutate(data)
  }

  if (createMutation.isSuccess && createMutation.data) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Created</h1>
          <p className="text-gray-600 mt-1">Share this invoice to receive payment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <div className="space-y-6">
              <div>
                <Badge variant={createMutation.data.status === 'paid' ? 'success' : 'warning'} size="md" className="mb-4">
                  {createMutation.data.status.toUpperCase()}
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {createMutation.data.amount_btc} BTC
                </h2>
                {createMutation.data.amount_usd && (
                  <p className="text-lg text-gray-600">
                    ${createMutation.data.amount_usd.toFixed(2)} USD
                  </p>
                )}
              </div>

              {createMutation.data.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{createMutation.data.description}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Bitcoin Address</span>
                  <code className="text-xs font-mono text-gray-600">
                    {createMutation.data.btc_address.substring(0, 20)}...
                  </code>
                </div>
                {createMutation.data.expires_at && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Expires</span>
                    <span className="text-sm text-gray-600">
                      {new Date(createMutation.data.expires_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(createMutation.data!.btc_address)}
                  className="flex-1"
                >
                  Copy Address
                </Button>
                <Button onClick={() => navigate('/invoices')} className="flex-1">
                  View All Invoices
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment QR Code</h3>
              <p className="text-sm text-gray-600">Scan to pay with Bitcoin</p>
            </div>
            {createMutation.data.qr_code_data && (
              <QRCodeBox
                value={createMutation.data.qr_code_data}
                address={createMutation.data.btc_address}
              />
            )}
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600 mt-1">Generate a new payment invoice</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Amount (BTC)"
              type="number"
              step="0.00000001"
              value={amountBtc}
              onChange={(e) => {
                setAmountBtc(e.target.value)
                setAmountUsd('')
              }}
              placeholder="0.001"
              leftIcon={<Bitcoin className="h-5 w-5" />}
              helperText="Or enter USD amount"
            />

            <Input
              label="Amount (USD)"
              type="number"
              step="0.01"
              value={amountUsd}
              onChange={(e) => {
                setAmountUsd(e.target.value)
                setAmountBtc('')
              }}
              placeholder="50.00"
              leftIcon={<DollarSign className="h-5 w-5" />}
              helperText="Will be converted to BTC"
            />
          </div>

          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment for services..."
            leftIcon={<FileText className="h-5 w-5" />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires In
            </label>
            <select
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:border-transparent"
            >
              <option value={1}>1 hour</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={168}>7 days</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isLoading}
            isLoading={createMutation.isLoading}
            fullWidth
            size="lg"
          >
            Create Invoice
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default CreateInvoice
