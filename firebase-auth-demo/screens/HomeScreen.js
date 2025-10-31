import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [edit, setEdit] = useState(null);
  const [comments, setComments] = useState({});
  const [cText, setCText] = useState({});

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(arr);

      arr.forEach((p) =>
        onSnapshot(collection(db, "posts", p.id, "comments"), (csnap) =>
          setComments((x) => ({
            ...x,
            [p.id]: csnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          }))
        )
      );
    });
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return;
    if (edit) {
      await updateDoc(doc(db, "posts", edit.id), { text, updatedAt: serverTimestamp() });
      setEdit(null);
    } else {
      await addDoc(collection(db, "posts"), {
        text,
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });
    }
    setText("");
  };

  const handleComment = async (pid) => {
    const t = cText[pid];
    if (!t?.trim()) return;
    await addDoc(collection(db, "posts", pid, "comments"), {
      text: t,
      userId: auth.currentUser.uid,
      email: auth.currentUser.email,
      createdAt: serverTimestamp(),
    });
    setCText((p) => ({ ...p, [pid]: "" }));
  };

  const delPost = async (id) => await deleteDoc(doc(db, "posts", id));
  const delComment = async (pid, c, owner) => {
    if (c.userId === auth.currentUser.uid || owner === auth.currentUser.uid)
      await deleteDoc(doc(db, "posts", pid, "comments", c.id));
  };

  return (
    <View style={s.container}>
      <View style={s.row}>
        <TextInput
          style={s.input}
          placeholder="Введите пост..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity onPress={handlePost}>
          <Text style={s.btn}>{edit ? "✔️" : "➕"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={s.post}>
            <Text style={s.text}>{item.text}</Text>
            <Text style={s.author}>{item.email}</Text>

            {item.userId === auth.currentUser.uid && (
              <View style={s.row}>
                <TouchableOpacity onPress={() => (setEdit(item), setText(item.text))}>
                  <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => delPost(item.id)}>
                  <Text>❌</Text>
                </TouchableOpacity>
              </View>
            )}

            {(comments[item.id] || []).map((c) => (
              <View key={c.id} style={s.comment}>
                <Text>{c.text}</Text>
                <Text style={s.author}>{c.email}</Text>
                {(c.userId === auth.currentUser.uid || item.userId === auth.currentUser.uid) && (
                  <TouchableOpacity onPress={() => delComment(item.id, c, item.userId)}>
                    <Text>❌</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={s.row}>
              <TextInput
                style={s.input}
                placeholder="Комментарий..."
                value={cText[item.id] || ""}
                onChangeText={(t) => setCText({ ...cText, [item.id]: t })}
              />
              <TouchableOpacity onPress={() => handleComment(item.id)}>
                <Text style={s.btn}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 6 },
  btn: { marginLeft: 6, fontSize: 18 },
  post: { padding: 10, borderWidth: 1, borderRadius: 8, marginVertical: 8 },
  text: { fontSize: 16 },
  author: { color: "#777", fontSize: 12 },
  comment: { marginLeft: 15, marginTop: 5 },
});

