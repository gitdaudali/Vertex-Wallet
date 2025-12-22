import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './components/common/ThemeProvider'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/common/Layout'
import Login3D from './components/auth/Login3D'
import Register3D from './components/auth/Register3D'
import WalletDashboard from './components/wallet/WalletDashboard'
import GenerateAddress from './components/wallet/GenerateAddress'
import CreateInvoice from './components/invoice/CreateInvoice'
import InvoiceList from './components/invoice/InvoiceList'
import InvoiceDetail from './components/invoice/InvoiceDetail'
import TransactionList from './components/transactions/TransactionList'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login3D />} />
              <Route path="/register" element={<Register3D />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<WalletDashboard />} />
                <Route path="generate-address" element={<GenerateAddress />} />
                <Route path="invoices" element={<InvoiceList />} />
                <Route path="invoices/create" element={<CreateInvoice />} />
                <Route path="invoices/:id" element={<InvoiceDetail />} />
                <Route path="transactions" element={<TransactionList />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App

