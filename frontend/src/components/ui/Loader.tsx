import { Loader2 } from 'lucide-react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Loader = ({ size = 'md', className }: LoaderProps) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }
  
  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-bitcoin`} />
    </div>
  )
}

export default Loader

