import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, ActivityIndicator, Dimensions, Animated, FlatList, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import { useGetLocationsQuery } from "../apis/LocationApi";
import { useLocation } from "../hooks/useLocation";
import { useUsers } from "@/hooks/useUsers";
import MapView, { Marker, Polyline } from "react-native-maps";
import { User } from "../types/user";
import { Coordinates } from "../types/coordinates";
import { UserCardCarousel } from "@/components/index/UserCardCarrousel";

type LocationArray = [number, number];

const arrayToCoordinates = (locationArray: unknown): Coordinates => {
  const [lat, lng] = locationArray as LocationArray;
  return {
    latitude: lat,
    longitude: lng,
  };
};

const findNearestLocation = (midPoint: Coordinates, locations: Array<{ equip_y: number; equip_x: number }>) => {
  if (!locations || locations.length === 0) return null;

  return locations.reduce((closest, location) => {
    const distanceToMidPoint = Math.sqrt(
      Math.pow(midPoint.latitude - location.equip_y, 2) + Math.pow(midPoint.longitude - location.equip_x, 2)
    );
    const distanceToClosest = Math.sqrt(
      Math.pow(midPoint.latitude - closest.equip_y, 2) + Math.pow(midPoint.longitude - closest.equip_x, 2)
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
  const [activeUserIndex, setActiveUserIndex] = useState(0);
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
            <View style={styles.userCardCarousel}>
              <UserCardCarousel data={usersInArea} onActiveIndexChange={setActiveUserIndex} />
            </View>
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

  return <View style={styles.container}>{renderMap()}</View>;
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
});
