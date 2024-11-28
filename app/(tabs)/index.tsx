import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  FlatList,
  Image,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useGetLocationsQuery } from "@/apis/LocationApi";
import { useLocation } from "@/hooks/useLocation";
import { useUsers } from "@/hooks/useUsers";
import MapView, { Marker, Polyline } from "react-native-maps";
import { User } from "../../types/user";
import { Coordinates } from "../../types/coordinates";

type LocationArray = [number, number];

const arrayToCoordinates = (locationArray: unknown): Coordinates => {
  const [lat, lng] = locationArray as LocationArray;
  return {
    latitude: lat,
    longitude: lng,
  };
};

const findNearestLocation = (
  midPoint: Coordinates,
  locations: Array<{ equip_y: number; equip_x: number; inst_nom: string }>
) => {
  if (!locations || locations.length === 0) return null;

  return locations.reduce((closest, location) => {
    const distanceToMidPoint = Math.sqrt(
      Math.pow(midPoint.latitude - location.equip_y, 2) +
        Math.pow(midPoint.longitude - location.equip_x, 2)
    );
    const distanceToClosest = Math.sqrt(
      Math.pow(midPoint.latitude - closest.equip_y, 2) +
        Math.pow(midPoint.longitude - closest.equip_x, 2)
    );

    return distanceToMidPoint < distanceToClosest ? location : closest;
  }, locations[0]);
};

// Fonction pour calculer la distance entre deux points géographiques
const calculateDistance = (coord1: Coordinates, coord2: Coordinates) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en km
};

export default function HomeScreen() {
  const { currentLocation, locationStatus, cardinalPoints } = useLocation();
  const { data, isLoading } = useGetLocationsQuery(cardinalPoints!, {
    skip: !cardinalPoints,
  });
  const { users } = useUsers() as {
    users: User[];
    loading: boolean;
    error: any;
  };

  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedUserCoords, setSelectedUserCoords] = useState<Coordinates | null>(null);
  const [nearestGym, setNearestGym] = useState<any>(null);
  const mapRef = useRef<MapView>(null);


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

    return (
      userCoords.latitude <= cardinalPoints.north.latitude &&
      userCoords.latitude >= cardinalPoints.south.latitude &&
      userCoords.longitude >= cardinalPoints.west.longitude &&
      userCoords.longitude <= cardinalPoints.east.longitude
    );
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleUserMarkerPress = (user: User) => {
    if (!currentLocation) return;
  
    setSelectedUserId(user.id);
    const userCoords = arrayToCoordinates(user.current_location);
    setSelectedUserCoords(userCoords);
  
    const midPoint = {
      latitude: (currentLocation.latitude + userCoords.latitude) / 2,
      longitude: (currentLocation.longitude + userCoords.longitude) / 2,
    };
  
    const nearestGym = filteredGyms.length
      ? findNearestLocation(midPoint, filteredGyms)
      : null;
    setNearestGym(nearestGym);

    if (mapRef.current && nearestGym) {
      const points = [
        currentLocation,
        userCoords,
        { latitude: nearestGym.equip_y, longitude: nearestGym.equip_x },
      ];
    
      const latitudes = points.map((p) => p.latitude);
      const longitudes = points.map((p) => p.longitude);
    
      const minLatitude = Math.min(...latitudes);
      const maxLatitude = Math.max(...latitudes);
      const minLongitude = Math.min(...longitudes);
      const maxLongitude = Math.max(...longitudes);
    
      const paddingPercentage = 0.35;
      const latitudeDelta = (maxLatitude - minLatitude) * (1 + paddingPercentage);
      const longitudeDelta = (maxLongitude - minLongitude) * (1 + paddingPercentage);
    
      const region = {
        latitude: (minLatitude + maxLatitude) / 2,
        longitude: (minLongitude + maxLongitude) / 2,
        latitudeDelta,
        longitudeDelta,
      };
    
      mapRef.current.animateToRegion(region, 800
      );
      console.log(
        `Distance entre moi et le gymnase "${nearestGym.inst_nom}": ${calculateDistance(
          currentLocation,
          { latitude: nearestGym.equip_y, longitude: nearestGym.equip_x }
        ).toFixed(2)} km`
      );
    }
    
  };

  useEffect(() => {
    if (usersInArea) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(4000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [usersInArea?.length]);

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
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.06,
                longitudeDelta: 0.07,
              }}
              showsScale={true}
              showsCompass={true}
              zoomTapEnabled={false}
              showsUserLocation
            >
              {usersInArea &&
                usersInArea.length > 0 &&
                usersInArea.map((user, index) => (
                    <>
                    <Marker
                      key={`user-${index}`}
                      coordinate={arrayToCoordinates(user.current_location)}
                      pinColor="green"
                      title={user.username}
                      description={`Classement: ${user.ranking}, Age: ${user.age}`}
                    onPress={() => handleUserMarkerPress(user)}
                    image={
                      selectedUserId === user.id
                        ? require("../../assets/images/icon_users_large.png")
                        : require("../../assets/images/icon_users_small.png")
                    }
                  />
                  </>
                ))}
              {filteredGyms &&
                filteredGyms.map((location, index) => (
                  <Marker
                    key={`marker-${index}`}
                    coordinate={{
                      latitude: location.equip_y,
                      longitude: location.equip_x,
                    }}
                    title={location.inst_nom}
                    description={location.inst_adresse}
                    image={require("../../assets/images/icon_badminton.png")}
                  />
                ))}
              {nearestGym && currentLocation && (
                <Polyline
                  coordinates={[
                    { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
                    { latitude: nearestGym.equip_y, longitude: nearestGym.equip_x },
                  ]}
                  strokeColor="#45b4ea"
                  strokeWidth={5}
                />
              )}
              {nearestGym && selectedUserCoords && (
                <Polyline
                  coordinates={[
                    { latitude: selectedUserCoords.latitude, longitude: selectedUserCoords.longitude },
                    { latitude: nearestGym.equip_y, longitude: nearestGym.equip_x },
                  ]}
                  strokeColor="#4676d9"
                  strokeWidth={5}
                />
              )}
            </MapView>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.animatedScrollView}
              data={usersInArea || []}
              keyExtractor={(user) => user.user_id}
              renderItem={({ item: user }) => (
                <View style={styles.userCard}>
                  <Image
                    source={{ uri: user.profile_picture }}
                    style={styles.userImage}
                  />
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.userInfo}>
                    {user.ranking} - {user.sexe}
                  </Text>
                  <Text style={styles.userInfo}>{user.age} ans</Text>
                  <Text style={styles.userInfo}>
                    {Object.values(user.preferences).join(", ")}
                  </Text>
                </View>
              )}
            />
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

  return (
    <View style={styles.container}>
      {renderMap()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  animatedScrollView: {
    position: "absolute",
    bottom: 20,
    zIndex: 999,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 10,
  },
  userImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  userInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    backgroundColor: "red",
  },
  userInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
});
