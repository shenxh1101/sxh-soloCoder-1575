import { Plus } from 'lucide-react';
import type { Service } from '@/types';
import { categoryLabels, categoryColors } from '@/types';

interface ServiceCardProps {
  service: Service;
  onAdd: () => void;
}

export default function ServiceCard({ service, onAdd }: ServiceCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200 group cursor-pointer"
      onClick={onAdd}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
            {service.name}
          </h3>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${categoryColors[service.category]}`}
          >
            {categoryLabels[service.category]}
          </span>
        </div>
        <button
          className="w-8 h-8 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary-500 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-primary-600">
            ¥{service.price.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">每{service.unit}</p>
        </div>
      </div>
    </div>
  );
}
