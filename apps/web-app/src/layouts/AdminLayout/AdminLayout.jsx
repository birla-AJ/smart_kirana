import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar,
  Typography, IconButton, Avatar, Menu, MenuItem, Divider,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../../assets/images/logo.png';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const DRAWER_WIDTH = 250;

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: <DashboardOutlinedIcon /> },
  { label: 'Products', to: '/admin/products', icon: <Inventory2OutlinedIcon /> },
  { label: 'Categories', to: '/admin/categories', icon: <CategoryOutlinedIcon /> },
  { label: 'Orders', to: '/admin/orders', icon: <ReceiptLongOutlinedIcon /> },
  { label: 'Customers', to: '/admin/customers', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Offers & Coupons', to: '/admin/offers', icon: <LocalOfferOutlinedIcon /> },
];

// Visible only to SUPER_ADMIN — back-office administration & oversight tools
const SUPER_ADMIN_NAV = [
  { label: 'Admin Users', to: '/admin/admin-users', icon: <AdminPanelSettingsOutlinedIcon /> },
  { label: 'Roles & Permissions', to: '/admin/roles', icon: <SecurityOutlinedIcon /> },
  { label: 'Reports', to: '/admin/reports', icon: <AssessmentOutlinedIcon /> },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: <HistoryOutlinedIcon /> },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, accessToken, clearSession } = useAdminAuthStore();

  if (!accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#0f2419', color: '#e5e7eb' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5 }}>
        <Box component="img" src={logo} sx={{ width: 36, height: 36 }} />
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1.2 }}>Nimad Kirana</Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca8a2' }}>
            {user?.role === 'SUPER_ADMIN' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
          </Typography>
        </Box>
      </Box>
      <List sx={{ px: 1.5 }}>
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: active ? '#fff' : '#9ca8a2',
                bgcolor: active ? 'primary.main' : 'transparent',
                '&:hover': { bgcolor: active ? 'primary.main' : 'rgba(255,255,255,0.06)' },
                '&.Mui-selected': { bgcolor: 'primary.main' },
                '&.Mui-selected:hover': { bgcolor: 'primary.main' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
            </ListItemButton>
          );
        })}

        {user?.role === 'SUPER_ADMIN' && (
          <>
            <Typography sx={{ fontSize: 11, color: '#6b7a73', fontWeight: 700, letterSpacing: 0.5, px: 1.5, mt: 2, mb: 1 }}>
              SUPER ADMIN
            </Typography>
            {SUPER_ADMIN_NAV.map((item) => {
              const active = location.pathname === item.to;
              return (
                <ListItemButton
                  key={item.to}
                  component={Link}
                  to={item.to}
                  selected={active}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    color: active ? '#fff' : '#9ca8a2',
                    bgcolor: active ? 'secondary.main' : 'transparent',
                    '&:hover': { bgcolor: active ? 'secondary.main' : 'rgba(255,255,255,0.06)' },
                    '&.Mui-selected': { bgcolor: 'secondary.main' },
                    '&.Mui-selected:hover': { bgcolor: 'secondary.main' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
                </ListItemButton>
              );
            })}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7f5' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
        open
      >
        {drawer}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e5e7eb' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Box />
            <Box>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                  {(user?.firstName || 'A')[0]}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{user?.email || user?.firstName}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'primary.main', fontWeight: 700 }}>
                      {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN'}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    clearSession();
                    navigate('/admin/login');
                  }}
                >
                  Log Out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
