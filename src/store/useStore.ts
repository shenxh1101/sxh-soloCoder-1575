import { create } from 'zustand';
import type { Service, Customer, Order, OrderItem, Payment, Template } from '@/types';
import { getStorage, setStorage, generateId } from '@/utils/storage';
import {
  defaultServices,
  defaultCustomers,
  defaultOrders,
  defaultPayments,
  defaultTemplates,
} from '@/data/seedData';
import { isToday, isThisMonth } from '@/utils/storage';

interface AppState {
  services: Service[];
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
  templates: Template[];
  currentOrder: OrderItem[];

  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerDebt: (customerId: string) => number;

  addToOrder: (service: Service, quantity?: number) => void;
  updateOrderItemQuantity: (serviceId: string, quantity: number) => void;
  removeFromOrder: (serviceId: string) => void;
  clearOrder: () => void;
  getOrderTotal: () => number;
  checkout: (paymentType: 'cash' | 'credit', customerId?: string) => Order;

  addPayment: (customerId: string, amount: number, note?: string) => void;

  saveTemplate: (name: string) => void;
  applyTemplate: (templateId: string) => void;
  deleteTemplate: (id: string) => void;

  getTodayStats: () => { cash: number; credit: number; orderCount: number };
  getMonthlyServiceStats: () => { name: string; total: number; count: number }[];
  getTotalDebt: () => number;
}

export const useStore = create<AppState>((set, get) => ({
  services: getStorage('services', defaultServices),
  customers: getStorage('customers', defaultCustomers),
  orders: getStorage('orders', defaultOrders),
  payments: getStorage('payments', defaultPayments),
  templates: getStorage('templates', defaultTemplates),
  currentOrder: [],

  addService: (service) => {
    const newService = { ...service, id: generateId() };
    const services = [...get().services, newService];
    set({ services });
    setStorage('services', services);
  },

  updateService: (id, data) => {
    const services = get().services.map((s) =>
      s.id === id ? { ...s, ...data } : s
    );
    set({ services });
    setStorage('services', services);
  },

  deleteService: (id) => {
    const services = get().services.filter((s) => s.id !== id);
    set({ services });
    setStorage('services', services);
  },

  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const customers = [...get().customers, newCustomer];
    set({ customers });
    setStorage('customers', customers);
  },

  updateCustomer: (id, data) => {
    const customers = get().customers.map((c) =>
      c.id === id ? { ...c, ...data } : c
    );
    set({ customers });
    setStorage('customers', customers);
  },

  deleteCustomer: (id) => {
    const customers = get().customers.filter((c) => c.id !== id);
    set({ customers });
    setStorage('customers', customers);
  },

  getCustomerDebt: (customerId) => {
    const creditOrders = get().orders.filter(
      (o) => o.paymentType === 'credit' && o.customerId === customerId
    );
    const totalCredit = creditOrders.reduce((sum, o) => sum + o.total, 0);

    const customerPayments = get().payments.filter(
      (p) => p.customerId === customerId
    );
    const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0);

    return totalCredit - totalPaid;
  },

  addToOrder: (service, quantity = 1) => {
    const currentOrder = [...get().currentOrder];
    const existingIndex = currentOrder.findIndex(
      (item) => item.serviceId === service.id
    );

    if (existingIndex >= 0) {
      currentOrder[existingIndex] = {
        ...currentOrder[existingIndex],
        quantity: currentOrder[existingIndex].quantity + quantity,
        subtotal:
          (currentOrder[existingIndex].quantity + quantity) *
          currentOrder[existingIndex].price,
      };
    } else {
      currentOrder.push({
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        quantity,
        subtotal: service.price * quantity,
      });
    }

    set({ currentOrder });
  },

  updateOrderItemQuantity: (serviceId, quantity) => {
    if (quantity <= 0) {
      get().removeFromOrder(serviceId);
      return;
    }
    const currentOrder = get().currentOrder.map((item) =>
      item.serviceId === serviceId
        ? { ...item, quantity, subtotal: item.price * quantity }
        : item
    );
    set({ currentOrder });
  },

  removeFromOrder: (serviceId) => {
    const currentOrder = get().currentOrder.filter(
      (item) => item.serviceId !== serviceId
    );
    set({ currentOrder });
  },

  clearOrder: () => {
    set({ currentOrder: [] });
  },

  getOrderTotal: () => {
    return get().currentOrder.reduce((sum, item) => sum + item.subtotal, 0);
  },

  checkout: (paymentType, customerId) => {
    const currentOrder = get().currentOrder;
    const total = get().getOrderTotal();
    const customer = get().customers.find((c) => c.id === customerId);

    const order: Order = {
      id: generateId(),
      items: currentOrder,
      total,
      paymentType,
      customerId: paymentType === 'credit' ? customerId : undefined,
      customerName: paymentType === 'credit' ? customer?.name : undefined,
      createdAt: new Date().toISOString(),
    };

    const orders = [order, ...get().orders];
    set({ orders, currentOrder: [] });
    setStorage('orders', orders);

    return order;
  },

  addPayment: (customerId, amount, note = '') => {
    const payment: Payment = {
      id: generateId(),
      customerId,
      amount,
      note,
      createdAt: new Date().toISOString(),
    };
    const payments = [payment, ...get().payments];
    set({ payments });
    setStorage('payments', payments);
  },

  saveTemplate: (name) => {
    const currentOrder = get().currentOrder;
    if (currentOrder.length === 0) return;

    const template: Template = {
      id: generateId(),
      name,
      items: currentOrder.map((item) => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
      })),
      createdAt: new Date().toISOString(),
    };

    const templates = [template, ...get().templates];
    set({ templates });
    setStorage('templates', templates);
  },

  applyTemplate: (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;

    const services = get().services;
    const items: OrderItem[] = template.items
      .map((ti) => {
        const service = services.find((s) => s.id === ti.serviceId);
        if (!service) return null;
        return {
          serviceId: service.id,
          serviceName: service.name,
          price: service.price,
          quantity: ti.quantity,
          subtotal: service.price * ti.quantity,
        };
      })
      .filter(Boolean) as OrderItem[];

    set({ currentOrder: items });
  },

  deleteTemplate: (id) => {
    const templates = get().templates.filter((t) => t.id !== id);
    set({ templates });
    setStorage('templates', templates);
  },

  getTodayStats: () => {
    const todayOrders = get().orders.filter((o) => isToday(o.createdAt));
    const cash = todayOrders
      .filter((o) => o.paymentType === 'cash')
      .reduce((sum, o) => sum + o.total, 0);
    const credit = todayOrders
      .filter((o) => o.paymentType === 'credit')
      .reduce((sum, o) => sum + o.total, 0);
    return { cash, credit, orderCount: todayOrders.length };
  },

  getMonthlyServiceStats: () => {
    const monthlyOrders = get().orders.filter((o) => isThisMonth(o.createdAt));
    const statsMap = new Map<string, { total: number; count: number }>();

    monthlyOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = statsMap.get(item.serviceName) || { total: 0, count: 0 };
        statsMap.set(item.serviceName, {
          total: existing.total + item.subtotal,
          count: existing.count + item.quantity,
        });
      });
    });

    const stats = Array.from(statsMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    return stats;
  },

  getTotalDebt: () => {
    return get().customers.reduce((sum, customer) => {
      return sum + get().getCustomerDebt(customer.id);
    }, 0);
  },
}));
