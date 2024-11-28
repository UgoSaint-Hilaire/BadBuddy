import React from "react";
import { StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import { useGetLocationsQuery } from "../apis/LocationApi";
import { useLocation } from "../hooks/useLocation";
import { useUsers } from "@/hooks/useUsers";
import MapView, { Marker } from "react-native-maps";
import { User } from "../types/user";
import { Coordinates } from "../types/coordinates";

type LocationArray = [number, number];

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
  console.log("Users data:", users);
  console.log("First user location:", users?.[0]?.current_location);

  const arrayToCoordinates = (locationArray: unknown): Coordinates => {
    const [lat, lng] = locationArray as LocationArray;
    return {
      latitude: lat,
      longitude: lng,
    };
  };

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
              showsUserLocation>
              {users &&
                users.length > 0 &&
                users.map((user, index) => {
                  return (
                    <Marker
                      key={`user-${index}`}
                      coordinate={arrayToCoordinates(user.current_location)}
                      pinColor="green"
                      title={user.username}
                      description={`Classement: ${user.ranking}, Age: ${user.age}`}
                      image={require("../../assets/images/icon_users_small.png")}
                    />
                  );
                })}
              {data?.results &&
                data.results.length > 0 &&
                (() => {
                  const seenNames = new Set<string>();
                  const filteredResults = data.results.filter((location) => {
                    if (seenNames.has(location.inst_nom)) {
                      return false;
                    }
                    seenNames.add(location.inst_nom);
                    return true;
                  });

                  return filteredResults.map((location, index) => (
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
                  ));
                })()}
            </MapView>
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
});
