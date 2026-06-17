import { useNavigate } from 'react-router-dom';
import { FileText, Play, Trash2, Plus, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDateShort } from '@/utils/storage';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { templates, services, applyTemplate, deleteTemplate } = useStore();

  const handleApply = (templateId: string) => {
    applyTemplate(templateId);
    navigate('/');
  };

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || '未知服务';
  };

  const getTemplateTotal = (template: typeof templates[0]) => {
    return template.items.reduce((sum, item) => {
      const service = services.find((s) => s.id === item.serviceId);
      return sum + (service ? service.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">模板管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            保存常用的订单配置，下次一键调用
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          去开单页创建模板
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无模板</h3>
          <p className="text-gray-400 mb-6">在开单页面配置好服务项目后，点击"保存为模板"</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
          >
            去开单
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5 border-b border-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{template.name}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDateShort(template.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-2 mb-4">
                  {template.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {getServiceName(item.serviceId)}
                      </span>
                      <span className="text-gray-500">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">预计价格</p>
                    <p className="text-xl font-bold text-primary-600">
                      ¥{getTemplateTotal(template).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApply(template.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-secondary-500 text-white text-sm font-medium rounded-lg hover:bg-secondary-600 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      使用
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除此模板吗？')) {
                          deleteTemplate(template.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
