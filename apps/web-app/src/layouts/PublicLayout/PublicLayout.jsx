import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import { useCartStore } from '../../store/cartStore';

export default function PublicLayout() {
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header cartCount={cartCount} />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
