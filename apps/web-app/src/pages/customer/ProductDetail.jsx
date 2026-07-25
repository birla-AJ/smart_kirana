import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Box, Typography, Button, Chip, Stack, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { getProductById } from '../../api/endpoints/catalog';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.ids.includes(id));

  useEffect(() => {
    getProductById(id).then((r) => setProduct(r?.data ?? r)).catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 48 }}>🛒</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 2 }}>
          Product details will load here once the backend is connected.
        </Typography>
        <Button sx={{ mt: 3 }} variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  const variant = product.variants?.[variantIdx] || {};
  const discount = variant.mrp && variant.sellingPrice && variant.mrp > variant.sellingPrice
    ? Math.round(((variant.mrp - variant.sellingPrice) / variant.mrp) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={5}>
          <Box sx={{ height: 360, bgcolor: '#f4f7f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100 }}>
            🛒
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h4">{product.name}</Typography>
            <IconButton onClick={() => toggle(product.id)}>
              {isWishlisted ? <FavoriteIcon color="secondary" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Stack>

          {product.variants?.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {product.variants.map((v, i) => (
                <Chip
                  key={v.id}
                  label={v.name}
                  onClick={() => setVariantIdx(i)}
                  color={i === variantIdx ? 'primary' : 'default'}
                  variant={i === variantIdx ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          )}

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>₹{variant.sellingPrice}</Typography>
            {discount > 0 && (
              <>
                <Typography sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>₹{variant.mrp}</Typography>
                <Chip label={`${discount}% OFF`} size="small" color="secondary" />
              </>
            )}
          </Stack>

          <Typography sx={{ mt: 3, color: 'text.secondary' }}>
            {product.description || 'No description available.'}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 4 }}>
            <Stack direction="row" alignItems="center" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 999 }}>
              <IconButton size="small" onClick={() => setQty(Math.max(1, qty - 1))}><RemoveIcon fontSize="small" /></IconButton>
              <Typography sx={{ px: 2, fontWeight: 700 }}>{qty}</Typography>
              <IconButton size="small" onClick={() => setQty(qty + 1)}><AddIcon fontSize="small" /></IconButton>
            </Stack>
            <Button
              variant="contained"
              size="large"
              onClick={() => { addItem(product, variant, qty); navigate('/cart'); }}
            >
              Add to Cart — ₹{(variant.sellingPrice * qty).toFixed(2)}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
