import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { LoadingState } from "../../types/loadingState";

interface LoadingManagerProps extends LoadingState {
  children: React.ReactNode;
}

const LoadingManager: React.FC<LoadingManagerProps> = ({ isLoading, status, error, children }) => {
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (isLoading) {
    const loadingMessage = !status.location
      ? "Chargement de la localisation..."
      : !status.cardinalPoints
      ? "Calcul de la zone..."
      : !status.users
      ? "Chargement des utilisateurs..."
      : !status.equipments
      ? "Chargement des équipements..."
      : !status.filteredEquipments
      ? "Filtrage des équipements..."
      : "Chargement...";

    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default LoadingManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});
