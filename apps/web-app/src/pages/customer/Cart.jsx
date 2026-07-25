import { Container, Box, Typography, Button, Stack, IconButton, Divider } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const navigate = useNavigate();
  const total = items.reduce((sum, i) => sum + i.qty * Number(i.variant?.sellingPrice || 0), 0);

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 56 }}>🛒</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>Your cart is empty</Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/')}>Start Shopping</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>My Cart</Typography>
      <Stack spacing={2}>
        {items.map((item) => (
          <Box key={item.variant.id} sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2 }}>
            <Box sx={{ width: 64, height: 64, bgcolor: '#f4f7f5', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, mr: 2 }}>
              🛒
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{item.product.name}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{item.variant.name}</Typography>
              <Typography sx={{ fontWeight: 700, mt: 0.5 }}>₹{item.variant.sellingPrice}</Typography>
            </Box>
            <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 999, mr: 2 }}>
              <IconButton size="small" onClick={() => updateQty(item.variant.id, item.qty - 1)}><RemoveIcon fontSize="small" /></IconButton>
              <Typography sx={{ px: 1.5, fontWeight: 700 }}>{item.qty}</Typography>
              <IconButton size="small" onClick={() => updateQty(item.variant.id, item.qty + 1)}><AddIcon fontSize="small" /></IconButton>
            </Stack>
            <IconButton onClick={() => removeItem(item.variant.id)}><DeleteOutlineIcon /></IconButton>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6">₹{total.toFixed(2)}</Typography>
      </Stack>
      <Button fullWidth variant="contained" size="large" onClick={() => navigate('/checkout')}>
        Proceed to Checkout
      </Button>
    </Container>
  );
}
