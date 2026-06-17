import type { Service, Customer, Order, Payment, Template } from '@/types';

export const defaultServices: Service[] = [
  { id: 's1', name: '黑白复印', price: 0.5, category: 'copy', unit: '张' },
  { id: 's2', name: '彩色复印', price: 1.5, category: 'copy', unit: '张' },
  { id: 's3', name: '黑白打印', price: 1.0, category: 'print', unit: '张' },
  { id: 's4', name: '彩色打印', price: 3.0, category: 'print', unit: '张' },
  { id: 's5', name: '照片打印', price: 5.0, category: 'print', unit: '张' },
  { id: 's6', name: '黑白扫描', price: 1.0, category: 'scan', unit: '页' },
  { id: 's7', name: '彩色扫描', price: 2.0, category: 'scan', unit: '页' },
  { id: 's8', name: '胶装', price: 15.0, category: 'binding', unit: '本' },
  { id: 's9', name: '骑马钉', price: 8.0, category: 'binding', unit: '本' },
  { id: 's10', name: '铁环装', price: 12.0, category: 'binding', unit: '本' },
];

export const defaultCustomers: Customer[] = [
  { id: 'c1', name: '张经理', phone: '13800138001', note: 'XX公司', createdAt: '2025-01-15T09:00:00.000Z' },
  { id: 'c2', name: '李老师', phone: '13800138002', note: 'XX学校', createdAt: '2025-02-20T10:00:00.000Z' },
];

export const defaultOrders: Order[] = [];

export const defaultPayments: Payment[] = [];

export const defaultTemplates: Template[] = [
  {
    id: 't1',
    name: '名片套装',
    items: [
      { serviceId: 's4', quantity: 100 },
    ],
    createdAt: '2025-03-01T10:00:00.000Z',
  },
];
