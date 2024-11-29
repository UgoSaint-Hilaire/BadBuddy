import React from "react";
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { ButtonGroup } from "react-native-elements";

interface FiltersProps {
  isVisible: boolean;
  onClose: () => void;
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  rankFilter: string[];
  setRankFilter: (ranks: string[]) => void;
}

export const ranks = [
  "Tous",
  "N1",
  "N2",
  "N3",
  "R4",
  "R5",
  "R6",
  "D7",
  "D8",
  "D9",
  "P10",
  "P11",
  "P12",
  "NC",
];

export const FiltersModal: React.FC<FiltersProps> = ({
  isVisible,
  onClose,
  genderFilter,
  setGenderFilter,
  rankFilter,
  setRankFilter,
}) => {
  const toggleRank = (selectedRank: string) => {
    setRankFilter(
      rankFilter.includes(selectedRank)
        ? rankFilter.filter((rank) => rank !== selectedRank)
        : [...rankFilter, selectedRank]
    );
  };

  const resetFilters = () => {
    setGenderFilter("");
    setRankFilter([]);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView>
        <View style={styles.modalContainer}>
          <Text style={styles.filterLabel}>Sexe:</Text>
          <ButtonGroup
            buttons={["Tous", "Homme", "Femme"]}
            selectedIndex={
              genderFilter === ""
                ? 0
                : genderFilter === "Homme"
                ? 1
                : genderFilter === "Femme"
                ? 2
                : null
            }
            onPress={(index) =>
              setGenderFilter(
                index === 0 ? "" : index === 1 ? "Homme" : "Femme"
              )
            }
            containerStyle={styles.buttonGroup}
            selectedButtonStyle={styles.selectedButton}
          />

          <Text style={styles.filterLabel}>Classement:</Text>
          <ButtonGroup
            buttons={ranks}
            selectedIndexes={rankFilter.map((rank) => ranks.indexOf(rank))}
            onPress={(index) => {
              const selectedRank = ranks[index];
              if (selectedRank === "Tous") {
                setRankFilter([]); // Réinitialise à "Tous"
              } else {
                toggleRank(selectedRank);
              }
            }}
            containerStyle={styles.buttonGroup}
            selectedButtonStyle={styles.selectedButton}
          />

          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>
              Réinitialiser les filtres
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  buttonGroup: {
    marginVertical: 10,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: "#2196F3",
  },
  resetButton: {
    width: "80%",
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
    width: "80%",
    padding: 15,
    backgroundColor: "red",
    marginVertical: 5,
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
