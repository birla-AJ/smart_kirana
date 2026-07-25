import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import { registerCustomer } from '../../api/endpoints/auth';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

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
      navigation.navigate('Otp', { mobile: form.mobile, purpose: 'REGISTER', registerPayload: payload });
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Nimad Kirana for fresh groceries at your doorstep</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="First Name" value={form.firstName} onChangeText={set('firstName')} />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Input label="Last Name" value={form.lastName} onChangeText={set('lastName')} />
            </View>
          </View>

          <Input label="Mobile Number" keyboardType="number-pad" maxLength={10} value={form.mobile} onChangeText={set('mobile')} />
          <Input label="Email (optional, needed for email login)" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={set('email')} />
          <Input label="Password" secureTextEntry value={form.password} onChangeText={set('password')} />
          <Input label="Confirm Password" secureTextEntry value={form.confirmPassword} onChangeText={set('confirmPassword')} error={error} />

          <Button title="Create Account" onPress={handleRegister} loading={loading} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.primaryDark },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  row: { flexDirection: 'row' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginText: { fontSize: fontSize.sm, color: colors.textSecondary },
  loginLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold },
});
