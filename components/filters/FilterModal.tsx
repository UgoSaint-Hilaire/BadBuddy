import React from "react";
import { View, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import { ButtonGroup } from "react-native-elements";

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  genderFilter: string;
  setGenderFilter: (filter: string) => void;
  rankFilter: string[];
  setRankFilter: React.Dispatch<React.SetStateAction<string[]>>;
}

const ranks = ["Tous", "N1", "N2", "N3", "R4", "R5", "R6", "D7", "D8", "D9", "P10", "P11", "P12", "NC"];

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  genderFilter,
  setGenderFilter,
  rankFilter,
  setRankFilter,
}) => {
  const toggleRank = (selectedRank: string) => {
    setRankFilter((prev: string[]) =>
      prev.includes(selectedRank) ? prev.filter((rank: string) => rank !== selectedRank) : [...prev, selectedRank]
    );
  };
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Filtrer les utilisateurs</Text>

        <Text style={styles.filterLabel}>Sexe:</Text>
        <ButtonGroup
          buttons={["Tous", "Homme", "Femme"]}
          selectedIndex={genderFilter === "" ? 0 : genderFilter === "Homme" ? 1 : 2}
          onPress={(index) => setGenderFilter(index === 0 ? "" : index === 1 ? "Homme" : "Femme")}
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
              setRankFilter([]);
            } else {
              toggleRank(selectedRank);
            }
          }}
          containerStyle={styles.buttonGroup}
          selectedButtonStyle={styles.selectedButton}
        />

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setGenderFilter("");
            setRankFilter([]);
          }}
        >
          <Text style={styles.resetButtonText}>Réinitialiser les filtres</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
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

export default FilterModal;
