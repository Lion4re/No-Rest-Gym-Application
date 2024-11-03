import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons } from "@/constants";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState('');

  const { isLoaded, signIn, setActive } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  async function create() {
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setSuccessfulCreation(true);
      setError('');
      Alert.alert('Success', 'Password reset code has been sent to your email.');
    } catch (err: any) {
      console.error('error', err.errors[0].longMessage);
      setError(err.errors[0].longMessage);
      Alert.alert('Error', err.errors[0].longMessage);
    }
  }

  async function reset() {
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result?.status === 'needs_second_factor') {
        setSecondFactor(true);
        setError('');
        Alert.alert('Info', '2FA is required, but this UI does not handle that.');
      } else if (result?.status === 'complete') {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
          setError('');
          Alert.alert('Success', 'Password has been reset successfully.');
          router.replace("/(root)/(tabs)/home");
        } else {
          setError('Failed to set active session. Please try again.');
          Alert.alert('Error', 'Failed to set active session. Please try again.');
        }
      } else {
        // console.log(result);
      }
    } catch (err: any) {
      console.error('error', err.errors[0].longMessage);
      setError(err.errors[0].longMessage);
      Alert.alert('Error', err.errors[0].longMessage);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Forgot Password?</Text>
          <View style={styles.form}>
            {!successfulCreation ? (
              <>
                <InputField
                  label="Email"
                  placeholder="Enter your email"
                  icon={icons.email}
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={setEmail}
                />
                <CustomButton
                  title="Send password reset code"
                  onPress={create}
                  className="mt-4"
                />
              </>
            ) : (
              <>
                <InputField
                  label="New Password"
                  placeholder="Enter your new password"
                  icon={icons.lock}
                  secureTextEntry
                  textContentType="newPassword"
                  value={password}
                  onChangeText={setPassword}
                />
                <InputField
                  label="Reset Code"
                  placeholder="Enter the reset code from your email"
                  icon={icons.person}
                  textContentType="oneTimeCode"
                  value={code}
                  onChangeText={setCode}
                />
                <CustomButton
                  title="Reset Password"
                  onPress={reset}
                  className="mt-4"
                />
              </>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {secondFactor && <Text style={styles.warningText}>2FA is required, but this UI does not handle that</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  backButton: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10, // Add marginTop to ensure it's below the notch
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  warningText: {
    color: 'yellow',
    marginTop: 10,
  },
});

export default ForgotPasswordPage;