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
import MapView, { Marker } from "react-native-maps";
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

export default function TabOneScreen() {
  const { currentLocation, locationStatus, cardinalPoints } = useLocation();
  const { data, isLoading, isSuccess } = useGetLocationsQuery(cardinalPoints!, {
    skip: !cardinalPoints,
  });
  const { users, loading, error } = useUsers() as {
    users: User[];
    loading: boolean;
    error: any;
  };

  // ---------------------------------------------------------------------------

  const [fadeAnim] = useState(new Animated.Value(0));
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
                usersInArea.map((user, index) => {
                  return (
                    <>
                      <Marker
                        key={`user-${index}`}
                        coordinate={arrayToCoordinates(user.current_location)}
                        pinColor="green"
                        title={user.username}
                        description={`Classement: ${user.ranking}, Age: ${user.age}`}
                        image={require("../../assets/images/icon_users_small.png")}
                      />
                    </>
                  );
                })}
              {data?.results &&
                data.results.length > 0 &&
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
                    stopPropagation={true}
                  />
                ))}
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
      {/* <LocationStatus locationStatus={locationStatus} currentLocation={currentLocation} /> */}

      <Animated.View
        style={[
          styles.notificationContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.notificationText}>
          🤩
          {usersInArea?.length || 0} joueur
          {usersInArea?.length !== 1 ? "s" : ""} trouvé
          {usersInArea?.length !== 1 ? "s" : ""} dans la zone 🤩
        </Text>
      </Animated.View>

      {renderMap()}

      {/* {isSuccess && data && <LocationResults isSuccess={isSuccess} isLoading={isLoading} data={data} />} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  mapContainer: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  notificationContainer: {
    position: "absolute",
    top: 50,
    zIndex: 999,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    alignSelf: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
