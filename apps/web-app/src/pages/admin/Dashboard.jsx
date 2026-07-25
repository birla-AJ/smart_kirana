import { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Stack, Chip } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { getDashboardSummary, getRecentOrders } from '../../api/endpoints/admin';

const STAT_CARDS = (s) => [
  { label: "Today's Sales", value: `₹${s?.todaysSales ?? 0}`, icon: <PaymentsOutlinedIcon />, sub: `${s?.todaysOrders ?? 0} orders today` },
  { label: 'Monthly Revenue', value: `₹${s?.monthlySales ?? 0}`, icon: <ShoppingBagOutlinedIcon />, sub: `${s?.monthlyOrders ?? 0} orders this month` },
  { label: 'Total Customers', value: s?.totalCustomers ?? 0, icon: <PeopleAltOutlinedIcon />, sub: `+${s?.newCustomersThisMonth ?? 0} this month` },
  { label: 'Total Products', value: s?.totalProducts ?? 0, icon: <Inventory2OutlinedIcon />, sub: `${s?.lowStockProductsCount ?? 0} low stock` },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    getDashboardSummary().then((r) => setSummary(r?.data ?? r)).catch(() => setSummary(null));
    getRecentOrders({ limit: 6 }).then((r) => setRecentOrders(r?.data ?? [])).catch(() => setRecentOrders([]));
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS(summary).map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{c.label}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{c.value}</Typography>
                </Box>
                <Box sx={{ color: 'primary.main', bgcolor: '#ecfdf5', p: 1, borderRadius: 2 }}>{c.icon}</Box>
              </Stack>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5 }}>{c.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Recent Orders</Typography>
        {recentOrders.length === 0 ? (
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
            Recent orders will appear here once the backend is connected.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {recentOrders.map((o) => (
              <Stack key={o.id} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>#{o.orderNumber || o.id.slice(-8)}</Typography>
                <Chip label={o.status} size="small" />
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>₹{o.totalAmount}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
