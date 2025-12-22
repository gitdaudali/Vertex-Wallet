import { motion } from 'framer-motion'
import Card from '../ui/Card'

interface Dashboard3DCardProps {
  children: React.ReactNode
  className?: string
}

export const Dashboard3DCard = ({ children, className }: Dashboard3DCardProps) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -4,
        rotateX: 2,
        rotateY: -2,
        transition: { duration: 0.3 },
      }}
      style={{ perspective: 1000 }}
    >
      <Card hover className="h-full">
        {children}
      </Card>
    </motion.div>
  )
}

export default Dashboard3DCard

