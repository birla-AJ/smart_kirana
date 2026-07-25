import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { getSalesReport, getTopCustomersReport } from '../../api/endpoints/admin';

const STAT_LABELS = [
  { key: 'totalRevenue', label: 'Total Revenue', prefix: '₹' },
  { key: 'totalOrders', label: 'Total Orders' },
  { key: 'averageOrderValue', label: 'Avg Order Value', prefix: '₹' },
  { key: 'cancelledOrders', label: 'Cancelled Orders' },
];

export default function Reports() {
  const [sales, setSales] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    getSalesReport({}).then((r) => setSales(r?.data ?? r)).catch(() => setSales(null));
    getTopCustomersReport({ limit: 10 }).then((r) => setTopCustomers(r?.data ?? [])).catch(() => setTopCustomers([]));
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Reports</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_LABELS.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.key}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{s.label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {s.prefix || ''}{sales?.[s.key] ?? 0}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography sx={{ fontWeight: 700 }}>Top Customers</Typography>
        </Box>
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f7f5' }}>
              <TableCell>Customer</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Total Spent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topCustomers.length === 0 ? (
              <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                No data yet — connect the backend to see top customers here.
              </TableCell></TableRow>
            ) : topCustomers.map((c) => (
              <TableRow key={c.customerId}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.totalOrders}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>₹{c.totalSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
