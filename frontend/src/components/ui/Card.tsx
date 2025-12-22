import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = ({ children, className, hover = false, padding = 'md' }: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-card border border-gray-100',
        paddingClasses[padding],
        hover && 'hover:shadow-card-hover transition-shadow duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card

