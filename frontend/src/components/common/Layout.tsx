import { Outlet } from 'react-router-dom'
import Navbar from '../layout/Navbar'
import { useToast } from '../../hooks/useToast'

const Layout = () => {
  const { ToastContainer } = useToast()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}

export default Layout
