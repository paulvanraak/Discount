import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import DealCard from '../components/DealCard';
import { C } from '../data/theme';

export default function FavoritesScreen({ allDeals, favorites, onDealPress, onFavoriteToggle, t }) {
  const favDeals = allDeals.filter(d => favorites.has(d.id));

  if (favDeals.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🤍</Text>
        <Text style={styles.emptyTitle}>Nog geen favorieten</Text>
        <Text style={styles.emptySub}>Tik op het hartje op een deal om hem hier op te slaan.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favDeals}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <DealCard
          deal={item}
          onPress={() => onDealPress(item)}
          onFavorite={() => onFavoriteToggle(item.id)}
          isFavorited={favorites.has(item.id)}
          t={t}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: { fontSize: 56 },
  emptyTitle: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: C.dark,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 14,
    color: C.grey,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: { padding: 8, paddingBottom: 100 },
});
