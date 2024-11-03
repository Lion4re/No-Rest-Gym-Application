import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { handleOAuth } from "@/lib/auth";

interface OAuthProps {
  title: string;
  strategy: "oauth_google" | "oauth_apple";
}

const OAuth = ({ title, strategy }: OAuthProps) => {
  const { startOAuthFlow } = useOAuth({ strategy });

  const handleSignIn = async () => {
    const result = await handleOAuth(startOAuthFlow);

    if (result.code === "session_exists") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.");
      router.replace("/(root)/(tabs)/home");
    }

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg text-white">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title={title}
        className="mt-5 w-full shadow-none border border-white"
        IconLeft={() => (
          <Image
            source={strategy === "oauth_google" ? icons.google : icons.apple}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="white"
        textVariant="black"
        onPress={handleSignIn}
      />
    </View>
  );
};

export default OAuth;