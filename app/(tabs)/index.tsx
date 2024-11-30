import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, ActivityIndicator, Dimensions, Animated, FlatList, Image } from "react-native";
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
import { FIREBASE_AUTH } from "@/config/firebase";
import { router } from "expo-router";
import { useLocationCalculations } from "@/hooks/useLocationCalculations";
import { MapComponent } from "@/components/map/MapComponent";

type LocationArray = [number, number];

const arrayToCoordinates = (locationArray: unknown): Coordinates => {
  const [lat, lng] = locationArray as LocationArray;
  return {
    latitude: lat,
    longitude: lng,
  };
};

export default function TabOneScreen() {
  const { calculateDistance, findNearestLocation } = useLocationCalculations();

  const handleUserMarkerPress = (user: User) => {
    if (!currentLocation) return;

    setSelectedUserId(user.id);
    const userCoords = arrayToCoordinates(user.current_location);
    setSelectedUserCoords(userCoords);

    const midPoint = {
      latitude: (currentLocation.latitude + userCoords.latitude) / 2,
      longitude: (currentLocation.longitude + userCoords.longitude) / 2,
    };

    const nearestGym = filteredGyms.length ? findNearestLocation(midPoint, filteredGyms) : null;

    setNearestGym(nearestGym);

    if (mapRef.current && nearestGym) {
      const distance = calculateDistance(currentLocation, {
        latitude: nearestGym.equip_y,
        longitude: nearestGym.equip_x,
      }).toFixed(2);
      console.log(`Distance entre moi et le gymnase "${nearestGym.inst_nom}": ${distance} km`);
    }
  };
  const user = FIREBASE_AUTH.currentUser;

  // Rediriger vers l'écran de connexion si non authentifié
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
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [selectedUserCoords, setSelectedUserCoords] = useState<Coordinates | null>(null);
  const [nearestGym, setNearestGym] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [rankFilter, setRankFilter] = useState<string[]>([]);

  const ranks = ["Tous", "N1", "N2", "N3", "R4", "R5", "R6", "D7", "D8", "D9", "P10", "P11", "P12", "NC"];

  const filteredGyms = data?.results
    ? data.results.reduce((uniqueGyms, gym) => {
        if (!uniqueGyms.some((g) => g.inst_nom === gym.inst_nom)) {
          uniqueGyms.push(gym);
        }
        return uniqueGyms;
      }, [] as typeof data.results)
    : [];

  const usersInArea = users?.filter((user) => {
    if (!cardinalPoints) return false;

    const userCoords = arrayToCoordinates(user.current_location);

    const toggleRank = (rank: string) => {
      setRankFilter((prev) => (prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]));
    };

    const matchesGender = genderFilter ? user.sexe === genderFilter : true;
    const matchesRank = rankFilter.length > 0 ? rankFilter.includes(user.ranking) : true;

    return (
      userCoords.latitude <= cardinalPoints.north.latitude &&
      userCoords.latitude >= cardinalPoints.south.latitude &&
      userCoords.longitude >= cardinalPoints.west.longitude &&
      userCoords.longitude <= cardinalPoints.east.longitude &&
      matchesGender &&
      matchesRank
    );
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (usersInArea && usersInArea[activeUserIndex]) {
      handleUserMarkerPress(usersInArea[activeUserIndex]);
    }
  }, [activeUserIndex]);

  console.log(usersInArea);

  const renderMap = () => {
    if (isLoading) {
      return (
        <View>
          <ActivityIndicator size="large" />
          <Text>Chargement des données...</Text>
        </View>
      );
    }
    switch (locationStatus) {
      case "loading":
        return (
          <View>
            <ActivityIndicator size="large" />
            <Text>Chargement de la localisation...</Text>
          </View>
        );
      case "error":
        return (
          <View>
            <Text>Erreur lors de la récupération de la localisation</Text>
          </View>
        );
      case "success":
        return currentLocation ? (
          <View style={styles.mapContainer}>
            <MapComponent
              currentLocation={currentLocation}
              usersInArea={usersInArea}
              filteredGyms={filteredGyms}
              nearestGym={nearestGym}
              selectedUserCoords={selectedUserCoords}
              onUserMarkerPress={handleUserMarkerPress}
              selectedUserId={selectedUserId}
              zoomOnUserChange={true}
            />
            <View style={styles.userCardCarousel}>
              <UserCardCarousel data={usersInArea} onActiveIndexChange={setActiveUserIndex} />
            </View>
            {/* Bouton pour ouvrir le modal */}
            <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.filterButtonText}>Filtrer</Text>
            </TouchableOpacity>
          </View>
        ) : null;
      default:
        return (
          <View>
            <Text>En attente de la localisation...</Text>
          </View>
        );
    }
  };

  const toggleRank = (selectedRank: string) => {
    setRankFilter((prev) =>
      prev.includes(selectedRank) ? prev.filter((rank) => rank !== selectedRank) : [...prev, selectedRank]
    );
  };

  return (
    <View style={styles.container}>
      {renderMap()}
      {/* Modal de filtrage */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filtrer les utilisateurs</Text>

          {/* Filtre par sexe */}
          <Text style={styles.filterLabel}>Sexe:</Text>
          <ButtonGroup
            buttons={["Tous", "Homme", "Femme"]}
            selectedIndex={genderFilter === "" ? 0 : genderFilter === "Homme" ? 1 : genderFilter === "Femme" ? 2 : null}
            onPress={(index) => setGenderFilter(index === 0 ? "" : index === 1 ? "Homme" : "Femme")}
            containerStyle={styles.buttonGroup}
            selectedButtonStyle={styles.selectedButton}
          />

          {/* Filtre par classement */}
          <Text style={styles.filterLabel}>Classement:</Text>
          <ButtonGroup
            buttons={ranks}
            selectedIndexes={rankFilter.map((rank) => ranks.indexOf(rank))}
            onPress={(index) => {
              const selectedRank = ranks[index];
              if (selectedRank === "Tous") {
                setRankFilter([]); // Réinitialise à "Tous"
              } else {
                toggleRank(selectedRank);
              }
            }}
            containerStyle={styles.buttonGroup}
            selectedButtonStyle={styles.selectedButton}
          />

          {/* Bouton Reset */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setGenderFilter("");
              setRankFilter([]);
            }}>
            <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
          </TouchableOpacity>

          {/* Bouton Fermer */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    zIndex: 0, // La carte doit avoir un zIndex inférieur
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
