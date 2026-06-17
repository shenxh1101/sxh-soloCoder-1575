import { NavLink } from 'react-router-dom';
import {
  Receipt,
  Users,
  BarChart3,
  Settings,
  FileText,
  Printer,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '开单', icon: Receipt },
  { path: '/customers', label: '客户', icon: Users },
  { path: '/stats', label: '统计', icon: BarChart3 },
  { path: '/templates', label: '模板', icon: FileText },
  { path: '/services', label: '服务', icon: Settings },
];

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">打印店管家</h1>
              <p className="text-xs text-gray-400">轻松管理每一笔订单</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
