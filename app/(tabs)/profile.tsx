import React, { useState, useEffect } from "react";
import { Text, View } from "@/components/Themed";
import { Button, StyleSheet } from "react-native";
import { FIREBASE_AUTH } from "@/config/firebase";

export default function Profile() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bonjour {userEmail?.split("@")[0]} !</Text>
      <Button onPress={() => FIREBASE_AUTH.signOut()} title="Se déconnecter" />
      <Text style={styles.email}>{userEmail}</Text>
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
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    marginTop: 20,
  },
});
