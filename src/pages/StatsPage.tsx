import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  Wallet,
  CreditCard,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
  Filter,
  X,
} from 'lucide-react';
import { formatDate } from '@/utils/storage';

export default function StatsPage() {
  const { getTodayStats, getMonthlyServiceStats, getTotalDebt, customers, orders } =
    useStore();

  const todayStats = getTodayStats();
  const monthlyStats = getMonthlyServiceStats();
  const totalDebt = getTotalDebt();
  const maxStat = monthlyStats.length > 0 ? monthlyStats[0].total : 1;

  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'credit'>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (startDate) {
        const orderDate = new Date(order.createdAt);
        const start = new Date(startDate);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const orderDate = new Date(order.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
      if (paymentFilter !== 'all' && order.paymentType !== paymentFilter) {
        return false;
      }
      if (customerFilter !== 'all' && order.customerId !== customerFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, startDate, endDate, paymentFilter, customerFilter]);

  const filteredCashTotal = filteredOrders
    .filter((o) => o.paymentType === 'cash')
    .reduce((sum, o) => sum + o.total, 0);
  const filteredCreditTotal = filteredOrders
    .filter((o) => o.paymentType === 'credit')
    .reduce((sum, o) => sum + o.total, 0);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentFilter('all');
    setCustomerFilter('all');
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '';
    return customers.find((c) => c.id === customerId)?.name || '';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">统计报表</h2>
        <p className="text-sm text-gray-500 mt-1">查看营业数据和项目统计</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="w-8 h-8 text-white/80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">今日</span>
          </div>
          <p className="text-3xl font-bold">¥{todayStats.cash.toFixed(2)}</p>
          <p className="text-sm text-white/70 mt-1">现金收入</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-8 h-8 text-white/80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">今日</span>
          </div>
          <p className="text-3xl font-bold">¥{todayStats.credit.toFixed(2)}</p>
          <p className="text-sm text-white/70 mt-1">挂账金额</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-8 h-8 text-white/80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">今日</span>
          </div>
          <p className="text-3xl font-bold">{todayStats.orderCount}</p>
          <p className="text-sm text-white/70 mt-1">订单数量</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-white/80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">累计</span>
          </div>
          <p className="text-3xl font-bold">¥{totalDebt.toFixed(2)}</p>
          <p className="text-sm text-white/70 mt-1">待收欠款</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">本月服务项目收入排行</h3>
            </div>
          </div>

          {monthlyStats.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p>本月暂无数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyStats.map((stat, index) => (
                <div key={stat.name} className="flex items-center gap-4">
                  <div className="w-6 text-center">
                    <span
                      className={`text-sm font-bold ${
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                          ? 'text-gray-400'
                          : index === 2
                          ? 'text-orange-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="w-24 text-sm font-medium text-gray-700 truncate">
                    {stat.name}
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-lg transition-all duration-500"
                      style={{ width: `${(stat.total / maxStat) * 100}%` }}
                    />
                  </div>
                  <div className="w-28 text-right">
                    <p className="font-bold text-gray-800">
                      ¥{stat.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">{stat.count} 份</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-secondary-500" />
              <h3 className="font-bold text-gray-800">累计数据</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">总订单数</span>
                <span className="font-bold text-gray-800">{totalOrders} 单</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">总收入</span>
                <span className="font-bold text-secondary-600">
                  ¥{totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">客户总数</span>
                <span className="font-bold text-gray-800">{totalCustomers} 位</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-800">欠款客户</h3>
            </div>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-red-500">¥{totalDebt.toFixed(2)}</p>
              <p className="text-sm text-gray-400">待收总额</p>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customers
                .map((c) => {
                  const { getCustomerDebt } = useStore.getState();
                  return { customer: c, debt: getCustomerDebt(c.id) };
                })
                .filter((item) => item.debt > 0)
                .sort((a, b) => b.debt - a.debt)
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.customer.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-700">{item.customer.name}</span>
                    <span className="text-sm font-medium text-red-500">
                      ¥{item.debt.toFixed(2)}
                    </span>
                  </div>
                ))}
              {customers.filter((c) => {
                const { getCustomerDebt } = useStore.getState();
                return getCustomerDebt(c.id) > 0;
              }).length === 0 && (
                <p className="text-center text-gray-400 py-4">暂无欠款客户</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">订单记录查询</h3>
              <span className="text-sm text-gray-400">
                共 {filteredOrders.length} 条记录
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              筛选
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">开始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">结束日期</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">支付方式</label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'cash' | 'credit')}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                  >
                    <option value="all">全部</option>
                    <option value="cash">现金</option>
                    <option value="credit">挂账</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">客户</label>
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 min-w-32"
                  >
                    <option value="all">全部客户</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  重置
                </button>
              </div>

              {(startDate || endDate || paymentFilter !== 'all' || customerFilter !== 'all') && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">现金合计：</span>
                    <span className="font-bold text-green-600">¥{filteredCashTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">挂账合计：</span>
                    <span className="font-bold text-orange-600">¥{filteredCreditTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary-500" />
                    <span className="text-sm text-gray-600">总计：</span>
                    <span className="font-bold text-primary-600">¥{(filteredCashTotal + filteredCreditTotal).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p>暂无符合条件的订单</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id}>
                <div
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      order.paymentType === 'cash'
                        ? 'bg-green-100 text-green-500'
                        : 'bg-orange-100 text-orange-500'
                    }`}
                  >
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">
                        订单 - {order.items.length}项服务
                      </p>
                      {order.paymentType === 'cash' ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                          现金
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">
                          挂账 · {order.customerName || '客户'}
                        </span>
                      )}
                      {expandedOrderId === order.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div
                    className={`text-lg font-bold flex-shrink-0 ${
                      order.paymentType === 'cash' ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    ¥{order.total.toFixed(2)}
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="bg-gray-50 border-t border-gray-100 px-4 py-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs">
                          <th className="text-left py-2 font-medium">服务项目</th>
                          <th className="text-right py-2 font-medium">单价</th>
                          <th className="text-right py-2 font-medium">数量</th>
                          <th className="text-right py-2 font-medium">小计</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {order.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 text-gray-700">{item.serviceName}</td>
                            <td className="py-2 text-right text-gray-500">¥{item.price.toFixed(2)}</td>
                            <td className="py-2 text-right text-gray-500">{item.quantity}</td>
                            <td className="py-2 text-right font-medium text-gray-700">¥{item.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td colSpan={3} className="py-2 text-right font-medium text-gray-700">合计</td>
                          <td className={`py-2 text-right font-bold ${order.paymentType === 'cash' ? 'text-green-600' : 'text-orange-600'}`}>
                            ¥{order.total.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
