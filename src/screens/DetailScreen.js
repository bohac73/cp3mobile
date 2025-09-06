import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

const API = "https://www.demonslayer-api.com/api/v1/characters";

export default function DetailScreen({ route }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API}?id=${id}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const raw = Array.isArray(json) ? json : json.content ?? [];
        const first = raw[0];
        setItem(first ? normalize(first) : null);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  const normalize = (c) => ({
    id: String(c.id),
    name: c.name ?? "Sem nome",
    age: c.age ?? "-",
    gender: c.gender ?? "-",
    race: c.race ?? "-",
    description: c.description ?? "",
    quote: c.quote ?? "",
    image:
      c.image ??
      c.img ??
      (Array.isArray(c.images) ? c.images[0]?.url ?? c.images[0] : null),
  });

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
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Item não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item.image && <Image source={{ uri: item.image }} style={styles.image} />}

      <Text style={styles.id}>ID: {item.id}</Text>
      <Text style={styles.title}>{item.name}</Text>

      <View style={styles.metaBox}>
        <Text style={styles.metaText}>Idade: {item.age}</Text>
        <Text style={styles.metaText}>Raça: {item.race}</Text>
        <Text style={styles.metaText}>Gênero: {item.gender}</Text>
        </View>

      <Text style={styles.sectionTitle}>Descrição</Text>
      <Text style={styles.body}>{item.description}</Text>

      {item.quote ? (
        <>
          <Text style={styles.sectionTitle}>Frase</Text>
          <Text style={styles.quote}>“{item.quote}”</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fafafa",
  },
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
    borderRadius: 16,
    marginBottom: 16,
  },
  id: {
    color: "#888",
    marginBottom: 4,
    fontSize: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  metaBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 16,
    color: "#444",
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
    color: "#333",
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: "#444",
  },
  quote: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#f1f1f1",
    backgroundColor: "#000000",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
});
