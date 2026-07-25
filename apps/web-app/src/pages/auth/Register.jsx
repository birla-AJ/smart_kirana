import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Stack, Grid, Alert } from '@mui/material';
import logo from '../../assets/images/logo.png';
import { registerCustomer } from '../../api/endpoints/auth';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleRegister = async () => {
    setError('');
    if (!form.firstName.trim()) return setError('Enter your first name');
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return setError('Enter a valid 10-digit mobile number');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      mobile: form.mobile,
      email: form.email.trim() || undefined,
      password: form.password,
    };
    try {
      await registerCustomer(payload);
      navigate('/verify-registration', { state: { mobile: form.mobile } });
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f4f7f5', minHeight: '85vh', display: 'flex', alignItems: 'center', py: 6 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Box component="img" src={logo} sx={{ width: 56, height: 56, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>Create Account</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
            Join Nimad Kirana for fresh groceries at your doorstep
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}

          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField fullWidth label="First Name" value={form.firstName} onChange={set('firstName')} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Last Name" value={form.lastName} onChange={set('lastName')} /></Grid>
            </Grid>
            <TextField fullWidth label="Mobile Number" value={form.mobile} onChange={set('mobile')} />
            <TextField fullWidth label="Email (optional, needed for email login)" value={form.email} onChange={set('email')} />
            <TextField fullWidth label="Password" type="password" value={form.password} onChange={set('password')} />
            <TextField fullWidth label="Confirm Password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            <Button variant="contained" size="large" disabled={loading} onClick={handleRegister}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </Button>
          </Stack>

          <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 3 }}>
            Already have an account?{' '}
            <Box component={Link} to="/login" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>Login</Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
