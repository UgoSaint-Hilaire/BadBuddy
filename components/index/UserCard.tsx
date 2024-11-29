import { User } from "@/types/user";
import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, interpolate, SharedValue } from "react-native-reanimated";

interface UserCardProps {
  item: User;
  size: number;
  x: SharedValue<number>;
  index: number;
}

const UserCard: React.FC<UserCardProps> = ({ item, size, x, index }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(x.value, [(index - 1) * size, index * size, (index + 1) * size], [0.95, 1.1, 0.95]);

    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[styles.card, { width: size, height: size * 1.2 }]}>
      {/* Image principale */}
      <Animated.View style={styles.imageContainer}>
        <Animated.Image source={{ uri: item.profile_picture }} style={styles.image} resizeMode="cover" />
      </Animated.View>

      <Animated.View style={styles.userInfo}>
        <Animated.Text style={styles.userName}>{item.username}</Animated.Text>
        <Animated.Text style={styles.userName}>{item.age}</Animated.Text>
        <Animated.Text style={styles.userName}>{item.ranking}</Animated.Text>
        {/* <Animated.Text style={styles.userLocation}>
            {item.distance ? `${Math.round(item.distance)}m` : 'Distance inconnue'}
          </Animated.Text> */}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 16,
  },
  userName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userLocation: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 2,
  },
  userInterests: {
    color: "#ffffff",
    fontSize: 12,
    fontStyle: "italic",
  },
});

export default UserCard;
