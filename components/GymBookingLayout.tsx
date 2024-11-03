import React, { useRef, useState, useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { icons } from "@/constants";

interface GymBookingLayoutProps {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
}

const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Sweat is just your fat crying.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "Push yourself because no one else is going to do it for you.",
  "When you feel like quitting, think about why you started.",
  "Don’t stop when you’re tired, stop when you’re done.",
  "Success starts with self-discipline.",
  "You don’t have to be extreme, just consistent.",
  "The hard part isn’t getting your body in shape. The hard part is getting your mind in shape.",
  "Fall in love with taking care of yourself.",
  "Excuses don’t burn calories.",
  "It’s a slow process, but quitting won’t speed it up.",
  "Train insane or remain the same.",
  "Make your body the sexiest outfit you own.",
  "Do something today that your future self will thank you for.",
  "Strive for progress, not perfection.",
  "The best project you’ll ever work on is you.",
  "Strength doesn’t come from what you can do. It comes from overcoming the things you once thought you couldn’t.",
  "The only bad workout is no workout at all.",
  "Discipline is choosing between what you want now and what you want most.",
  "Work hard in silence, let your success be your noise.",
  "The pain you feel today will be the progress you see tomorrow.",
  "The difference between try and triumph is a little 'umph'.",
  "Every workout is progress, even the ones that feel tough.",
  "If it doesn’t challenge you, it doesn’t change you.",
  "You don’t have to be great to start, but you have to start to be great.",
  "Your only limit is you.",
  "Don’t wish for it. Work for it.",
  "Sore today, strong tomorrow.",
  "The more you sweat, the less you bleed.",
  "Results happen over time, not overnight. Work hard, stay consistent, and be patient.",
  "There are no shortcuts to any place worth going.",
  "You are one workout away from a good mood.",
  "You are stronger than you think.",
  "What seems impossible today will one day be your warm-up.",
  "It never gets easier, you just get stronger.",
  "Nothing worth having comes easy.",
  "The only way to see results is to stay consistent.",
  "Don’t count the days, make the days count.",
  "The body achieves what the mind believes.",
  "Your sweat is your success.",
  "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
  "Great things never come from comfort zones.",
  "Success isn’t always about greatness. It’s about consistency. Consistent hard work leads to success. Greatness will come.",
  "Don’t limit your challenges. Challenge your limits.",
  "Take care of your body. It’s the only place you have to live.",
  "You didn’t come this far to only come this far.",
  "The road may be long, but the view at the end is worth it.",
  "Stop doubting yourself, work hard, and make it happen."
];


const GymBookingLayout: React.FC<GymBookingLayoutProps> = ({
  title,
  snapPoints,
  children,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
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

        {/* Motivational Quote */}
        <View className="px-6 pb-4 mt-4">
          <Text className="text-white text-xl text-center font-semibold italic">
            "{quote}"
          </Text>
        </View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints || ["50%", "70%"]}
          index={0}
          backgroundStyle={{ backgroundColor: 'black' }}
          handleIndicatorStyle={{ backgroundColor: 'yellow' }}
        >
          <BottomSheetScrollView
            style={{
              flex: 1,
              padding: 20,
            }}
            contentContainerStyle={{
              backgroundColor: 'black',
            }}
          >
            {children}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default GymBookingLayout;