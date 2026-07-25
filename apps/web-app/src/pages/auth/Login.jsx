import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button, Stack, InputAdornment, Tabs, Tab,
} from '@mui/material';
import logo from '../../assets/images/logo.png';
import { sendOtp, verifyOtp, loginWithPassword } from '../../api/endpoints/auth';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [tab, setTab] = useState('otp');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' (otp mode only)
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit mobile number'); return; }
    setError(''); setLoading(true);
    try { await sendOtp(phone); setStep('otp'); }
    catch (e) { setError(e?.response?.data?.message || 'Could not send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setLoading(true); setError('');
    try {
      const res = await verifyOtp(phone, otp);
      setSession(res);
      navigate('/');
    } catch (e) { setError(e?.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handlePasswordLogin = async () => {
    if (!identifier || !password) { setError('Enter your mobile / email / User ID and password'); return; }
    setError(''); setLoading(true);
    try {
      const res = await loginWithPassword(identifier.trim(), password);
      setSession(res);
      navigate('/');
    } catch (e) { setError(e?.response?.data?.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ bgcolor: '#f4f7f5', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Box component="img" src={logo} sx={{ width: 64, height: 64, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
            Login to Nimad Kirana
          </Typography>

          <Tabs
            value={tab}
            onChange={(e, v) => { setTab(v); setStep('phone'); setError(''); }}
            variant="fullWidth"
            sx={{ mt: 2, mb: 2 }}
          >
            <Tab value="otp" label="Mobile OTP" />
            <Tab value="password" label="Password" />
          </Tabs>

          {tab === 'otp' ? (
            <Stack spacing={2}>
              {step === 'phone' ? (
                <TextField
                  fullWidth label="Mobile Number" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
                  error={!!error} helperText={error}
                />
              ) : (
                <TextField
                  fullWidth label="Enter OTP" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  error={!!error} helperText={error || `Code sent to +91 ${phone}`}
                />
              )}
              <Button variant="contained" size="large" disabled={loading} onClick={step === 'phone' ? handleSendOtp : handleVerifyOtp}>
                {step === 'phone' ? 'Send OTP' : 'Verify & Login'}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <TextField
                fullWidth label="Mobile / Email / User ID" value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="9876543210, you@email.com, or NK1A2B3C4D"
              />
              <TextField
                fullWidth label="Password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error} helperText={error}
              />
              <Box sx={{ textAlign: 'right', mt: -1 }}>
                <Typography component={Link} to="/forgot-password" sx={{ fontSize: 13, color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot Password?
                </Typography>
              </Box>
              <Button variant="contained" size="large" disabled={loading} onClick={handlePasswordLogin}>
                Login
              </Button>
            </Stack>
          )}

          <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 3 }}>
            New to Nimad Kirana?{' '}
            <Box component={Link} to="/register" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>
              Create Account
            </Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
