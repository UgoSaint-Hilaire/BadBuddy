import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { Coordinates } from "../types/locationResponse";
import { computeDestinationPoint } from "geolib";
import { CardinalPoints } from "../types/cardinalPoints";

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    null
  );
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [cardinalPoints, setCardinalPoints] = useState<CardinalPoints | null>(
    null
  );

  const checkIfLocationEnabled = async () => {
    let enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      Alert.alert("Aucune localisation", "Acceptez la localisation", [
        { text: "Cancel", style: "cancel" },
        { text: "OK" },
      ]);
    } else {
      setLocationServicesEnabled(enabled);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationStatus("loading");
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationStatus("error");
        Alert.alert(
          "Permission denied",
          "Allow the app to use the location services",
          [{ text: "Cancel", style: "cancel" }, { text: "OK" }]
        );
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync();

      if (coords) {
        const { latitude, longitude } = coords;
        setCurrentLocation({ latitude, longitude });
        setLocationStatus("success");
      }
    } catch {
      setLocationStatus("error");
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

  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();

    const intervalId = setInterval(() => {
      checkIfLocationEnabled();
      getCurrentLocation();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (currentLocation && locationStatus === "success") {
      const distance = 10000;
      const points = computeCardinalsPoints(currentLocation, distance);
      setCardinalPoints(points);
    }
  }, [currentLocation, locationStatus]);

  return {
    currentLocation,
    locationStatus,
    locationServicesEnabled,
    cardinalPoints,
  };
};
