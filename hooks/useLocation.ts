import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { Coordinates } from "../types/locationAPIResponse";
import { computeDestinationPoint } from "geolib";
import { CardinalPoints } from "../types/cardinalPoints";

export const computeCardinalsPoints = (start: Coordinates, distance: number): CardinalPoints => {
  return {
    north: computeDestinationPoint(start, distance, 0),
    east: computeDestinationPoint(start, distance, 90),
    south: computeDestinationPoint(start, distance, 180),
    west: computeDestinationPoint(start, distance, 270),
  };
};

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [cardinalPoints, setCardinalPoints] = useState<CardinalPoints | null>(null);

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
        Alert.alert("Pas de permission", "Permettez à l'app de vous localiser", [
          { text: "Cancel", style: "cancel" },
          { text: "OK" },
        ]);
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

  useEffect(() => {
    // Ajouter plus tard un check régulier pour voir si le user s'est déplacé
    checkIfLocationEnabled();
    getCurrentLocation();
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
