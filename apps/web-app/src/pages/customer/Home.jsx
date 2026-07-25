import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Typography,
  Button,
  Card,
  Chip,
  Stack,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import logo from '../../assets/images/logo.png';
import { getCategories, getProducts } from '../../api/endpoints/catalog';
import { useCartStore } from '../../store/cartStore';

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Grocery', emoji: '🛒' },
  { id: '2', name: 'Personal Care', emoji: '✨' },
  { id: '3', name: 'Home Cleaning', emoji: '💧' },
  { id: '4', name: 'Household', emoji: '📦' },
  { id: '5', name: 'Beverages', emoji: '🥤' },
  { id: '6', name: 'Snacks', emoji: '🍪' },
];

const USPS = [
  { icon: <LocalShippingOutlinedIcon />, title: 'Fast Delivery', desc: 'Delivered in as little as 30 minutes' },
  { icon: <VerifiedOutlinedIcon />, title: '100% Fresh', desc: 'Quality checked before dispatch' },
  { icon: <SavingsOutlinedIcon />, title: 'Best Prices', desc: 'Daily deals & everyday low prices' },
];

export default function Home() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState([]);
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories({ limit: 12 }).then((r) => r?.data?.length && setCategories(r.data)).catch(() => {});
    getProducts({ limit: 8 }).then((r) => r?.data && setProducts(r.data)).catch(() => {});
  }, []);

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%, #fff7ed 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" sx={{ py: { xs: 6, md: 10 } }}>
            <Grid item xs={12} md={6}>
              <Chip
                label="Now delivering across Indore"
                size="small"
                sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 600, mb: 2 }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 }, color: 'primary.dark', lineHeight: 1.1 }}>
                Freshness at{' '}
                <Box component="span" sx={{ color: 'secondary.main' }}>
                  Your Doorstep.
                </Box>
              </Typography>
              <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 18, maxWidth: 480 }}>
                Grocery, personal care, home cleaning & household essentials — order
                in a few clicks and get it delivered fast.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/categories')}
                >
                  Start Shopping
                </Button>
                <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/categories')}>
                  Browse Categories
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={logo}
                alt="Nimad Kirana"
                sx={{
                  width: { xs: 220, md: 320 },
                  filter: 'drop-shadow(0 20px 40px rgba(6,95,70,0.25))',
                  animation: 'floaty 4s ease-in-out infinite',
                  '@keyframes floaty': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-14px)' },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* USPs */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {USPS.map((u) => (
            <Grid item xs={12} sm={4} key={u.title}>
              <Card variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 4, height: '100%' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>{u.icon}</Box>
                <Typography sx={{ fontWeight: 700 }}>{u.title}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>{u.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Shop by Category</Typography>
        <Grid container spacing={2}>
          {categories.map((c) => (
            <Grid item xs={6} sm={4} md={2} key={c.id}>
              <Card
                variant="outlined"
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all .2s',
                  '&:hover': { boxShadow: 3, transform: 'translateY(-3px)', borderColor: 'primary.main' },
                }}
              >
                <Typography sx={{ fontSize: 32 }}>{c.emoji || '🛍️'}</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: 14, mt: 1 }}>{c.name}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Products */}
      <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Popular Products</Typography>
          <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/categories')}>See all</Button>
        </Stack>
        {products.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }}>
            Connect the backend (see /backend) to load live products here.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {products.map((p) => {
              const v = p.variants?.[0] || {};
              return (
                <Grid item xs={6} sm={4} md={3} key={p.id}>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 4, height: '100%', cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id}`)}>
                    <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                      🛒
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>{p.name}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{v.name}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>₹{v.sellingPrice}</Typography>
                      <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); addItem(p, v, 1); }}>
                        Add
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
