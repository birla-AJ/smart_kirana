import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Box, Typography, Button, Stack, TextField, Radio,
  RadioGroup, FormControlLabel, Paper, Divider, Alert,
} from '@mui/material';
import { useCartStore } from '../../store/cartStore';
import { getAddresses, createAddress } from '../../api/endpoints/addresses';
import { addCartItem } from '../../api/endpoints/cart';
import { createOrder } from '../../api/endpoints/orders';

const EMPTY_FORM = { fullName: '', mobile: '', addressLine1: '', city: '', state: '', pincode: '' };

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const total = items.reduce((sum, i) => sum + i.qty * Number(i.variant?.sellingPrice || 0), 0);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [payment, setPayment] = useState('CASH');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAddresses()
      .then((r) => {
        const list = r?.data ?? [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedId(def.id);
        else setShowForm(true);
      })
      .catch(() => setShowForm(true));
  }, []);

  const handleSaveAddress = async () => {
    try {
      const res = await createAddress({ ...form, isDefault: addresses.length === 0 });
      const addr = res?.data ?? res;
      setAddresses((p) => [...p, addr]);
      setSelectedId(addr.id);
      setShowForm(false);
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedId) { setError('Please add a delivery address'); setShowForm(true); return; }
    setPlacing(true);
    setError('');
    try {
      for (const item of items) {
        await addCartItem(item.product.id, item.variant.id, item.qty);
      }
      await createOrder({ addressId: selectedId, paymentMethodType: payment });
      clearCart();
      navigate('/orders');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Checkout</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>📍 Delivery Address</Typography>
            <RadioGroup value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {addresses.map((a) => (
                <FormControlLabel
                  key={a.id}
                  value={a.id}
                  control={<Radio />}
                  label={<Box><Typography sx={{ fontWeight: 600, fontSize: 14 }}>{a.fullName} · {a.type}</Typography><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{a.addressLine1}, {a.city}, {a.state} - {a.pincode}</Typography></Box>}
                  sx={{ alignItems: 'flex-start', mb: 1 }}
                />
              ))}
            </RadioGroup>
            {!showForm ? (
              <Button size="small" onClick={() => setShowForm(true)}>+ Add New Address</Button>
            ) : (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField label="Full Name" size="small" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                <TextField label="Mobile Number" size="small" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                <TextField label="Address Line 1" size="small" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
                <Stack direction="row" spacing={2}>
                  <TextField label="City" size="small" fullWidth value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  <TextField label="State" size="small" fullWidth value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  <TextField label="Pincode" size="small" fullWidth value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                </Stack>
                <Button variant="outlined" onClick={handleSaveAddress}>Save Address</Button>
              </Stack>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Payment Method</Typography>
            <RadioGroup value={payment} onChange={(e) => setPayment(e.target.value)}>
              <FormControlLabel value="CASH" control={<Radio />} label="Cash on Delivery" />
              <FormControlLabel value="UPI" control={<Radio />} label="UPI" />
              <FormControlLabel value="CARD" control={<Radio />} label="Credit / Debit Card" />
            </RadioGroup>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 90 }}>
            <Typography sx={{ fontWeight: 700, mb: 2 }}>Bill Summary</Typography>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ color: 'text.secondary' }}>Item Total</Typography>
              <Typography>₹{total.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ color: 'text.secondary' }}>Delivery Fee</Typography>
              <Typography>₹0.00</Typography>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 700 }}>To Pay</Typography>
              <Typography sx={{ fontWeight: 800 }}>₹{total.toFixed(2)}</Typography>
            </Stack>
            <Button fullWidth variant="contained" size="large" disabled={items.length === 0 || placing} onClick={handlePlaceOrder}>
              {placing ? 'Placing Order…' : 'Place Order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
