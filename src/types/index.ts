export type ServiceCategory = 'copy' | 'print' | 'scan' | 'binding';

export interface Service {
  id: string;
  name: string;
  price: number;
  category: ServiceCategory;
  unit: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  note: string;
  createdAt: string;
}

export interface OrderItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  paymentType: 'cash' | 'credit';
  customerId?: string;
  customerName?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  note: string;
  createdAt: string;
}

export interface TemplateItem {
  serviceId: string;
  quantity: number;
}

export interface Template {
  id: string;
  name: string;
  items: TemplateItem[];
  createdAt: string;
}

export const categoryLabels: Record<ServiceCategory, string> = {
  copy: '复印',
  print: '打印',
  scan: '扫描',
  binding: '装订',
};

export const categoryColors: Record<ServiceCategory, string> = {
  copy: 'bg-blue-100 text-blue-700',
  print: 'bg-green-100 text-green-700',
  scan: 'bg-purple-100 text-purple-700',
  binding: 'bg-orange-100 text-orange-700',
};
