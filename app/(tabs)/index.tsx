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
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log(status);
    if (status !== "granted") {
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
    }

    //get current position
    const { coords } = await Location.getCurrentPositionAsync();
    if (coords) {
      const { latitude: lat, longitude: lon } = coords;
      setDisplayCurrentLocation({ lat, lon });

      console.log(displayCurrentLocation);

      // normalement on on reverse la lat et long pour l'adresse
      // mais ça fonctionne pas
      // let res = await Location.reverseGeocodeAsync({
      //   lat,
      //   lon,
      // });
      // for (let item of res) {
      //   let address = `${item.name} ${item.city} ${item.postalCode}`;
      //   setDisplayCurrentLocation(address);
      // }
    }
  };

  const [userRadius, setUserRadius] = useState(10);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      {/* {isLoading && <p style={{ color: "red" }}>Chargement...</p>}
      {isSuccess && (
        <View>
          <Text style={{ fontWeight: "500", textAlign: "center" }}>
            Nombre de résultats : {data.total_count}
          </Text>
          {data.results.map((item, index) => (
            <Text style={{ textAlign: "center" }} key={index}>
              {item.equip_nom}
            </Text>
          ))}
        </View>
      )} */}
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
