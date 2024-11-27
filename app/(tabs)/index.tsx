import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { useGetLocationsQuery } from "../apis/LocationApi";
import { LocationStatus } from "../../components/LocationStatus";
import { LocationResults } from "../../components/LocationResults";
import { useLocation } from "../hooks/useLocation";

export default function TabOneScreen() {
  const { currentLocation, locationStatus, cardinalPoints } = useLocation();

  const { data, isLoading, isSuccess } = useGetLocationsQuery(cardinalPoints!, {
    skip: !cardinalPoints,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>

      <LocationStatus
        locationStatus={locationStatus}
        currentLocation={currentLocation}
      />

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      {isSuccess && data && (
        <LocationResults
          isSuccess={isSuccess}
          isLoading={isLoading}
          data={data}
        />
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
