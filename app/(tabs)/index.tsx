import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { useGetLocationsQuery } from "../../hooks/apis/LocationApi";
import { useLocation } from "@/hooks/useLocation";
import { useUsers } from "@/hooks/useUsers";
import { User } from "../../types/user";
import { Coordinates } from "../../types/coordinates";
import { FIREBASE_AUTH } from "@/config/firebase";
import { router } from "expo-router";
import { useLocationCalculations } from "@/hooks/useLocationCalculations";
import { useUserFilters } from "@/hooks/useUserFilters";
import { MapWrapper } from "@/components/map/MapWrapper";

export default function TabOneScreen() {
  const { users } = useUsers() as {
    users: User[];
    loading: boolean;
    error: any;
  };

  const { currentLocation, locationStatus, cardinalPoints } = useLocation();

  const { filteredUsers, genderFilter, setGenderFilter, rankFilter, toggleRank, resetFilters } = useUserFilters(
    users,
    cardinalPoints
  );

  const { findNearestLocation } = useLocationCalculations();

  const handleUserMarkerPress = (user: User) => {
    if (!currentLocation || !user.coords) return;

    setSelectedUserId(user.id);
    setSelectedUserCoords(user.coords);

    const midPoint = {
      latitude: (currentLocation.latitude + user.coords.latitude) / 2,
      longitude: (currentLocation.longitude + user.coords.longitude) / 2,
    };

    const nearestGym = filteredGyms.length ? findNearestLocation(midPoint, filteredGyms) : null;

    setNearestGym(nearestGym);
  };

  const user = FIREBASE_AUTH.currentUser;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Vous devez être connecté</Text>
        <TouchableOpacity
          onPress={() => {
            router.replace(user ? "/(tabs)" : "/(authentication)/login");
          }}>
          <Text>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // console.log(locationStatus);
  const { data, isLoading } = useGetLocationsQuery(cardinalPoints!, {
    skip: !cardinalPoints,
  });

  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [selectedUserCoords, setSelectedUserCoords] = useState<Coordinates | null>(null);
  const [nearestGym, setNearestGym] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const filteredGyms = data?.results
    ? Array.from(new Map(data.results.map((gym) => [gym.inst_nom, gym])).values())
    : [];

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (filteredUsers && filteredUsers.length > 0 && filteredUsers[activeUserIndex]) {
      handleUserMarkerPress(filteredUsers[activeUserIndex]);
    }
  }, [activeUserIndex, filteredUsers]);

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <Text>Chargement de votre localisation...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <MapWrapper
        isLoading={isLoading}
        locationStatus={locationStatus}
        currentLocation={currentLocation}
        users={filteredUsers}
        gyms={filteredGyms}
        nearestGym={nearestGym}
        selectedUserCoords={selectedUserCoords}
        handleUserMarkerPress={handleUserMarkerPress}
        selectedUserId={selectedUserId}
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        rankFilter={rankFilter}
        toggleRank={toggleRank}
        resetFilters={resetFilters}
        activeUserIndex={activeUserIndex}
        setActiveUserIndex={setActiveUserIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
});
