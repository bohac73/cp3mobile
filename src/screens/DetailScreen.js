import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const API = 'https://www.demonslayer-api.com/api/v1/characters';

export default function DetailScreen({ route }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API}?id=${id}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const raw = Array.isArray(json) ? json : json.content ?? [];
        const first = raw[0];
        setItem(first ? normalize(first) : null);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message);
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
        <Text>Carregando…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Erro: {error}</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Item não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.id}>ID: {item.id}</Text>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.body}>{item.age}</Text>


    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  container: { flex: 1, padding: 16 },
  id: { color: '#888', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 22 },
  meta: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  metaText: { color: '#666' },
});
