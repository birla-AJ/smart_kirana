import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';
import logo from '../../assets/images/logo.png';
import { resetPassword } from '../../api/endpoints/auth';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { identifier, maskedMobile } = location.state || {};
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!identifier) {
    return (
      <Container maxWidth="xs" sx={{ py: 10, textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary' }}>
          Please start from the "Forgot Password" page.
        </Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/forgot-password')}>Go Back</Button>
      </Container>
    );
  }

  const handleReset = async () => {
    if (newPassword.length < 8) return setError('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setError(''); setLoading(true);
    try {
      await resetPassword(identifier, otp, newPassword);
      navigate('/login');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f4f7f5', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Box component="img" src={logo} sx={{ width: 64, height: 64, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>Reset Password</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
            {maskedMobile ? `Enter the OTP sent to ${maskedMobile}` : 'Enter the OTP sent to your registered mobile'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Stack spacing={2}>
            <TextField fullWidth label="OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            <TextField fullWidth label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <TextField fullWidth label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <Button variant="contained" size="large" disabled={loading} onClick={handleReset}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
