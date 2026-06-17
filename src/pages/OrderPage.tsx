import { useState } from 'react';
import { useStore } from '@/store/useStore';
import ServiceCard from '@/components/ServiceCard';
import OrderItemRow from '@/components/OrderItemRow';
import {
  ShoppingCart,
  Trash2,
  CheckCircle,
  Save,
  CreditCard,
  Wallet,
  X,
} from 'lucide-react';
import { categoryLabels } from '@/types';
import type { ServiceCategory } from '@/types';
import { formatMoney } from '@/utils/storage';

const categories: { key: ServiceCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'copy', label: '复印' },
  { key: 'print', label: '打印' },
  { key: 'scan', label: '扫描' },
  { key: 'binding', label: '装订' },
];

export default function OrderPage() {
  const {
    services,
    currentOrder,
    customers,
    addToOrder,
    updateOrderItemQuantity,
    removeFromOrder,
    clearOrder,
    getOrderTotal,
    checkout,
    saveTemplate,
    getCustomerDebt,
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [lastOrder, setLastOrder] = useState<{ total: number; paymentType: 'cash' | 'credit'; customerName?: string } | null>(null);

  const filteredServices =
    activeCategory === 'all'
      ? services
      : services.filter((s) => s.category === activeCategory);

  const total = getOrderTotal();

  const handleCheckout = () => {
    if (currentOrder.length === 0) return;
    if (paymentType === 'credit' && !selectedCustomerId) return;

    const orderTotal = getOrderTotal();
    const customer = customers.find((c) => c.id === selectedCustomerId);
    setLastOrder({
      total: orderTotal,
      paymentType,
      customerName: paymentType === 'credit' ? customer?.name : undefined,
    });

    checkout(paymentType, paymentType === 'credit' ? selectedCustomerId : undefined);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setSelectedCustomerId('');
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveTemplate(templateName.trim());
    setTemplateName('');
    setShowSaveTemplate(false);
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">快速开单</h2>
            <p className="text-sm text-gray-500 mt-1">选择服务项目，快速生成订单</p>
          </div>
          {currentOrder.length > 0 && (
            <button
              onClick={() => setShowSaveTemplate(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存为模板
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeCategory === cat.key
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onAdd={() => addToOrder(service)}
            />
          ))}
        </div>
      </div>

      <div className="w-96 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800">当前订单</h3>
              </div>
              {currentOrder.length > 0 && (
                <button
                  onClick={clearOrder}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="p-5 max-h-80 overflow-y-auto">
            {currentOrder.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">暂无商品，点击左侧添加</p>
              </div>
            ) : (
              currentOrder.map((item) => (
                <OrderItemRow
                  key={item.serviceId}
                  item={item}
                  onUpdateQuantity={updateOrderItemQuantity}
                  onRemove={removeFromOrder}
                />
              ))
            )}
          </div>

          <div className="p-5 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">合计</span>
              <span className="text-2xl font-bold text-primary-600">
                ¥{total.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPaymentType('cash')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  paymentType === 'cash'
                    ? 'bg-secondary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                现金
              </button>
              <button
                onClick={() => setPaymentType('credit')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  paymentType === 'credit'
                    ? 'bg-secondary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                挂账
              </button>
            </div>

            {paymentType === 'credit' && (
              <div>
                <label className="text-sm text-gray-600 mb-2 block">选择客户</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-secondary-400 text-gray-700"
                >
                  <option value="">请选择挂账客户</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - 欠款 ¥{getCustomerDebt(c.id).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={currentOrder.length === 0 || (paymentType === 'credit' && !selectedCustomerId)}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              确认开单
            </button>
          </div>
        </div>
      </div>

      {showSuccess && lastOrder && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 z-50 animate-bounce-in min-w-80">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">开单成功！</h3>
            <p className="text-3xl font-bold text-primary-600 mb-3">
              ¥{lastOrder.total.toFixed(2)}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              {lastOrder.paymentType === 'cash' ? (
                <>
                  <Wallet className="w-4 h-4 text-green-500" />
                  现金支付
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  挂账 · {lastOrder.customerName}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showSaveTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">保存为模板</h3>
              <button
                onClick={() => setShowSaveTemplate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="输入模板名称，如：名片套装"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveTemplate(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
