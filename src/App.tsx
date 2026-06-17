import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import OrderPage from '@/pages/OrderPage';
import CustomersPage from '@/pages/CustomersPage';
import CustomerDetailPage from '@/pages/CustomerDetailPage';
import StatsPage from '@/pages/StatsPage';
import ServicesPage from '@/pages/ServicesPage';
import TemplatesPage from '@/pages/TemplatesPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<OrderPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
