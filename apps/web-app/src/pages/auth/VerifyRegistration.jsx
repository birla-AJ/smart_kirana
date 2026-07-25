import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import logo from '../../assets/images/logo.png';
import { verifyRegistrationOtp, registerCustomer } from '../../api/endpoints/auth';
import { useAuthStore } from '../../store/authStore';

export default function VerifyRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const mobile = location.state?.mobile;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  if (!mobile) {
    return (
      <Container maxWidth="xs" sx={{ py: 10, textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary' }}>
          No registration in progress. Please start from the registration page.
        </Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/register')}>Go to Register</Button>
      </Container>
    );
  }

  const handleVerify = async () => {
    setError(''); setLoading(true);
    try {
      const res = await verifyRegistrationOtp(mobile, otp);
      setSession(res);
      navigate('/');
    } catch (e) {
      setError(e?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f4f7f5', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Box component="img" src={logo} sx={{ width: 64, height: 64, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>Verify Your Mobile</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>Code sent to +91 {mobile}</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Stack spacing={2}>
            <TextField fullWidth label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            <Button variant="contained" size="large" disabled={loading} onClick={handleVerify}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
