import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import { resetPassword } from '../../api/endpoints/auth';

export default function ResetPasswordScreen({ route, navigation }) {
  const { identifier, maskedMobile } = route.params;
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (newPassword.length < 8) return setError('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      await resetPassword(identifier, otp, newPassword);
      Alert.alert('Password Reset! 🎉', 'You can now log in with your new password.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {maskedMobile ? `Enter the OTP sent to ${maskedMobile}` : 'Enter the OTP sent to your registered mobile'}
          </Text>
          <Input label="OTP" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} />
          <Input label="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <Input label="Confirm New Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} error={error} />
          <Button title="Reset Password" onPress={handleReset} loading={loading} />
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
