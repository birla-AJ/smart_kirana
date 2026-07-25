import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import { forgotPassword } from '../../api/endpoints/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!identifier.trim()) {
      setError('Enter your mobile, email or User ID');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(identifier.trim());
      navigation.navigate('ResetPassword', { identifier: identifier.trim(), maskedMobile: res?.data?.mobile ?? res?.mobile });
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not find that account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number, email, or User ID — we'll send an OTP to your registered mobile.
          </Text>
          <Input
            label="Mobile / Email / User ID"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
            error={error}
          />
          <Button title="Send OTP" onPress={handleSend} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.primaryDark, textAlign: 'center' },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
});
