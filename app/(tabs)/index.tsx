import React from "react";
import { StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import { useGetLocationsQuery } from "../../apis/LocationApi";
import { useLocation } from "../../hooks/useLocation";
import { useUsers } from "@/hooks/useUsers";
import MapView, { Marker } from "react-native-maps";

export default function HomeScreen() {
  const { currentLocation, locationStatus, cardinalPoints } = useLocation();

  const { data, isLoading, isSuccess } = useGetLocationsQuery(cardinalPoints!, {
    skip: !cardinalPoints,
  });

  const { users, loading, error } = useUsers();
  // console.log(users);

  const renderMap = () => {
    // console.log(locationStatus);

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
                latitudeDelta: 0.3,
                longitudeDelta: 0.2,
              }}
              showsScale={true}
              showsCompass={true}
              zoomTapEnabled={false}
              showsUserLocation>
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
                  />
                ))}
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
