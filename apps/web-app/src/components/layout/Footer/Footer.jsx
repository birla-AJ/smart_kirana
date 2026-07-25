import { Box, Container, Grid, Typography, Link as MLink, Divider } from '@mui/material';
import logo from '../../../assets/images/logo.png';

const COLUMNS = [
  {
    title: 'Shop',
    links: ['Grocery', 'Personal Care', 'Home Cleaning', 'Household Essentials'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Contact', 'Blog'],
  },
  {
    title: 'Help',
    links: ['FAQs', 'Track Order', 'Returns & Refunds', 'Shipping Policy'],
  },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#0f2419', color: '#e5e7eb', mt: 10, pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box component="img" src={logo} alt="Nimad Kirana" sx={{ height: 40, width: 40 }} />
              <Typography sx={{ fontWeight: 800, fontSize: 20 }}>Nimad Kirana</Typography>
            </Box>
            <Typography sx={{ color: '#9ca8a2', fontSize: 14, maxWidth: 320 }}>
              Fresh groceries, personal care, home cleaning & household essentials —
              delivered to your doorstep across Indore.
            </Typography>
          </Grid>
          {COLUMNS.map((col) => (
            <Grid item xs={6} md={2.5} key={col.title}>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{col.title}</Typography>
              {col.links.map((l) => (
                <MLink
                  key={l}
                  href="#"
                  underline="none"
                  sx={{ display: 'block', color: '#9ca8a2', fontSize: 14, mb: 1, '&:hover': { color: '#fff' } }}
                >
                  {l}
                </MLink>
              ))}
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
        <Typography sx={{ color: '#7d8983', fontSize: 13, textAlign: 'center' }}>
          © {new Date().getFullYear()} Nimad Kirana — a Zelvix Technologies product. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
