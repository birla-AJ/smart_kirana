import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Badge,
  InputBase,
  Container,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import logo from '../../../assets/images/logo.png';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'Offers', to: '/offers' },
  { label: 'Track Order', to: '/orders' },
];

export default function Header({ cartCount = 0 }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 3, py: 1 }}>
          <IconButton
            edge="start"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
          >
            <Box component="img" src={logo} alt="Nimad Kirana" sx={{ height: 42, width: 42, objectFit: 'contain' }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Box sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1, color: 'primary.dark' }}>
                Nimad <Box component="span" sx={{ color: 'secondary.main' }}>Kirana</Box>
              </Box>
              <Box sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>
                Freshness at Your Doorstep
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              flex: 1,
              bgcolor: '#f4f7f5',
              borderRadius: 999,
              px: 2,
              py: 0.75,
              maxWidth: 420,
            }}
          >
            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <InputBase placeholder="Search for atta, dal, oil…" fullWidth sx={{ fontSize: 14 }} />
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2.5, ml: 'auto' }}>
            {NAV_LINKS.map((l) => (
              <Button key={l.to} component={Link} to={l.to} color="inherit" sx={{ fontWeight: 600 }}>
                {l.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: { xs: 'auto', md: 0 } }}>
            <IconButton onClick={() => navigate('/login')}>
              <PersonOutlineIcon />
            </IconButton>
            <IconButton onClick={() => navigate('/cart')}>
              <Badge badgeContent={cartCount} color="secondary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <List>
            {NAV_LINKS.map((l) => (
              <ListItemButton key={l.to} component={Link} to={l.to} onClick={() => setDrawerOpen(false)}>
                <ListItemText primary={l.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
