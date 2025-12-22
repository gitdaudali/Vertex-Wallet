import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { PlusCircle, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react'
import { walletService, WalletBalance } from '../../services/wallet'
import { transactionService } from '../../services/transaction'
import { motion } from 'framer-motion'
import BalanceCard from './BalanceCard'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Skeleton from '../ui/Skeleton'
import { formatBTC, formatDate } from '../../utils/format'

const WalletDashboard = () => {
  const { data: balance, isLoading: balanceLoading } = useQuery<WalletBalance>(
    'wallet-balance',
    walletService.getBalance,
    { refetchInterval: 30000 }
  )

  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    'recent-transactions',
    () => transactionService.list(undefined, 5, 0),
    { refetchInterval: 30000 }
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your Bitcoin wallet</p>
        </div>
        <Link to="/invoices/create">
          <Button size="lg" className="w-full sm:w-auto">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </motion.div>

      {/* Balance Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        {balanceLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-24" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <BalanceCard
              title="Total Balance"
              amount={balance?.total_balance_btc || '0'}
              subtitle="All transactions"
              icon="total"
            />
            <BalanceCard
              title="Confirmed"
              amount={balance?.confirmed_balance_btc || '0'}
              subtitle="1+ confirmations"
              icon="confirmed"
            />
            <BalanceCard
              title="Pending"
              amount={balance?.pending_balance_btc || '0'}
              subtitle="Unconfirmed"
              icon="pending"
            />
            <BalanceCard
              title="Total Received"
              amount={balance?.total_received_btc || '0'}
              subtitle="All time"
              icon="received"
            />
          </>
        )}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-600 mt-1">Your latest Bitcoin transactions</p>
          </div>
          <Link to="/transactions">
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {transactionsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : transactions?.transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ArrowDownRight className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600 mb-6">Start by generating an address or creating an invoice</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/generate-address">
                <Button variant="outline">Generate Address</Button>
              </Link>
              <Link to="/invoices/create">
                <Button>Create Invoice</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions?.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    tx.status === 'confirmed' 
                      ? 'bg-success-light' 
                      : 'bg-warning-light'
                  }`}>
                    {tx.status === 'confirmed' ? (
                      <ArrowDownRight className={`h-5 w-5 ${
                        tx.status === 'confirmed' ? 'text-success' : 'text-warning'
                      }`} />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono text-gray-900 truncate">
                        {tx.tx_hash.substring(0, 16)}...
                      </code>
                      <Badge variant={tx.status === 'confirmed' ? 'success' : 'warning'} size="sm">
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(tx.created_at)} • {tx.confirmations} confirmations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatBTC(tx.amount_btc)}
                    </p>
                    <p className="text-xs text-gray-500">BTC</p>
                  </div>
                  <a
                    href={`https://blockstream.info/testnet/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      </motion.div>

      {/* Addresses */}
      {balance?.addresses && balance.addresses.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Addresses</h2>
          <div className="space-y-3">
            {balance.addresses.map((addr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <code className="text-sm font-mono text-gray-700 break-all flex-1 mr-4">
                  {addr.address}
                </code>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-bitcoin">
                    {formatBTC(addr.balance)} BTC
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

export default WalletDashboard
