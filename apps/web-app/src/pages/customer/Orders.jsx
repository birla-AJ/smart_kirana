import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Chip, Stack } from '@mui/material';
import { getMyOrders } from '../../api/endpoints/orders';

const STATUS_COLOR = {
  PENDING: 'warning', CONFIRMED: 'info', PROCESSING: 'info', PACKED: 'info',
  OUT_FOR_DELIVERY: 'primary', DELIVERED: 'success', CANCELLED: 'error', RETURNED: 'error', REFUNDED: 'default',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyOrders({ limit: 20 }).then((r) => setOrders(r?.data ?? [])).catch(() => setOrders([]));
  }, []);

  if (orders.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 56 }}>📦</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>No orders yet</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 1 }}>
          Your order history will show up here once the backend is connected.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>My Orders</Typography>
      <Stack spacing={2}>
        {orders.map((o) => (
          <Box
            key={o.id}
            onClick={() => navigate(`/orders/${o.id}`)}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontWeight: 700 }}>#{o.orderNumber || o.id.slice(-8).toUpperCase()}</Typography>
              <Chip label={o.status?.replace(/_/g, ' ')} size="small" color={STATUS_COLOR[o.status] || 'default'} />
            </Stack>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
              {new Date(o.createdAt).toLocaleDateString()}
            </Typography>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
              <Typography sx={{ fontSize: 14 }}>{o.items?.length || 0} items</Typography>
              <Typography sx={{ fontWeight: 700 }}>₹{o.totalAmount}</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
