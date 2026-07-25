import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip } from '@mui/material';
import { listCustomers } from '../../api/endpoints/admin';

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    listCustomers({ limit: 50 }).then((r) => setCustomers(r?.data ?? [])).catch(() => setCustomers([]));
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Customers</Typography>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f7f5' }}>
              <TableCell>Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                No customers yet — connect the backend to see registered shoppers here.
              </TableCell></TableRow>
            ) : customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.firstName} {c.lastName || ''}</TableCell>
                <TableCell>{c.mobile}</TableCell>
                <TableCell>{c.email || '—'}</TableCell>
                <TableCell><Chip label={c.status} size="small" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
