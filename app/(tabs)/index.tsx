import { StyleSheet, Alert, FlatList, ScrollView } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";

import { useGetLocationsQuery } from "../apis/LocationApi";

import { UserInformations } from "../types/userInformations";
import { Coordinates } from "../types/locationResponse";
import { CardinalPoints } from "../types/cardinalPoints";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { computeDestinationPoint } from "geolib";

export default function TabOneScreen() {
  const [displayCurrentLocation, setDisplayCurrentLocation] =
    useState<Coordinates | null>(null);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [searchParams, setSearchParams] = useState<CardinalPoints | null>(null);

  const { data, isLoading, isSuccess, error } = useGetLocationsQuery(
    searchParams!, // On utilise l'opérateur ! car on sait que l'appel ne se fera que si searchParams existe
    {
      skip: !searchParams,
    }
  );

  // Execution au montage du composant
  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();

    const intervalId = setInterval(() => {
      checkIfLocationEnabled();
      getCurrentLocation();
    }, 60000); // 60000 ms = 1 min

    return () => clearInterval(intervalId);
  }, []);

  // Calcul des points cardinaux après les appels des fonctions toutes les minutes
  useEffect(() => {
    if (displayCurrentLocation && locationStatus === "success") {
      const distance = 10000;
      const cardinalPoints = computeCardinalsPoints(
        displayCurrentLocation,
        distance
      );
      setSearchParams(cardinalPoints);
      console.log(cardinalPoints);
    }
  }, [displayCurrentLocation, locationStatus]);

  // Traite les résultats de l'API getLocations
  useEffect(() => {
    if (isSuccess) {
      console.log("Données reçues:", data);
    }
  }, [isSuccess, data]);

  const checkIfLocationEnabled = async () => {
    let enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert("Aucune localisation", "Acceptez la localisation", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    } else {
      setLocationServicesEnabled(enabled);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationStatus("loading");
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status);
      if (status !== "granted") {
        setLocationStatus("error");
        Alert.alert(
          "Permission denied",
          "Allow the app to use the location services",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            { text: "OK", onPress: () => console.log("OK Pressed") },
          ]
        );
        return;
      }

      //get current position
      const { coords } = await Location.getCurrentPositionAsync();

      if (coords) {
        const { latitude, longitude } = coords;
        setDisplayCurrentLocation((prevState) => ({
          ...prevState,
          latitude,
          longitude,
        }));

        setLocationStatus("success");
      }
    } catch {
      setLocationStatus("error");
      console.error(
        "Erreur lors de la récupération de la position:",
        locationStatus
      );
    }
  };

  const computeCardinalsPoints = (
    start: Coordinates,
    distance: number
  ): CardinalPoints => {
    return {
      north: computeDestinationPoint(start, distance, 0),
      east: computeDestinationPoint(start, distance, 90),
      south: computeDestinationPoint(start, distance, 180),
      west: computeDestinationPoint(start, distance, 270),
    };
  };

  return (
    // Faire quelque chose avec cardinalPoints...

    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View>
        {locationStatus === "idle" && (
          <Text>En attente de localisation...</Text>
        )}

        {locationStatus === "loading" && (
          <View>
            <Text>Récupération de la position en cours...</Text>
          </View>
        )}

        {locationStatus === "success" && displayCurrentLocation && (
          <View>
            <Text>Position trouvée</Text>
            <Text>Latitude: {displayCurrentLocation.latitude}</Text>
            <Text>Longitude: {displayCurrentLocation.longitude}</Text>
          </View>
        )}

        {locationStatus === "error" && (
          <Text>Impossible de récupérer la position</Text>
        )}
      </View>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      {isSuccess && (
        <View>
          <Text style={{ fontWeight: "500", textAlign: "center" }}>
            Nombre de résultats : {data.total_count}
          </Text>
          <FlatList
            style={{}}
            data={data.results}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={{ textAlign: "center" }}>
                {item.inst_nom}
                {"\n"}
                {item.inst_adresse}
              </Text>
            )}
            contentContainerStyle={{ paddingVertical: 10 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            refreshing={isLoading}
            onRefresh={() => {}}
          />
        </View>
      )}
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
});
