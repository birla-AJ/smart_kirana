import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import logo from '../../assets/images/logo.png';
import { loginAdmin } from '../../api/endpoints/admin';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useAdminAuthStore((s) => s.setSession);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginAdmin(email, password);
      setSession(res);
      navigate('/admin');
    } catch (e) {
      setError(e?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#0f2419' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Box component="img" src={logo} sx={{ width: 64, height: 64, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
            Admin Panel
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
            Sign in to manage Nimad Kirana
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}

          <Stack spacing={2}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button variant="contained" size="large" disabled={loading} onClick={handleLogin}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
