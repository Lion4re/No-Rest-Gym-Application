import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Switch, TextInput, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { fetchAPI } from '@/lib/fetch';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { parseISO, addMonths, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: number;
  name: string;
  email: string;
  clerk_id: string;
  is_admin: boolean;
  is_approved: boolean;
  subscription_start: string | null;
  subscription_end: string | null;
}

const timeZone = 'Europe/Athens';

const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString) return 'Not set';
  const date = parseISO(dateString);
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, 'dd/MM/yyyy');
};

const formatDateForAPI = (date: Date): string => {
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, 'yyyy-MM-dd');
};

const addOneMonth = (dateString: string): string => {
  const date = parseISO(dateString);
  const newDate = addMonths(date, 1);
  return format(newDate, 'yyyy-MM-dd');
};

export default function ViewUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortCriteria, setSortCriteria] = useState<'name' | 'id'>('name');
  const [fillAnimations, setFillAnimations] = useState<{ [key: number]: Animated.Value }>({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateType, setDateType] = useState<'start' | 'end'>('start');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const newAnimations: { [key: number]: Animated.Value } = {};
    users.forEach(user => {
      if (!fillAnimations[user.id]) {
        newAnimations[user.id] = new Animated.Value(0);
      }
    });
    setFillAnimations(prev => ({ ...prev, ...newAnimations }));
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI('/(api)/users');
      if (response.error) throw new Error(response.error);
      // console.log('Fetched users:', response.data);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (user: User, updates: Partial<User>) => {
    // console.log('Updating user:', user);
    // console.log('Updates:', updates);
    try {
      const response = await fetchAPI(`/(api)/users/${user.clerk_id || user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      // console.log('Update response:', response);
      if (response.error) throw new Error(response.error);
      setUsers(users.map(u => u.id === user.id ? { ...u, ...response.data } : u));
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const showDatePicker = useCallback((user: User, type: 'start' | 'end') => {
    setSelectedUser(user);
    setDateType(type);
    setSelectedDate(user[`subscription_${type}`] ? parseISO(user[`subscription_${type}`]!) : new Date());
    setDatePickerVisibility(true);
  }, []);

  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = useCallback((date: Date) => {
    if (selectedUser) {
      const formattedDate = formatDateForAPI(date);
      if (dateType === 'start') {
        const endDate = addOneMonth(formattedDate);
        updateUser(selectedUser, { 
          subscription_start: formattedDate,
          subscription_end: endDate
        });
      } else {
        updateUser(selectedUser, { subscription_end: formattedDate });
      }
    }
    hideDatePicker();
  }, [selectedUser, dateType, updateUser]);

  const renewSubscription = useCallback((user: User) => {
    if (user.subscription_start) {
      const endDate = addOneMonth(user.subscription_start);
      updateUser(user, { subscription_end: endDate });
    } else {
      console.error('Cannot renew subscription: subscription start date is not set');
    }
  }, [updateUser]);

  const animateButton = useCallback((userId: number) => {
    Animated.timing(fillAnimations[userId], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => fillAnimations[userId].setValue(0), 300);
    });
  }, [fillAnimations]);

  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toString().includes(searchQuery)
      )
      .sort((a, b) => {
        if (sortCriteria === 'name') {
          return sortOrder === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else {
          return sortOrder === 'asc'
            ? a.id - b.id
            : b.id - a.id;
        }
      });
  }, [users, searchQuery, sortOrder, sortCriteria]);

  const renderUser = useCallback(({ item: user }: { item: User }) => {
    const buttonBackgroundColor = fillAnimations[user.id]?.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', '#FFD700'],
    }) || 'transparent';

    const buttonTextColor = fillAnimations[user.id]?.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FFD700', '#000'],
    }) || '#FFD700';

    return (
      <View style={styles.userItem}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userId}>ID: {user.id}, Clerk ID: {user.clerk_id}</Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Approved:</Text>
          <Switch
            value={user.is_approved}
            onValueChange={(value) => updateUser(user, { is_approved: value })}
            trackColor={{ false: "#767577", true: "#FFD700" }}
            thumbColor={user.is_approved ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
        
        <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker(user, 'start')}>
          <Text style={styles.dateButtonText}>Subscription Start: {formatDateForDisplay(user.subscription_start)}</Text>
          <Ionicons name="calendar-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker(user, 'end')}>
          <Text style={styles.dateButtonText}>Subscription End: {formatDateForDisplay(user.subscription_end)}</Text>
          <Ionicons name="calendar-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            animateButton(user.id);
            renewSubscription(user);
          }}
        >
          <Animated.View style={[styles.renewButton, { backgroundColor: buttonBackgroundColor }]}>
            <Animated.Text style={[styles.renewButtonText, { color: buttonTextColor }]}>
              Renew Subscription
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }, [showDatePicker, formatDateForDisplay, renewSubscription, animateButton, fillAnimations, updateUser]);

  if (loading) {
    return (
      <AdminDashboardLayout title="View Users">
        <Text style={styles.loadingText}>Loading users...</Text>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="View Users">
        <Text style={styles.errorText}>{error}</Text>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="View Users">
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortCriteria(sortCriteria === 'name' ? 'id' : 'name')}
        >
          <Text style={styles.sortButtonText}>
            Sort by: {sortCriteria === 'name' ? 'Name' : 'ID'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <Text style={styles.sortButtonText}>
            Order: {sortOrder === 'asc' ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredAndSortedUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    </AdminDashboardLayout>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  userItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#CCC',
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
  },
  renewButton: {
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  renewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  userId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  searchContainer: {
    backgroundColor: '#444',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    height: 40,
    color: '#FFF',
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sortButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  sortButtonText: {
    color: '#FFD700',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
});