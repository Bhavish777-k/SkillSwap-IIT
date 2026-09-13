import { useState, useEffect } from 'react';
import { pointsService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';

const PointsPage = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('balance');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, transactionsRes, packagesRes] = await Promise.all([
        pointsService.getBalance(),
        pointsService.getTransactions({ limit: 10 }),
        pointsService.getPackages()
      ]);
      
      setBalance(balanceRes.data);
      setTransactions(transactionsRes.data);
      setPackages(packagesRes.data);
    } catch (error) {
      console.error('Error fetching points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg) => {
    setPurchaseLoading(true);
    try {
      // Simulate payment ID (in real app, integrate with Stripe/PayPal)
      const paymentId = 'MOCK_PAYMENT_' + Date.now();
      const totalPoints = pkg.points + pkg.bonus;
      
      const response = await pointsService.purchasePoints(totalPoints, paymentId);
      
      alert(response.message);
      await fetchData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
      case 'bonus':
      case 'purchased':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        );
      case 'spent':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" transform="rotate(180 10 10)" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Points System</h1>
        <p className="text-gray-600">Manage your points and purchase more to continue learning</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-purple-100 text-sm mb-2">Current Balance</p>
            <h2 className="text-5xl font-bold mb-4">{balance?.currentBalance?.toLocaleString() || 0}</h2>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-purple-100">Total Earned</p>
                <p className="font-semibold text-lg">{balance?.totalEarned?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-purple-100">Total Spent</p>
                <p className="font-semibold text-lg">{balance?.totalSpent?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="text-6xl opacity-20">
            💎
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('balance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'balance'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transaction History
            </button>
            <button
              onClick={() => setActiveTab('purchase')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'purchase'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Purchase Points
            </button>
          </nav>
        </div>
      </div>

      {/* Transaction History Tab */}
      {activeTab === 'balance' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'spent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'spent' ? '-' : '+'}{transaction.amount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchase Points Tab */}
      {activeTab === 'purchase' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-blue-900">How points work:</p>
                <ul className="text-sm text-blue-800 mt-1 space-y-1">
                  <li>• New users get 100 free points</li>
                  <li>• Sessions cost 10 points per hour</li>
                  <li>• Larger packages include bonus points</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden ${
                  pkg.popular ? 'ring-2 ring-purple-600' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-4xl font-bold text-gray-800 mb-2">
                      {pkg.points}
                      {pkg.bonus > 0 && (
                        <span className="text-lg text-green-600"> +{pkg.bonus}</span>
                      )}
                    </h3>
                    <p className="text-gray-600">Points</p>
                  </div>
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-purple-600">${pkg.price}</p>
                    {pkg.bonus > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Bonus: {pkg.bonus} points free!
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchaseLoading}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      pkg.popular
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {purchaseLoading ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Payment Methods</h4>
            <p className="text-sm text-gray-600 mb-4">
              This is a demo implementation. In production, integrate with payment providers like Stripe or PayPal.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="text-sm">Credit Card</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.804.804 0 01-.793.679H8.334c-.414 0-.686-.425-.586-.825l1.713-10.85a.804.804 0 01.793-.679h2.003c3.11 0 5.212-.978 6.24-3.848a3.187 3.187 0 01.57-1.037z"/>
                </svg>
                <span className="text-sm">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsPage;
