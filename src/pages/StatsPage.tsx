import { useStore } from '@/store/useStore';
import {
  Wallet,
  CreditCard,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { formatMoney } from '@/utils/storage';

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

      <div className="grid grid-cols-3 gap-6">
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
    </div>
  );
}
