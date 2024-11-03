import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface SessionCardProps {
  item: {
    id: string;
    time: string;
    spotsLeft: number;
    image: string;
    isAvailable: boolean;
  };
  selected: boolean;
  setSelected: () => void;
  progressPercentage: number;
}

const SessionCard: React.FC<SessionCardProps> = ({ item, selected, setSelected, progressPercentage }) => {
  const roundedPercentage = Math.round(progressPercentage);

  return (
    <TouchableOpacity
      onPress={setSelected}
      disabled={!item.isAvailable}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <Image
          source={require('@/assets/images/book-icon.png')}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={styles.spotsText}>
            {item.spotsLeft} spots left ({roundedPercentage}% booked)
          </Text>
          <View style={styles.progressBarBackground}>
            <View 
              style={[styles.progressBar, { width: `${progressPercentage}%` }]} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#333333',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  timeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spotsText: {
    color: 'gray',
    fontSize: 14,
  },
  progressBarBackground: {
    marginTop: 5,
    backgroundColor: '#555555',
    height: 5,
    borderRadius: 5,
  },
  progressBar: {
    backgroundColor: '#FFD700',
    height: 5,
    borderRadius: 5,
  },
});

export default SessionCard;