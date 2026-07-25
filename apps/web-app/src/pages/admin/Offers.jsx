import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { listCoupons, createCoupon } from '../../api/endpoints/admin';

const EMPTY = { code: '', name: '', type: 'PERCENTAGE', value: '', startDate: '', endDate: '' };

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => listCoupons({ limit: 50 }).then((r) => setCoupons(r?.data ?? [])).catch(() => setCoupons([]));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setError('');
    setSaving(true);
    try {
      await createCoupon({
        ...form,
        value: Number(form.value),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      setOpen(false);
      setForm(EMPTY);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not create coupon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Offers & Coupons</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Coupon</Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f4f7f5' }}>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                No coupons yet — add your first promo code.
              </TableCell></TableRow>
            ) : coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell sx={{ fontWeight: 700 }}>{c.code}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell>{c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`}</TableCell>
                <TableCell><Chip label={c.isActive ? 'Active' : 'Inactive'} size="small" color={c.isActive ? 'success' : 'default'} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Coupon</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="PERCENTAGE">Percentage</MenuItem>
              <MenuItem value="FLAT">Flat Amount</MenuItem>
            </TextField>
            <TextField label="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <TextField label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <TextField label="End Date" type="date" InputLabelProps={{ shrink: true }} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={handleCreate}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
