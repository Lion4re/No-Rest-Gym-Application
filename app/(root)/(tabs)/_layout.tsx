import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import { icons } from "@/constants";

export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "black",
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 25,
        },
        tabBarItemStyle: {
          paddingTop: 10,
        },
        tabBarIconStyle: {
          marginBottom: 33,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center' }}>
              <Image
                source={icons.dumbbell}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Book",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center' }}>
              <Image
                source={icons.calendar}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: 'center' }}>
              <Image
                source={icons.user}
                style={{ width: 24, height: 24, tintColor: color }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}