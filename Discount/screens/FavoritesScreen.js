import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../components/Icon';
import DealCard from '../components/DealCard';
import { C, R } from '../data/theme';

export default function FavoritesScreen({ allDeals, favorites, onDealPress, onFavoriteToggle, onBrowse, t }) {
  const favDeals = allDeals.filter(d => favorites.has(d.id));

  if (favDeals.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconWrap}>
          <Icon name="favorite-border" size={40} color={C.red} />
        </View>
        <Text style={styles.emptyTitle}>Nog geen favorieten</Text>
        <Text style={styles.emptySub}>
          Tik op het hartje bij een deal om hem hier op te slaan. Zo mis je nooit meer een goede aanbieding.
        </Text>
        {onBrowse && (
          <TouchableOpacity style={styles.browseBtn} onPress={onBrowse} activeOpacity={0.85}>
            <Icon name="local-offer" size={16} color={C.white} style={{ marginRight: 6 }} />
            <Text style={styles.browseTxt}>Bekijk deals</Text>
          </TouchableOpacity>
        )}
        <View style={styles.tipsRow}>
          <TipChip icon="bolt" text="Flash deals" />
          <TipChip icon="stars" text="Top kortingen" />
          <TipChip icon="card-giftcard" text="Verdien punten" />
        </View>
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
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Icon name="favorite" size={14} color={C.red} />
          <Text style={styles.listHeaderTxt}>{favDeals.length} opgeslagen</Text>
        </View>
      }
    />
  );
}

function TipChip({ icon, text }) {
  return (
    <View style={styles.tip}>
      <Icon name={icon} size={13} color={C.grey} />
      <Text style={styles.tipTxt}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 36,
    gap: 14,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.redTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 20,
    fontWeight: '800',
    color: C.dark,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 14,
    color: C.grey,
    textAlign: 'center',
    lineHeight: 21,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.red,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: R.lg,
    marginTop: 4,
  },
  browseTxt: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    color: C.white,
    fontWeight: '700',
    fontSize: 15,
  },
  tipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: R.full,
    backgroundColor: C.lightGrey,
  },
  tipTxt: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: '600',
    color: C.grey,
  },
  list: { padding: 8, paddingBottom: 100 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 4,
  },
  listHeaderTxt: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 12,
    fontWeight: '700',
    color: C.red,
  },
});
