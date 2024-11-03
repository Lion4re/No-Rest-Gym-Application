import React from "react";
import { Image, Text, TouchableOpacity, View, ScrollView, StyleSheet, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";
import { icons } from "@/constants";

interface AdminDashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.backButton}>
            <Image
              source={icons.backArrow}
              resizeMode="contain"
              style={styles.backIcon}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>{title || "Admin Dashboard"}</Text>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 16,
    backgroundColor: 'black',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: 'black',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
  },
  content: {
    flex: 1,
    backgroundColor: 'black',
  },
  contentContainer: {
    padding: 10,
  },
});

export default AdminDashboardLayout;