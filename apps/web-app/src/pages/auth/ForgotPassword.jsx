import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import logo from '../../assets/images/logo.png';
import { forgotPassword } from '../../api/endpoints/auth';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!identifier.trim()) { setError('Enter your mobile, email or User ID'); return; }
    setError(''); setLoading(true);
    try {
      const res = await forgotPassword(identifier.trim());
      const maskedMobile = res?.data?.mobile ?? res?.mobile;
      navigate('/reset-password', { state: { identifier: identifier.trim(), maskedMobile } });
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not find that account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f4f7f5', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Box component="img" src={logo} sx={{ width: 64, height: 64, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>Forgot Password?</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
            Enter your mobile, email, or User ID — we'll send an OTP to your registered mobile.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Stack spacing={2}>
            <TextField fullWidth label="Mobile / Email / User ID" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            <Button variant="contained" size="large" disabled={loading} onClick={handleSend}>
              {loading ? 'Sending…' : 'Send OTP'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
