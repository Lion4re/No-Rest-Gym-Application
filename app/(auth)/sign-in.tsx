// app/(auth)/sign-in.tsx
import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, form]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView className="flex-1 bg-black">
        <View className="flex-1 bg-black">
          <View className="relative w-full h-[250px]">
            <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
            <Text className="text-2xl text-white font-JakartaSemiBold absolute bottom-5 left-5">
              Welcome 👋
            </Text>
          </View>

          <View className="p-5">
            <InputField
              label="Email"
              placeholder="Enter email"
              icon={icons.email}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })} 
            />

            <View className="relative">
              <InputField
                label="Password"
                placeholder="Enter password"
                icon={icons.lock}
                secureTextEntry={!showPassword}
                textContentType="password"
                value={form.password}
                onChangeText={(value) => setForm({ ...form, password: value })}
              />
              <TouchableOpacity 
                onPress={togglePasswordVisibility}
                style={{ position: 'absolute', right: 15, top: 20, height: '100%', justifyContent: 'center' }}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#FFD700"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              className="text-yellow-400 text-right mb-4 mt-2"
            >
              <Text className="text-yellow-400">Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Sign In"
              onPress={onSignInPress}
              className="mt-2"
            />

            <OAuth title="Sign in with Google" strategy="oauth_google" />
            <OAuth title="Sign in with Apple" strategy="oauth_apple" />

            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              className="text-lg text-center text-white mt-10"
            >
              <Text className="text-lg text-center text-white">
                Don't have an account?{" "}
                <Text className="text-yellow-400">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;