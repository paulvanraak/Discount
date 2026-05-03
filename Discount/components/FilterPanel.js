import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView,
} from 'react-native';
import { C, R, S } from '../data/theme';

const CATS = [
  { key: 'all', label: 'Alles' },
  { key: 'tech', label: '💻 Tech' },
  { key: 'kitchen', label: '🍳 Keuken' },
  { key: 'home', label: '🏠 Huishouden' },
];

const DISCOUNTS = ['40%+', '50%+', '60%+', '70%+'];

export default function FilterPanel({
  visible, onClose,
  activeCat, setActiveCat,
  activeDisc, setActiveDisc,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  onApply,
}) {
  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleReset = () => {
    setActiveCat('all');
    setActiveDisc(null);
    setMinPrice('');
    setMaxPrice('');
    onApply();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category */}
            <Text style={styles.sectionLabel}>CATEGORIE</Text>
            <View style={styles.chipRow}>
              {CATS.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.chip, activeCat === key && styles.chipOn]}
                  onPress={() => setActiveCat(key)}
                >
                  <Text style={[styles.chipTxt, activeCat === key && styles.chipTxtOn]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Discount */}
            <Text style={styles.sectionLabel}>MINIMALE KORTING</Text>
            <View style={styles.chipRow}>
              {DISCOUNTS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, activeDisc === d && styles.chipOn]}
                  onPress={() => setActiveDisc(activeDisc === d ? null : d)}
                >
                  <Text style={[styles.chipTxt, activeDisc === d && styles.chipTxtOn]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price */}
            <Text style={styles.sectionLabel}>PRIJSRANGE</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInput}>
                <Text style={styles.pricePrefix}>€</Text>
                <TextInput
                  style={styles.priceField}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="Min"
                  placeholderTextColor={C.grey}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.priceDash}>—</Text>
              <View style={styles.priceInput}>
                <Text style={styles.pricePrefix}>€</Text>
                <TextInput
                  style={styles.priceField}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="Max"
                  placeholderTextColor={C.grey}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetTxt}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyTxt}>Toepassen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    width: 300,
    backgroundColor: C.white,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: C.dark,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTxt: {
    fontSize: 14,
    color: C.grey,
    fontWeight: '700',
  },
  sectionLabel: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: '700',
    color: C.grey,
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.lightGrey,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipOn: {
    backgroundColor: C.red + '18',
    borderColor: C.red,
  },
  chipTxt: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: '600',
    color: C.grey,
  },
  chipTxtOn: {
    color: C.red,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  priceInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: 10,
    height: 44,
  },
  pricePrefix: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 14,
    color: C.grey,
    marginRight: 4,
  },
  priceField: {
    flex: 1,
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 14,
    color: C.dark,
    outline: 'none',
  },
  priceDash: {
    color: C.grey,
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: R.lg,
    borderWidth: 1.5,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetTxt: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 14,
    fontWeight: '600',
    color: C.grey,
  },
  applyBtn: {
    flex: 2,
    height: 48,
    borderRadius: R.lg,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyTxt: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
});
