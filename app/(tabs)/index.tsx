import { StyleSheet } from "react-native";

import RegisterScreen from "@/components/auth/RegisterScreen";
import { Text, View } from "@/components/Themed";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home screen</Text>
      <RegisterScreen />
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
});
