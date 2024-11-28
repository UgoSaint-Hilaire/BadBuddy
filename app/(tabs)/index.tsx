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
import { useGetLocationsQuery } from "../apis/LocationApi";
import { useLocation } from "../hooks/useLocation";
import { useUsers } from "@/hooks/useUsers";
import MapView, { Marker, Polyline } from "react-native-maps";
import { User } from "../types/user";
import { Coordinates } from "../types/coordinates";

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
  locations: Array<{ equip_y: number; equip_x: number }>
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

export default function TabOneScreen() {
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

  const handleUserMarkerPress = (user: User) => {
    if (!currentLocation) return;

    const userCoords = arrayToCoordinates(user.current_location);
    setSelectedUserCoords(userCoords);

    const midPoint = {
      latitude: (currentLocation.latitude + userCoords.latitude) / 2,
      longitude: (currentLocation.longitude + userCoords.longitude) / 2,
    };

    const nearestGym = data?.results ? findNearestLocation(midPoint, data.results) : null;
    setNearestGym(nearestGym);
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
                      image={require("../../assets/images/icon_users_small.png")}
                    />
                    </>
                ))}
              {data?.results &&
                data.results.map((location, index) => (
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
                  strokeColor="blue"
                  strokeWidth={2}
                />
              )}
              {nearestGym && selectedUserCoords && (
                <Polyline
                  coordinates={[
                    { latitude: selectedUserCoords.latitude, longitude: selectedUserCoords.longitude },
                    { latitude: nearestGym.equip_y, longitude: nearestGym.equip_x },
                  ]}
                  strokeColor="green"
                  strokeWidth={2}
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
