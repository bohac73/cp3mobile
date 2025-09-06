import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  RefreshControl,
  Image,
} from "react-native";

const API = "https://www.demonslayer-api.com/api/v1/characters?limit=45";

export default function ListScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const normalize = (arr) =>
    arr.map((c, idx) => ({
      id: String(c.id ?? idx),
      name: c.name ?? "Sem nome",
      age: c.age ?? "-",
      gender: c.gender ?? "-",
      race: c.race ?? "-",
      quote: c.quote ?? "",
      image:
        c.image ??
        c.img ??
        (Array.isArray(c.images)
          ? c.images[0]?.url ?? c.images[0]
          : null),
    }));

  const load = useCallback(async (signal) => {
    try {
      setError(null);
      const res = await fetch(API, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw = Array.isArray(json) ? json : json.content ?? [];
      setData(normalize(raw));
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    const controller = new AbortController();
    load(controller.signal);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro: {error}</Text>
        <Pressable
          onPress={() => {
            setLoading(true);
            const c = new AbortController();
            load(c.signal);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate("Detalhe", { id: item.id })}
    >
      {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.meta}>
          {item.age} anos • {item.gender} • {item.race}
        </Text>
        {item.quote ? (
          <Text style={styles.quote} numberOfLines={2}>
            “{item.quote}”
          </Text>
        ) : null}
        <Text style={styles.link}>Ver detalhes →</Text>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    flexDirection: "row",
  },
  image: {
    width: 100,
    height: 120,
    resizeMode: "cover",
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6, color: "#222" },
  meta: { fontSize: 14, color: "#555", marginBottom: 6 },
  quote: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 8,
  },
  link: { fontWeight: "600", color: "#0077cc" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fafafa",
  },
  loadingText: { marginTop: 8, fontSize: 16, color: "#555" },
  errorText: { marginBottom: 12, fontSize: 16, color: "red" },
  button: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
