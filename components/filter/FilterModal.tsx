import React from "react";
import { Modal, TouchableOpacity, Text, View } from "react-native";
import { ButtonGroup } from "react-native-elements";
import { StyleSheet } from "react-native";

type FilterModalProps = {
  isVisible: boolean;
  onClose: () => void;
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  rankFilter: string[];
  toggleRank: (rank: string) => void;
  resetFilters: () => void;
};

export const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  genderFilter,
  setGenderFilter,
  rankFilter,
  toggleRank,
  resetFilters,
}) => {
  const ranks = ["Tous", "N1", "N2", "N3", "R4", "R5", "R6", "D7", "D8", "D9", "P10", "P11", "P12", "NC"];

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Filtrer les utilisateurs</Text>
        {/* Sexe */}
        <Text style={styles.filterLabel}>Sexe:</Text>
        <ButtonGroup
          buttons={["Tous", "Homme", "Femme"]}
          selectedIndex={genderFilter === "" ? 0 : genderFilter === "Homme" ? 1 : 2}
          onPress={(index) => setGenderFilter(index === 0 ? "" : index === 1 ? "Homme" : "Femme")}
          containerStyle={styles.buttonGroup}
          selectedButtonStyle={styles.selectedButton}
        />

        {/* Classement */}
        <Text style={styles.filterLabel}>Classement:</Text>
        <ButtonGroup
          buttons={ranks}
          selectedIndexes={rankFilter.map((rank) => ranks.indexOf(rank))}
          onPress={(index) => toggleRank(ranks[index])}
          containerStyle={styles.buttonGroup}
          selectedButtonStyle={styles.selectedButton}
        />

        {/* Réinitialiser */}
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
        </TouchableOpacity>

        {/* Bouton Fermer */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#fff",
  },
  buttonGroup: {
    marginVertical: 10,
  },
  selectedButton: {
    backgroundColor: "#2196F3",
  },
  resetButton: {
    padding: 15,
    backgroundColor: "#FFA500",
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    padding: 15,
    backgroundColor: "red",
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
