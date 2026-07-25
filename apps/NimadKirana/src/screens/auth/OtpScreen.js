import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { colors, fontSize, fontWeight, spacing, radius } from '../../theme';
import { verifyOtp, sendOtp, verifyRegistrationOtp, registerCustomer } from '../../api/endpoints/auth';
import { useAuthStore } from '../../store/authStore';

const OTP_LENGTH = 4;

export default function OtpScreen({ route, navigation }) {
  const { mobile, purpose = 'LOGIN', registerPayload } = route.params;
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const inputs = useRef([]);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (val, i) => {
    const next = [...digits];
    next[i] = val.replace(/[^0-9]/g, '').slice(-1);
    setDigits(next);
    if (val && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus();
    if (next.every((d) => d !== '') && next.join('').length === OTP_LENGTH) {
      handleVerify(next.join(''));
    }
  };

  const handleVerify = async (code) => {
    setError('');
    setLoading(true);
    try {
      const res =
        purpose === 'REGISTER'
          ? await verifyRegistrationOtp(mobile, code)
          : await verifyOtp(mobile, code);
      setSession(res);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      setError(e?.response?.data?.message || 'Invalid OTP, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setDigits(Array(OTP_LENGTH).fill(''));
    if (purpose === 'REGISTER' && registerPayload) {
      await registerCustomer(registerPayload).catch(() => {});
    } else {
      await sendOtp(mobile).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Code sent to +91 {mobile}</Text>

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => (inputs.current[i] = r)}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={d}
              onChangeText={(val) => handleChange(val, i)}
            />
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Verify & Continue" onPress={() => handleVerify(digits.join(''))} loading={loading} />

        <Text style={styles.resend}>
          {timer > 0 ? (
            `Resend OTP in ${timer}s`
          ) : (
            <Text style={styles.resendLink} onPress={handleResend}>
              Resend OTP
            </Text>
          )}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
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
    marginBottom: spacing.xxl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  otpBox: {
    width: 52,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    backgroundColor: colors.bgMuted,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resend: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.textSecondary,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
