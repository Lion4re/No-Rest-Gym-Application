import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { icons } from "@/constants";

interface SimpleBGLayoutProps {
  title: string;
  children: React.ReactNode;
}

const SimpleBGLayout: React.FC<SimpleBGLayoutProps> = ({
  title,
  children,
}) => {
  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex flex-row items-center justify-start px-5 pt-16 pb-4 bg-black">
        <TouchableOpacity onPress={() => router.back()}>
          <View className="w-10 h-10 bg-yellow-400 rounded-full items-center justify-center">
            <Image
              source={icons.backArrow}
              resizeMode="contain"
              className="w-6 h-6"
              tintColor="black"
            />
          </View>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white ml-5">
          {title || "Go Back"}
        </Text>
      </View>

      {/* Content Area */}
      <View className="flex-1 bg-black px-5">
        {children}
      </View>
    </View>
  );
};

export default SimpleBGLayout;