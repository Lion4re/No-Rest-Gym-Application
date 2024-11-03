import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { tokenCache } from '@/lib/auth';

import { WorkoutScheduleProvider } from '@/components/workoutScheduleContext';
// import Toast from 'react-native-toast-message';


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  if (!publishableKey) {
    throw new Error(
      'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    )
  }

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
      <WorkoutScheduleProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(root)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="book-session" options={{ headerShown: false }} />
            <Stack.Screen name="booking-confirmed" options={{ headerShown: false }} />
            <Stack.Screen name="booking-history" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="view-users" options={{ headerShown: false }} />
            <Stack.Screen name="admin/AdminBookingView" options={{ headerShown: false }} />
            <Stack.Screen name="admin/EditWorkouts" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          {/* <Toast /> */}
        </WorkoutScheduleProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}



//   return (
//     <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
//       <ClerkLoaded>
//         <WorkoutScheduleProvider>
//           <Stack>
//             {/* Your Stack.Screen components */}
            
//             {/* Make sure to include the EditWorkouts screen here if it's not already present */}
//           </Stack>
//         </WorkoutScheduleProvider>
//       </ClerkLoaded>
//     </ClerkProvider>
//   );
// }