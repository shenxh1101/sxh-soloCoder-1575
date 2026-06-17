import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User, Phone, FileText, Search, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatMoney } from '@/utils/storage';

export default function CustomersPage() {
  const { customers, addCustomer, getCustomerDebt, deleteCustomer } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', note: '' });

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">客户管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {customers.length} 位客户，总挂账 {formatMoney(totalDebt)}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          新增客户
        </button>
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
                        if (confirm('确定删除此客户吗？')) {
                          deleteCustomer(customer.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
}
