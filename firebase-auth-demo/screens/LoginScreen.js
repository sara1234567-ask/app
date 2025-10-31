import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // регистрация
  const handleSignUp = async () => {
    setError(null);

    if (!email.includes("@")) {
      setError("Введите корректный email (например, user@example.com)");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // создаём профиль в Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        email,
        displayName: "",
        bio: "",
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      setError(e.message);
    }
  };

  // вход
  const handleSignIn = async () => {
    setError(null);

    if (!email.includes("@")) {
      setError("Введите корректный email");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход / Регистрация</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.btnText}>Войти</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonOutline} onPress={handleSignUp}>
        <Text style={styles.btnOutlineText}>Зарегистрироваться</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: { backgroundColor: "#111827", padding: 12, borderRadius: 8, marginBottom: 10 },
  btnText: { color: "white", fontWeight: "bold", textAlign: "center" },
  buttonOutline: {
    borderWidth: 1,
    borderColor: "#111827",
    padding: 12,
    borderRadius: 8,
  },
  btnOutlineText: { color: "#111827", fontWeight: "bold", textAlign: "center" },
  error: { color: "red", marginTop: 10, textAlign: "center" },
});
