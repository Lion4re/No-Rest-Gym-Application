import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';
import { useWorkoutSchedule } from '@/components/workoutScheduleContext';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '@/components/CustomButton';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditWorkouts() {
    const { schedule, updateSchedule, refreshSchedule } = useWorkoutSchedule();
    const [newSchedule, setNewSchedule] = useState({...schedule, version: (schedule.version || 0) + 1});
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
    const [isMessageVisible, setIsMessageVisible] = useState(false);
    const [focusedDay, setFocusedDay] = useState<string | null>(null);

    const handleWorkoutChange = (day: string, workout: string) => {
        setNewSchedule(prev => ({
            ...prev,
            workouts: { ...prev.workouts, [day]: workout }
        }));
    };

    const showStartDatePicker = () => setStartDatePickerVisibility(true);
    const hideStartDatePicker = () => setStartDatePickerVisibility(false);
    const showEndDatePicker = () => setEndDatePickerVisibility(true);
    const hideEndDatePicker = () => setEndDatePickerVisibility(false);

    const handleStartDateConfirm = (date: Date) => {
        const formattedDate = format(date, 'dd/MM/yy');
        setNewSchedule(prev => ({ ...prev, startDate: formattedDate }));
        hideStartDatePicker();
    };

    const handleEndDateConfirm = (date: Date) => {
        const formattedDate = format(date, 'dd/MM/yy');
        setNewSchedule(prev => ({ ...prev, endDate: formattedDate }));
        hideEndDatePicker();
    };

    const saveSchedule = async () => {
        await updateSchedule(newSchedule);
        await refreshSchedule();
        setIsMessageVisible(true);
        setTimeout(() => setIsMessageVisible(false), 2000);
    };

    return (
        <AdminDashboardLayout title="Edit Workouts">
            <KeyboardAwareScrollView
                style={styles.container}
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={{ flexGrow: 1 }}
                scrollEnabled={true}
                extraScrollHeight={80} // Adjustable
            >
                <View style={styles.dateContainer}>
                    <TouchableOpacity onPress={showStartDatePicker} style={styles.datePicker}>
                        <Text style={styles.dateText}>Start Date: {newSchedule.startDate}</Text>
                        <Ionicons name="calendar-outline" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isStartDatePickerVisible}
                        mode="date"
                        onConfirm={handleStartDateConfirm}
                        onCancel={hideStartDatePicker}
                    />
                </View>
                <View style={styles.dateContainer}>
                    <TouchableOpacity onPress={showEndDatePicker} style={styles.datePicker}>
                        <Text style={styles.dateText}>End Date: {newSchedule.endDate}</Text>
                        <Ionicons name="calendar-outline" size={24} color="#FFD700" />
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isEndDatePickerVisible}
                        mode="date"
                        onConfirm={handleEndDateConfirm}
                        onCancel={hideEndDatePicker}
                    />
                </View>
                {days.map(day => (
                    <View key={day} style={styles.workoutContainer}>
                        <Text style={styles.dayText}>{day}:</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focusedDay === day && styles.inputFocused
                            ]}
                            value={newSchedule.workouts[day]}
                            onChangeText={(text) => handleWorkoutChange(day, text)}
                            placeholder={`Enter workout for ${day}`}
                            placeholderTextColor="#999"
                            onFocus={() => setFocusedDay(day)}
                            onBlur={() => setFocusedDay(null)}
                        />
                    </View>
                ))}
                <CustomButton
                    onPress={saveSchedule}
                    title="Save Schedule"
                    bgVariant="primary"
                    textVariant="default"
                />
            </KeyboardAwareScrollView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={isMessageVisible}
                onRequestClose={() => setIsMessageVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Schedule Updated Successfully!</Text>
                    </View>
                </View>
            </Modal>
        </AdminDashboardLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    dateContainer: {
        marginBottom: 20,
    },
    datePicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000',
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    dateText: {
        fontSize: 16,
        color: '#fff',
    },
    workoutContainer: {
        marginBottom: 15,
    },
    dayText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 5,
    },
    input: {
        backgroundColor: 'black',
        color: 'white',
        padding: 10,
        borderRadius: 25,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'white',
    },
    inputFocused: {
        borderColor: 'yellow',
    },
    saveButton: {
        backgroundColor: '#0286FF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
});