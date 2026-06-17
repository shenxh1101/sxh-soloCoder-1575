import { Minus, Plus, Trash2 } from 'lucide-react';
import type { OrderItem } from '@/types';

interface OrderItemRowProps {
  item: OrderItem;
  onUpdateQuantity: (serviceId: string, quantity: number) => void;
  onRemove: (serviceId: string) => void;
}

export default function OrderItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: OrderItemRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{item.serviceName}</p>
        <p className="text-sm text-gray-500">¥{item.price.toFixed(2)} / 份</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={() => onUpdateQuantity(item.serviceId, item.quantity - 1)}
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            onUpdateQuantity(item.serviceId, parseInt(e.target.value) || 1)
          }
          className="w-14 h-7 text-center text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
        />
        <button
          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={() => onUpdateQuantity(item.serviceId, item.quantity + 1)}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="w-20 text-right">
        <p className="font-semibold text-gray-800">¥{item.subtotal.toFixed(2)}</p>
      </div>

      <button
        className="w-7 h-7 rounded-lg text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
        onClick={() => onRemove(item.serviceId)}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
