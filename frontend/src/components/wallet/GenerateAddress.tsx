import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { Wallet, Copy, RefreshCw } from 'lucide-react'
import { walletService } from '../../services/wallet'
import Card from '../ui/Card'
import Button from '../ui/Button'
import QRCodeBox from '../ui/QRCodeBox'
import Skeleton from '../ui/Skeleton'
import { useToast } from '../../hooks/useToast'

const GenerateAddress = () => {
  const [address, setAddress] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const generateMutation = useMutation(walletService.generateAddress, {
    onSuccess: (data) => {
      setAddress(data.btc_address)
      queryClient.invalidateQueries('wallet-balance')
      showToast('Address generated successfully!', 'success')
    },
    onError: () => {
      showToast('Failed to generate address', 'error')
    },
  })

  const handleGenerate = () => {
    generateMutation.mutate()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate Bitcoin Address</h1>
        <p className="text-gray-600 mt-1">Create a new receiving address for Bitcoin payments</p>
      </div>

      {!address && !generateMutation.isLoading && (
        <Card>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-bitcoin to-bitcoin-dark rounded-2xl mb-6 shadow-lg">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate New Address</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Click the button below to generate a new Bitcoin address. You can use this address to receive payments.
            </p>
            <Button onClick={handleGenerate} size="lg">
              <RefreshCw className="h-5 w-5 mr-2" />
              Generate Address
            </Button>
          </div>
        </Card>
      )}

      {generateMutation.isLoading && (
        <Card>
          <div className="text-center py-12">
            <Skeleton className="h-64 w-64 mx-auto mb-6 rounded-xl" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
        </Card>
      )}

      {address && (
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your Bitcoin Address</h2>
                <p className="text-sm text-gray-600">
                  Share this address or QR code to receive Bitcoin payments
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <code className="text-sm font-mono text-gray-700 break-all">
                  {address}
                </code>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(address)
                    showToast('Address copied!', 'success')
                  }}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Address
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleGenerate}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Another
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code</h3>
              <p className="text-sm text-gray-600">Scan to send Bitcoin</p>
            </div>
            <QRCodeBox value={address} address={address} />
          </Card>
        </div>
      )}
    </div>
  )
}

export default GenerateAddress
