import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, Box } from '@mui/material';
import { getCategories, getProducts } from '../../api/endpoints/catalog';

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Grocery', emoji: '🛒' },
  { id: '2', name: 'Personal Care', emoji: '✨' },
  { id: '3', name: 'Home Cleaning', emoji: '💧' },
  { id: '4', name: 'Household', emoji: '📦' },
  { id: '5', name: 'Beverages', emoji: '🥤' },
  { id: '6', name: 'Snacks', emoji: '🍪' },
];

export default function Categories() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [activeId, setActiveId] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories({ limit: 100 }).then((r) => {
      if (r?.data?.length) {
        setCategories(r.data);
        setActiveId(r.data[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeId) return;
    getProducts({ categoryId: activeId, limit: 20 }).then((r) => setProducts(r?.data ?? [])).catch(() => setProducts([]));
  }, [activeId]);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Shop by Category</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {categories.map((c) => (
          <Grid item xs={6} sm={4} md={2} key={c.id}>
            <Card
              variant="outlined"
              onClick={() => setActiveId(c.id)}
              sx={{
                p: 2.5, textAlign: 'center', borderRadius: 4, cursor: 'pointer',
                borderColor: activeId === c.id ? 'primary.main' : 'divider',
                bgcolor: activeId === c.id ? '#ecfdf5' : 'transparent',
                transition: 'all .2s', '&:hover': { boxShadow: 2 },
              }}
            >
              <Typography sx={{ fontSize: 32 }}>{c.emoji || '🛍️'}</Typography>
              <Typography sx={{ fontWeight: 600, fontSize: 14, mt: 1 }}>{c.name}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        {categories.find((c) => c.id === activeId)?.name || 'Products'}
      </Typography>
      {products.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>
          No products in this category yet — connect the backend and add products from the admin panel.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {products.map((p) => {
            const v = p.variants?.[0] || {};
            return (
              <Grid item xs={6} sm={4} md={3} key={p.id}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 4, cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id}`)}>
                  <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🛒</Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>{p.name}</Typography>
                  <Typography sx={{ fontWeight: 700, mt: 0.5 }}>₹{v.sellingPrice}</Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
