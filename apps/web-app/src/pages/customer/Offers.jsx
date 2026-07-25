import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, Box, Chip } from '@mui/material';
import { getOffers } from '../../api/endpoints/catalog';

export default function Offers() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    getOffers({ limit: 50 }).then((r) => setOffers(r?.data ?? [])).catch(() => setOffers([]));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Offers &amp; Deals</Typography>

      {offers.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>
          No active offers right now — check back soon, or create some from the admin panel.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {offers.map((o) => (
            <Grid item xs={12} sm={6} md={4} key={o.id}>
              <Card variant="outlined" sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                <Chip
                  label={o.type === 'PERCENTAGE' ? `${o.value}% OFF` : `₹${o.value} OFF`}
                  color="secondary"
                  size="small"
                  sx={{ mb: 1.5, fontWeight: 700 }}
                />
                <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{o.title}</Typography>
                {o.description && (
                  <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 1 }}>{o.description}</Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Valid till {new Date(o.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
