import React, { useState } from "react";
import { Text, View } from "../Themed";
import { FIREBASE_AUTH } from "@/config/firebase";
import { ActivityIndicator, KeyboardAvoidingView, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button, Input } from "@rneui/themed";
import { router } from "expo-router";
import { FirebaseError } from "firebase/app";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const auth = FIREBASE_AUTH;

  const signUp = async () => {
    // Réinitialiser le message d'erreur
    setErrorMessage("");
    setLoading(true);

    // Validation avant l'envoi
    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirection ou action après inscription réussie
      router.push("/(authentication)/login");
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            setErrorMessage("Cette adresse email est déjà utilisée");
            break;
          case "auth/invalid-email":
            setErrorMessage("Format d'email invalide");
            break;
          case "auth/weak-password":
            setErrorMessage("Le mot de passe est trop faible");
            break;
          default:
            setErrorMessage("Une erreur est survenue lors de l'inscription");
        }
      } else {
        setErrorMessage("Une erreur inattendue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏸</Text>
      <Text style={styles.title}>Inscription</Text>
      <KeyboardAvoidingView behavior="padding">
        <Input placeholder="Email" autoCapitalize="none" onChangeText={(text) => setEmail(text)} value={email} style={styles.input} />
        <Input
          placeholder="Mot de passe"
          autoCapitalize="none"
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
          value={password}
          style={styles.input}
        />
        <Input
          placeholder="Confirmer le mot de passe"
          autoCapitalize="none"
          secureTextEntry
          onChangeText={(text) => setConfirmPassword(text)}
          value={confirmPassword}
          style={styles.input}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Button
              containerStyle={{
                marginHorizontal: 10,
                borderWidth: 0,
                borderRadius: 5,
              }}
              title="Créer un compte"
              onPress={signUp}
            />
            <Text style={styles.link} onPress={() => router.push("/(authentication)/login")}>
              Vous avez déjà un compte ? Connectez-vous
            </Text>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logo: {
    fontSize: 50,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 50,
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    color: "blue",
    marginTop: 20,
    textDecorationLine: "underline",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    color: "#2f95dc",
  }
});
