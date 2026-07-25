import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors, fontSize, fontWeight, spacing, radius } from '../../theme';
import { sendOtp, loginWithPassword } from '../../api/endpoints/auth';
import { useAuthStore } from '../../store/authStore';

const MODES = [
  { key: 'otp', label: 'Mobile OTP' },
  { key: 'password', label: 'Password' },
];

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('otp');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setSession = useAuthStore((s) => s.setSession);

  const handleOtpContinue = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(phone);
      navigation.navigate('Otp', { mobile: phone, purpose: 'LOGIN' });
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!identifier || !password) {
      setError('Enter your mobile / email / User ID and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginWithPassword(identifier.trim(), password);
      setSession(res);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      setError(e?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Login to continue shopping with Nimad Kirana</Text>

          <View style={styles.modeSwitch}>
            {MODES.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
                onPress={() => {
                  setMode(m.key);
                  setError('');
                }}
              >
                <Text style={[styles.modeBtnText, mode === m.key && styles.modeBtnTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'otp' ? (
            <View style={styles.form}>
              <Input
                label="Mobile Number"
                placeholder="98765 43210"
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                error={error}
              />
              <Button title="Send OTP" onPress={handleOtpContinue} loading={loading} />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Mobile / Email / User ID"
                placeholder="e.g. 9876543210, you@email.com, NK1A2B3C4D"
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
              />
              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                error={error}
              />
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
                <Text style={styles.forgotLinkText}>Forgot Password?</Text>
              </TouchableOpacity>
              <Button title="Login" onPress={handlePasswordLogin} loading={loading} />
            </View>
          )}

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>New to Nimad Kirana? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service & Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  logo: { width: 76, height: 76, alignSelf: 'center', marginBottom: spacing.md },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: colors.white, elevation: 1 },
  modeBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted },
  modeBtnTextActive: { color: colors.primary },
  form: { marginTop: spacing.sm },
  forgotLink: { alignSelf: 'flex-end', marginBottom: spacing.lg, marginTop: -spacing.sm },
  forgotLinkText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  registerText: { fontSize: fontSize.sm, color: colors.textSecondary },
  registerLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },
  terms: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
