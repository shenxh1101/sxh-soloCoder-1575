import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  Plus,
  Wallet,
  Receipt,
  Clock,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDate, formatMoney } from '@/utils/storage';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, orders, payments, getCustomerDebt, addPayment } = useStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const customer = customers.find((c) => c.id === id);
  const debt = id ? getCustomerDebt(id) : 0;

  const customerOrders = orders.filter(
    (o) => o.paymentType === 'credit' && o.customerId === id
  );
  const customerPayments = payments.filter((p) => p.customerId === id);

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (!id) return;

    addPayment(id, amount, paymentNote);
    setPaymentAmount('');
    setPaymentNote('');
    setShowPaymentModal(false);
  };

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">客户不存在</p>
        <Link to="/customers" className="text-primary-600 hover:underline">
          返回客户列表
        </Link>
      </div>
    );
  }

  const allRecords = [
    ...customerOrders.map((o) => ({
      type: 'order' as const,
      id: o.id,
      amount: o.total,
      date: o.createdAt,
      description: `订单 - ${o.items.length}项服务`,
    })),
    ...customerPayments.map((p) => ({
      type: 'payment' as const,
      id: p.id,
      amount: p.amount,
      date: p.createdAt,
      description: p.note || '还款',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回客户列表
      </button>

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-primary-100 text-sm">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {customer.phone || '未填写电话'}
                </span>
                {customer.note && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {customer.note}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm">当前欠款</p>
            <p className="text-4xl font-bold">¥{debt.toFixed(2)}</p>
          </div>
        </div>
        <button
          onClick={() => setShowPaymentModal(true)}
          disabled={debt <= 0}
          className="mt-6 w-full py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5" />
          记录还款
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Receipt className="w-4 h-4" />
            <span className="text-sm">挂账订单</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{customerOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">还款次数</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{customerPayments.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">累计挂账</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ¥{customerOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">交易记录</h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {allRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-400">暂无交易记录</div>
          ) : (
            allRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    record.type === 'order'
                      ? 'bg-red-100 text-red-500'
                      : 'bg-green-100 text-green-500'
                  }`}
                >
                  {record.type === 'order' ? <Receipt className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{record.description}</p>
                  <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                </div>
                <div
                  className={`text-lg font-bold ${
                    record.type === 'order' ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {record.type === 'order' ? '+' : '-'}¥{record.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">记录还款</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  还款金额 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-lg"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  当前欠款：¥{debt.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">备注</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="如：月底结款"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                确认还款
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
