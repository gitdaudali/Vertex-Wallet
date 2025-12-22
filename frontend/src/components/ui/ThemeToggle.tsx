import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { motion } from 'framer-motion'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="
        relative p-3 rounded-xl
        bg-white/90 dark:bg-gray-800/90
        backdrop-blur-md
        border border-gray-200/50 dark:border-gray-700/50
        shadow-lg shadow-gray-900/10 dark:shadow-black/30
        text-gray-700 dark:text-gray-200
        hover:bg-white dark:hover:bg-gray-800
        hover:shadow-xl
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 dark:focus:ring-offset-gray-900
        group
      "
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
        )}
      </motion.div>
    </motion.button>
  )
}

export default ThemeToggle

