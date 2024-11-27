import React from "react";
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useUsers, User } from "@/hooks/useUsers";

export default function Profile() {
  const { users, loading, error } = useUsers();



  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderUser = ({ item }: { item: User }) => {
    const latitude = item.current_location[0] || 0;
    const longitude = item.current_location[1] || 0;
  
    return (
      <View style={styles.userCard}>
        <Image source={{ uri: item.profile_picture }} style={styles.profilePicture} />
        <ScrollView>
          <Text style={styles.userField}>**ID**: {item.id}</Text>
          <Text style={styles.userField}>**User ID**: {item.user_id}</Text>
          <Text style={styles.userField}>**Username**: {item.username}</Text>
          <Text style={styles.userField}>**Email**: {item.email}</Text>
          <Text style={styles.userField}>**Age**: {item.age}</Text>
          <Text style={styles.userField}>**Sexe**: {item.sexe}</Text>
          <Text style={styles.userField}>**Ranking**: {item.ranking}</Text>
          <Text style={styles.userField}>
            **Location**: Latitude: {latitude}, Longitude: {longitude}
          </Text>
          <Text style={styles.userField}>**Preferences**:</Text>
          {Object.entries(item.preferences).map(([key, value]) => (
            <Text key={key} style={styles.preference}>
              - {key}: {value}
            </Text>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={renderUser}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
    loading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      color: "red",
      fontSize: 16,
    },
    container: {
      padding: 10,
    },
    userCard: {
      backgroundColor: "#f9f9f9",
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
      elevation: 2,
    },
    profilePicture: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: "center",
      marginBottom: 10,
    },
    userField: {
      fontSize: 14,
      marginBottom: 5,
      color: "#333",
    },
    preference: {
      fontSize: 12,
      marginLeft: 10,
      color: "#555",
    },
  });