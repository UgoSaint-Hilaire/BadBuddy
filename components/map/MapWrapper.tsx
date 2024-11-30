import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import { MapComponent } from "@/components/map/MapComponent";
import { FilterModal } from "@/components/filter/FilterModal";
import { UserCardCarousel } from "@/components/index/UserCardCarrousel";
import { Coordinates } from "@/types/coordinates";
import { User } from "@/types/user";

type MapWrapperProps = {
  isLoading: boolean;
  locationStatus: "idle" | "loading" | "success" | "error";
  currentLocation: Coordinates | null;
  users: User[];
  gyms: Array<{ equip_y: number; equip_x: number; inst_nom: string; inst_adresse: string }>;
  nearestGym: { equip_y: number; equip_x: number; inst_nom: string } | null;
  selectedUserCoords: Coordinates | null;
  handleUserMarkerPress: (user: User) => void;
  selectedUserId: string | null;
  isModalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  rankFilter: string[];
  toggleRank: (rank: string) => void;
  resetFilters: () => void;
  activeUserIndex: number;
  setActiveUserIndex: (index: number) => void;
};

export const MapWrapper: React.FC<MapWrapperProps> = ({
  isLoading,
  locationStatus,
  currentLocation,
  users,
  gyms,
  nearestGym,
  selectedUserCoords,
  handleUserMarkerPress,
  selectedUserId,
  isModalVisible,
  setModalVisible,
  genderFilter,
  setGenderFilter,
  rankFilter,
  toggleRank,
  resetFilters,
  activeUserIndex,
  setActiveUserIndex,
}) => {
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
        <Text>Chargement des données...</Text>
      </View>
    );
  }

  switch (locationStatus) {
    case "loading":
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" />
          <Text>Chargement de la localisation...</Text>
        </View>
      );
    case "error":
      return (
        <View style={styles.centeredContainer}>
          <Text>Erreur lors de la récupération de la localisation</Text>
        </View>
      );
    case "success":
      return currentLocation ? (
        <View style={styles.mapContainer}>
          <MapComponent
            currentLocation={currentLocation}
            usersInArea={users}
            filteredGyms={gyms}
            nearestGym={nearestGym}
            selectedUserCoords={selectedUserCoords}
            onUserMarkerPress={handleUserMarkerPress}
            selectedUserId={selectedUserId}
            zoomOnUserChange={true}
          />
          <FilterModal
            isVisible={isModalVisible}
            onClose={() => setModalVisible(false)} // Gérer la fermeture
            genderFilter={genderFilter}
            setGenderFilter={setGenderFilter}
            rankFilter={rankFilter}
            toggleRank={toggleRank}
            resetFilters={resetFilters}
          />
          <View style={styles.userCardCarousel}>
            <UserCardCarousel data={users} onActiveIndexChange={setActiveUserIndex} />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.filterButtonText}>Filtrer</Text>
          </TouchableOpacity>
        </View>
      ) : null;
    default:
      return (
        <View style={styles.centeredContainer}>
          <Text>En attente de la localisation...</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    position: "relative",
    zIndex: 0,
  },
  userCardCarousel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "transparent",
    elevation: 5,
  },
  filterButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  filterButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
