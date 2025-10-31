import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// функция, которая создаст документ, если его нет
const ensureUserDoc = async (user) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: "",
      bio: "",
      createdAt: serverTimestamp(),
    });
  }
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // гарантируем что документ есть
      await ensureUserDoc(user);

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        ref,
        {
          displayName,
          bio,
          updatedAt: serverTimestamp(),
        },
        { merge: true } // если нет — создаст, если есть — обновит
      );
      setMsg("✅ Профиль обновлен");
    } catch (e) {
      setMsg("Ошибка: " + e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Редактирование профиля</Text>

      {/* Email и UID пользователя */}
      <Text style={{ color: "#555", marginBottom: 5 }}>{auth.currentUser?.email}</Text>
      <Text style={{ color: "#999", marginBottom: 15 }}>UID: {auth.currentUser?.uid}</Text>

      <TextInput
        style={styles.input}
        placeholder="Имя"
        value={displayName}
        onChangeText={setDisplayName}
      />

      <TextInput
        style={styles.input}
        placeholder="О себе"
        value={bio}
        onChangeText={setBio}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.btnText}>Сохранить</Text>
      </TouchableOpacity>

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: { backgroundColor: "#111827", padding: 12, borderRadius: 8 },
  btnText: { color: "white", fontWeight: "bold", textAlign: "center" },
  msg: { marginTop: 10, textAlign: "center", color: "green" },
});
