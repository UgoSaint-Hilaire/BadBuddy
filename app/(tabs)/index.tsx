import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  FlatList,
  Image,
} from "react-native";
import { Modal, TouchableOpacity, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import { useGetLocationsQuery } from "../../hooks/apis/LocationApi";
import { useLocation } from "@/hooks/useLocation";
import { useUsers } from "@/hooks/useUsers";
import MapView, { Marker, Polyline } from "react-native-maps";
import { User } from "../../types/user";
import { Coordinates } from "../../types/coordinates";
import { UserCardCarousel } from "@/components/index/UserCardCarrousel";
import { ButtonGroup } from "react-native-elements";
import { FiltersModal } from "@/components/filters/FilterModal";
import { MapDisplay } from "@/components/map/MapDisplay";
import { arrayToCoordinates } from "@/utils/coordinatesUtils";
import { useMapScreen } from "@/hooks/useMapScreen";

type LocationArray = [number, number];

// const arrayToCoordinates = (locationArray: unknown): Coordinates => {
//   const [lat, lng] = locationArray as LocationArray;
//   return {
//     latitude: lat,
//     longitude: lng,
//   };
// };

// ------------------------------------------------------------
// const findNearestLocation = (
//   midPoint: Coordinates,
//   locations: Array<{ equip_y: number; equip_x: number; inst_nom: string }>
// ) => {
//   if (!locations || locations.length === 0) return null;

//   return locations.reduce((closest, location) => {
//     const distanceToMidPoint = Math.sqrt(
//       Math.pow(midPoint.latitude - location.equip_y, 2) +
//         Math.pow(midPoint.longitude - location.equip_x, 2)
//     );
//     const distanceToClosest = Math.sqrt(
//       Math.pow(midPoint.latitude - closest.equip_y, 2) +
//         Math.pow(midPoint.longitude - closest.equip_x, 2)
//     );

//     return distanceToMidPoint < distanceToClosest ? location : closest;
//   }, locations[0]);
// };

// const calculateDistance = (coord1: Coordinates, coord2: Coordinates) => {
//   const R = 6371; // Rayon de la Terre en km
//   const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
//   const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((coord1.latitude * Math.PI) / 180) *
//       Math.cos((coord2.latitude * Math.PI) / 180) *
//       Math.sin(dLng / 2) *
//       Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance en km
// };

export default function TabOneScreen() {
  const { currentLocation, locationStatus, cardinalPoints } = useLocation();
  console.log(locationStatus);
  const mapRef = useRef<MapView>(null);
  const { data, isLoading } = useGetLocationsQuery(cardinalPoints!, {
    skip: !cardinalPoints,
  });
  const { users } = useUsers() as {
    users: User[];
    loading: boolean;
    error: any;
  };

  const [fadeAnim] = useState(new Animated.Value(0));
  const [isModalVisible, setModalVisible] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [rankFilter, setRankFilter] = useState<string[]>([]);

  // const filteredGyms = data?.results
  //   ? data.results.reduce((uniqueGyms, gym) => {
  //       if (!uniqueGyms.some((g) => g.inst_nom === gym.inst_nom)) {
  //         uniqueGyms.push(gym);
  //       }
  //       return uniqueGyms;
  //     }, [] as typeof data.results)
  //   : [];

  const usersInArea = users?.filter((user) => {
    if (!cardinalPoints) return false;

    const userCoords = arrayToCoordinates(user.current_location);

    const matchesGender = genderFilter ? user.sexe === genderFilter : true;
    const matchesRank =
      rankFilter.length > 0 ? rankFilter.includes(user.ranking) : true;

    return (
      userCoords.latitude <= cardinalPoints.north.latitude &&
      userCoords.latitude >= cardinalPoints.south.latitude &&
      userCoords.longitude >= cardinalPoints.west.longitude &&
      userCoords.longitude <= cardinalPoints.east.longitude &&
      matchesGender &&
      matchesRank
    );
  });

  console.log(usersInArea);

  const mapLogic = useMapScreen({
    currentLocation,
    filteredGyms,
    usersInArea,
    mapRef,
  });

  const {
    selectedUserId,
    selectedUserCoords,
    nearestGym,
    activeUserIndex,
    setActiveUserIndex,
    handleUserMarkerPress,
  } = mapLogic;

  return (
    <View style={styles.container}>
      <MapDisplay
        currentLocation={currentLocation}
        locationStatus={locationStatus}
        usersInArea={usersInArea}
        filteredGyms={filteredGyms}
        onUserMarkerPress={handleUserMarkerPress}
        selectedUserId={selectedUserId}
        nearestGym={nearestGym}
        selectedUserCoords={selectedUserCoords}
        activeUserIndex={activeUserIndex}
        setActiveUserIndex={setActiveUserIndex}
      />

      {/* LA CEST LE CARROUSEL AVEC LES CARTES DES USERS */}
      <View style={styles.userCardCarousel}>
        <UserCardCarousel
          data={usersInArea}
          onActiveIndexChange={setActiveUserIndex}
        />
      </View>

      {/* LA CEST LES FILTRES */}
      <FiltersModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        rankFilter={rankFilter}
        setRankFilter={setRankFilter}
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>Filtrer</Text>
      </TouchableOpacity>
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
  mapContainer: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    position: "relative",
    zIndex: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userCardCarousel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2, // Le carrousel doit avoir un zIndex supérieur
    backgroundColor: "transparent", // Pour s'assurer que le fond est transparent
    elevation: 5, // Nécessaire pour Android
  },
  filterButton: {
    position: "absolute",
    top: 100,
    right: 20,
    padding: 10,
    backgroundColor: "black",
    borderRadius: 5,
  },
  filterButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  input: {
    width: "80%",
    height: 40,
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  buttonGroup: {
    marginVertical: 10,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: "#2196F3", // Couleur de fond du bouton sélectionné
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "red",
    marginVertical: 5,
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  resetButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#FFA500", // Orange ou une couleur qui contraste bien
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
