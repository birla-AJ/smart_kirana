import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  Chip, Select, MenuItem, Stack,
} from '@mui/material';
import { listAllOrders, updateOrderStatus } from '../../api/endpoints/admin';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
const STATUS_COLOR = {
  PENDING: 'warning', CONFIRMED: 'info', PROCESSING: 'info', PACKED: 'info',
  OUT_FOR_DELIVERY: 'primary', DELIVERED: 'success', CANCELLED: 'error', RETURNED: 'error', REFUNDED: 'default',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const load = () => listAllOrders({ limit: 50 }).then((r) => setOrders(r?.data ?? [])).catch(() => setOrders([]));

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await updateOrderStatus(id, status).catch(() => load());
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Orders</Typography>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f7f5' }}>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                No orders yet — connect the backend to see live orders here.
              </TableCell></TableRow>
            ) : orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell sx={{ fontWeight: 600 }}>#{o.orderNumber || o.id.slice(-8)}</TableCell>
                <TableCell>{o.customer?.user?.firstName || '—'}</TableCell>
                <TableCell>{o.items?.length || 0}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>₹{o.totalAmount}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    sx={{ minWidth: 160 }}
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        <Chip label={s.replace(/_/g, ' ')} size="small" color={STATUS_COLOR[s]} />
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
