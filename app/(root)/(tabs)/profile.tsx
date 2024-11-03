import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAPI } from '@/lib/fetch';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, differenceInDays } from 'date-fns';

interface ProfileFieldProps {
  label: string;
  value: string;
  onSave?: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
  style?: object;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, onSave, editable = true, placeholder, style }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  const inputRef = useRef<TextInput>(null);

  const handleSave = () => {
    if (onSave) {
      onSave(fieldValue);
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldContentContainer}>
        {isEditing ? (
          <TextInput
            ref={inputRef}
            value={fieldValue}
            onChangeText={setFieldValue}
            placeholder={placeholder}
            style={[styles.input, style]}
            autoFocus
          />
        ) : (
          <Text style={[styles.fieldValue, style]}>{value}</Text>
        )}
        {editable && onSave && (
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            <Ionicons 
              name={isEditing ? "checkmark-outline" : "pencil-outline"} 
              size={24} 
              color="#FFD700"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface DbUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_approved: boolean;
  subscription_end: string | null;
}

const ProfilePage: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserFromDb = async () => {
      if (user) {
        try {
          const response = await fetchAPI(`/(api)/users/${user.id}`);
          if (response.error) {
            throw new Error(response.error);
          }
          setDbUser(response.data);
          setProfileImage(user.imageUrl);
        } catch (error) {
          console.error('Error fetching user from database:', error);
          setError('Failed to load user data. Please try again.');
          Alert.alert('Error', 'Failed to load user data. Please try again.');
        }
      }
    };

    fetchUserFromDb();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const navigateToBookingHistory = () => {
    router.push('/booking-history');
  };

  const navigateToAdminDashboard = () => {
    router.push('/dashboard');
  };

  const handleSave = async (field: string, value: string) => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    try {
      if (field === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        throw new Error('Invalid email format');
      }

      const response = await fetchAPI(`/(api)/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.error) {
        throw new Error(`Server error: ${response.error}${response.details ? ` - ${response.details}` : ''}`);
      }

      if (!response.data) {
        throw new Error('No data returned from update');
      }

      setDbUser(response.data);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      Alert.alert('Error', `Failed to update profile: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64 = `data:image/png;base64,${result.assets[0].base64}`;
      uploadImage(base64);
    }
  };

  const uploadImage = async (base64: string) => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    try {
      await user.setProfileImage({
        file: base64,
      });

      await user.reload();
      setProfileImage(user.imageUrl);

      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
  };

  const formatSubscriptionEnd = (date: string | null): string => {
    if (!date) return 'Not set';
    return format(parseISO(date), 'dd-MM-yyyy');
  };

  const isSubscriptionEnding = (date: string | null): boolean => {
    if (!date) return false;
    const endDate = parseISO(date);
    const today = new Date();
    const daysUntilEnd = differenceInDays(endDate, today);
    return daysUntilEnd <= 3 && daysUntilEnd >= 0;
  };

  if (!isLoaded || !isSignedIn) {
    return <Text style={styles.loadingText}>Loading user data...</Text>;
  }

  if (error) return <Text style={styles.errorText}>{error}</Text>;
  if (!dbUser) return <Text style={styles.loadingText}>Loading profile data...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.div} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Your profile</Text>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{ uri: profileImage || user?.imageUrl || 'https://example.com/default-avatar.png' }}
                style={styles.profileImage}
              />
              {dbUser && (
                <View style={styles.approvalBadge}>
                  {dbUser.is_approved ? (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  ) : (
                    <Ionicons name="close-circle" size={24} color="#FF0000" />
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <ProfileField 
            label="Name" 
            value={dbUser?.name || ''}
            onSave={(value) => handleSave('name', value)}
            placeholder="Enter name"
          />
          <ProfileField 
            label="Email" 
            value={dbUser?.email || ''}
            editable={false}
            placeholder="Enter email"
          />
          
          <ProfileField 
            label="Subscription End" 
            value={formatSubscriptionEnd(dbUser?.subscription_end)}
            editable={false}
            style={isSubscriptionEnding(dbUser?.subscription_end) ? styles.subscriptionEnding : {}}
          />
          {dbUser?.is_admin && (
            <CustomButton 
              title="Admin Dashboard" 
              onPress={navigateToAdminDashboard}
              bgVariant="danger"
              textVariant="default"
              style={styles.adminButton}
            />
          )}
          
          <CustomButton 
            title="Booking History" 
            onPress={navigateToBookingHistory}
            bgVariant="primary"
            textVariant="default"
            style={styles.bookingHistoryButton}
          />
          
          <CustomButton title="Sign out" onPress={handleSignOut} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 0,
  },
  div: {
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40, // Add extra padding at the bottom
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  approvalBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 2,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  fieldContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  fieldValue: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    paddingVertical: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 15,
  },
  editButton: {
    padding: 10,
  },
  bookingHistoryButton: {
    marginBottom: 20,
  },
  adminButton: {
    backgroundColor: '#FF4500',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  subscriptionEnding: {
    color: 'red',
  },
});

export default ProfilePage;