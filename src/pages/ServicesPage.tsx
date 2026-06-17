import { useState } from 'react';
import { Plus, Edit2, Trash2, Settings, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { categoryLabels, categoryColors } from '@/types';
import type { ServiceCategory } from '@/types';

const categoryOptions: { key: ServiceCategory; label: string }[] = [
  { key: 'copy', label: '复印' },
  { key: 'print', label: '打印' },
  { key: 'scan', label: '扫描' },
  { key: 'binding', label: '装订' },
];

export default function ServicesPage() {
  const { services, addService, updateService, deleteService } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'copy' as ServiceCategory,
    unit: '张',
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', category: 'copy', unit: '张' });
    setShowModal(true);
  };

  const handleOpenEdit = (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    setEditingId(id);
    setFormData({
      name: service.name,
      price: service.price.toString(),
      category: service.category,
      unit: service.unit,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    const price = parseFloat(formData.price);
    if (!formData.name.trim() || isNaN(price) || price <= 0) return;

    if (editingId) {
      updateService(editingId, {
        name: formData.name.trim(),
        price,
        category: formData.category,
        unit: formData.unit,
      });
    } else {
      addService({
        name: formData.name.trim(),
        price,
        category: formData.category,
        unit: formData.unit,
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除此服务项目吗？')) {
      deleteService(id);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<ServiceCategory, typeof services>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">服务管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {services.length} 个服务项目
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          新增服务
        </button>
      </div>

      <div className="space-y-6">
        {categoryOptions.map((cat) => {
          const catServices = groupedServices[cat.key] || [];
          if (catServices.length === 0) return null;
          return (
            <div key={cat.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  {cat.label}类
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {catServices.map((service) => (
                  <div
                    key={service.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[service.category]}`}
                      >
                        <span className="font-bold text-lg">{service.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{service.name}</h4>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 text-xs rounded-full ${categoryColors[service.category]}`}
                        >
                          {categoryLabels[service.category]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">
                          ¥{service.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">每{service.unit}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(service.id)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? '编辑服务' : '新增服务'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  服务名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：黑白复印"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  单价（元）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ServiceCategory })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="张/本/页"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || !formData.price}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {editingId ? '保存修改' : '确认添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
