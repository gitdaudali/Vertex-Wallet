import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import Button from './Button'

interface QRCodeBoxProps {
  value: string
  address?: string
  size?: number
  className?: string
}

const QRCodeBox = ({ value, address, size = 256, className }: QRCodeBoxProps) => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    const textToCopy = address || value
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="bg-white p-4 rounded-xl shadow-card border border-gray-100">
        <QRCodeSVG value={value} size={size} />
      </div>
      {address && (
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="flex-1 text-sm text-gray-700 break-all font-mono">
              {address}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
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
        </div>
      )}
    </div>
  )
}

export default QRCodeBox

