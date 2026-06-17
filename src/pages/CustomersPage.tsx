import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User, Phone, FileText, Search, Trash2, AlertTriangle, Calendar, Printer, Download, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatMoney, formatDate, isThisMonth } from '@/utils/storage';

export default function CustomersPage() {
  const { customers, orders, payments, addCustomer, getCustomerDebt, deleteCustomer } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', note: '' });
  const [showDeleteWarning, setShowDeleteWarning] = useState<{ customerId: string; debt: number } | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.includes(searchText) ||
      c.phone.includes(searchText) ||
      c.note.includes(searchText)
  );

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) return;
    addCustomer(newCustomer);
    setNewCustomer({ name: '', phone: '', note: '' });
    setShowAddModal(false);
  };

  const totalDebt = customers.reduce((sum, c) => sum + getCustomerDebt(c.id), 0);

  const isInMonth = (dateStr: string, month: string) => {
    const date = new Date(dateStr);
    const [year, m] = month.split('-');
    return date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(m) - 1;
  };

  const getMonthlyBillData = () => {
    return customers
      .map((customer) => {
        const customerOrders = orders.filter(
          (o) => o.paymentType === 'credit' && o.customerId === customer.id && isInMonth(o.createdAt, selectedMonth)
        );
        const customerPayments = payments.filter(
          (p) => p.customerId === customer.id && isInMonth(p.createdAt, selectedMonth)
        );
        const orderTotal = customerOrders.reduce((sum, o) => sum + o.total, 0);
        const paymentTotal = customerPayments.reduce((sum, p) => sum + p.amount, 0);

        const prevOrders = orders.filter(
          (o) => o.paymentType === 'credit' && o.customerId === customer.id && new Date(o.createdAt) < new Date(selectedMonth + '-01')
        );
        const prevPayments = payments.filter(
          (p) => p.customerId === customer.id && new Date(p.createdAt) < new Date(selectedMonth + '-01')
        );
        const prevDebt = prevOrders.reduce((sum, o) => sum + o.total, 0) - prevPayments.reduce((sum, p) => sum + p.amount, 0);

        const currentDebt = prevDebt + orderTotal - paymentTotal;

        return {
          customer,
          prevDebt,
          orderTotal,
          paymentTotal,
          currentDebt,
          orders: customerOrders,
          payments: customerPayments,
        };
      })
      .filter((d) => d.orders.length > 0 || d.payments.length > 0 || d.prevDebt > 0 || d.currentDebt > 0)
      .sort((a, b) => b.currentDebt - a.currentDebt);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const data = getMonthlyBillData();
    const [year, month] = selectedMonth.split('-');
    let csv = `客户,上月欠款,本月挂账,本月还款,本月欠款\n`;
    data.forEach((d) => {
      csv += `"${d.customer.name}",${d.prevDebt.toFixed(2)},${d.orderTotal.toFixed(2)},${d.paymentTotal.toFixed(2)},${d.currentDebt.toFixed(2)}\n`;
    });
    csv += `\n合计,,${data.reduce((s, d) => s + d.orderTotal, 0).toFixed(2)},${data.reduce((s, d) => s + d.paymentTotal, 0).toFixed(2)},${data.reduce((s, d) => s + d.currentDebt, 0).toFixed(2)}\n`;

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${year}年${month}月账单.csv`;
    link.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">客户管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {customers.length} 位客户，总挂账 {formatMoney(totalDebt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary-500 text-white font-medium rounded-xl hover:bg-secondary-600 transition-colors shadow-md hover:shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            月度账单
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            新增客户
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索客户姓名、电话或备注..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400">暂无客户，点击右上角添加</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredCustomers.map((customer) => {
              const debt = getCustomerDebt(customer.id);
              return (
                <div
                  key={customer.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{customer.name}</h4>
                      {debt > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                          欠款中
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone || '未填写'}
                      </span>
                      {customer.note && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {customer.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        debt > 0 ? 'text-red-500' : 'text-gray-400'
                      }`}
                    >
                      {debt > 0 ? '¥' + debt.toFixed(2) : '无欠款'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/customers/${customer.id}`}
                      className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      详情
                    </Link>
                    <button
                      onClick={() => {
                        if (debt > 0) {
                          setShowDeleteWarning({ customerId: customer.id, debt });
                        } else if (confirm('确定删除此客户吗？')) {
                          deleteCustomer(customer.id);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        debt > 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={debt > 0 ? '该客户有欠款，无法删除' : '删除客户'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">新增客户</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  客户姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="请输入客户姓名"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">联系电话</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="请输入联系电话"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">备注</label>
                <input
                  type="text"
                  value={newCustomer.note}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, note: e.target.value })
                  }
                  placeholder="如：XX公司、老客户等"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name.trim()}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">无法删除客户</h3>
                <p className="text-sm text-gray-500">该客户仍有未结清的欠款</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">当前欠款金额</p>
              <p className="text-2xl font-bold text-red-500">¥{showDeleteWarning.debt.toFixed(2)}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              请先结清该客户的所有欠款后再删除。您也可以在客户详情页查看完整的交易记录。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteWarning(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                我知道了
              </button>
              <button
                onClick={() => {
                  const customer = customers.find((c) => c.id === showDeleteWarning.customerId);
                  setShowDeleteWarning(null);
                  if (customer) {
                    window.location.href = `/customers/${customer.id}`;
                  }
                }}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      )}

      {showBillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:bg-transparent print:p-0 print:inset-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col print:shadow-none print:max-h-none print:max-w-none print:rounded-none">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between print:hidden">
              <div>
                <h3 className="text-xl font-bold text-gray-800">月度账单</h3>
                <p className="text-sm text-gray-500 mt-1">选择月份，生成对账单</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                />
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  打印
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出
                </button>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="print:block hidden mb-8 text-center">
                <h2 className="text-2xl font-bold">{selectedMonth.split('-')[0]}年{selectedMonth.split('-')[1]}月 对账单</h2>
                <p className="text-gray-500 mt-2">打印日期：{new Date().toLocaleDateString('zh-CN')}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-bold text-gray-700">客户</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-700">上月欠款</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-700">本月挂账</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-700">本月还款</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-700">本月欠款</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getMonthlyBillData().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400">
                          该月份暂无账单数据
                        </td>
                      </tr>
                    ) : (
                      getMonthlyBillData().map((data) => (
                        <tr key={data.customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-800">{data.customer.name}</div>
                            <div className="text-xs text-gray-400">{data.customer.phone || data.customer.note}</div>
                          </td>
                          <td className="text-right py-3 px-4 text-gray-600">¥{data.prevDebt.toFixed(2)}</td>
                          <td className="text-right py-3 px-4 text-orange-500 font-medium">¥{data.orderTotal.toFixed(2)}</td>
                          <td className="text-right py-3 px-4 text-green-500 font-medium">¥{data.paymentTotal.toFixed(2)}</td>
                          <td className={`text-right py-3 px-4 font-bold ${data.currentDebt > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            ¥{data.currentDebt.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {getMonthlyBillData().length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-700">合计</td>
                        <td className="text-right py-3 px-4 font-bold text-gray-700">
                          ¥{getMonthlyBillData().reduce((s, d) => s + d.prevDebt, 0).toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4 font-bold text-orange-500">
                          ¥{getMonthlyBillData().reduce((s, d) => s + d.orderTotal, 0).toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4 font-bold text-green-500">
                          ¥{getMonthlyBillData().reduce((s, d) => s + d.paymentTotal, 0).toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4 font-bold text-red-500">
                          ¥{getMonthlyBillData().reduce((s, d) => s + d.currentDebt, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
