import { StyleSheet, Alert } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";

import { useGetAllLocationsQuery } from "../apis/LocationApi";

import { UserInformations } from "../types/userInformations";
import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function TabOneScreen() {
  const [displayCurrentLocation, setDisplayCurrentLocation] =
    useState<UserInformations | null>(null);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();
  }, []);

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
        const { latitude: lat, longitude: lon } = coords;
        setDisplayCurrentLocation((prevState) => ({
          ...prevState,
          lat,
          lon,
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>

      {/* Affichage conditionnel selon l'état de la requête */}
      {locationStatus === "idle" && <Text>En attente de localisation...</Text>}

      {locationStatus === "loading" && (
        <View>
          <Text>Récupération de votre position en cours...</Text>
          {/* Vous pourriez ajouter un composant ActivityIndicator ici */}
        </View>
      )}

      {locationStatus === "success" && displayCurrentLocation && (
        <View>
          <Text>Position trouvée !</Text>
          <Text>Latitude: {displayCurrentLocation.lat}</Text>
          <Text>Longitude: {displayCurrentLocation.lon}</Text>
        </View>
      )}

      {locationStatus === "error" && (
        <Text>Impossible de récupérer votre position</Text>
      )}

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
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
