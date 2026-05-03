import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Platform,
} from 'react-native';
import Icon from './Icon';
import { C, R } from '../data/theme';

const CATS = [
  { key: 'all',     label: 'Alles',      icon: 'apps' },
  { key: 'tech',    label: 'Tech',        icon: 'laptop' },
  { key: 'kitchen', label: 'Keuken',      icon: 'kitchen' },
  { key: 'home',    label: 'Huishouden',  icon: 'weekend' },
];

const DISCOUNTS = ['40%+', '50%+', '60%+', '70%+'];

const PRICE_MIN = 0;
const PRICE_MAX = 500;
const PRICE_STEP = 10;
const PANEL_WIDTH = 300;

function PriceSlider({ label, value, min, max, step, onChange }) {
  if (Platform.OS !== 'web') return null;
  return (
    <View style={sliderStyles.wrap}>
      <View style={sliderStyles.labelRow}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={sliderStyles.value}>€{value}</Text>
      </View>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: C.red,
          cursor: 'pointer',
          outline: 'none',
          height: 4,
        }}
      />
      <View style={sliderStyles.tickRow}>
        <Text style={sliderStyles.tick}>€{min}</Text>
        <Text style={sliderStyles.tick}>€{Math.round((min + max) / 2)}</Text>
        <Text style={sliderStyles.tick}>€{max}</Text>
      </View>
    </View>
  );
}

const sliderStyles = {
  wrap: { marginHorizontal: 20, marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 12, fontWeight: '600', color: C.grey },
  value: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 13, fontWeight: '800', color: C.red },
  tickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tick: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 10, color: C.grey },
};

export default function FilterPanel({
  visible, onClose,
  activeCat, setActiveCat,
  activeDisc, setActiveDisc,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  onApply,
}) {
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const [panelMounted, setPanelMounted] = useState(false);

  // Parse string values to numbers for sliders
  const minVal = parseInt(minPrice) || PRICE_MIN;
  const maxVal = parseInt(maxPrice) || PRICE_MAX;

  useEffect(() => {
    if (visible) {
      setPanelMounted(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -PANEL_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        slideAnim.setValue(-PANEL_WIDTH);
        setPanelMounted(false);
      });
    }
  }, [visible]);

  const handleClose = () => onClose();

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

  const handleMinChange = (val) => {
    // Keep min at least 10 below max
    const clamped = Math.min(val, maxVal - PRICE_STEP);
    setMinPrice(clamped === PRICE_MIN ? '' : String(clamped));
  };

  const handleMaxChange = (val) => {
    const clamped = Math.max(val, minVal + PRICE_STEP);
    setMaxPrice(clamped === PRICE_MAX ? '' : String(clamped));
  };

  const activeCount = [activeCat !== 'all', activeDisc !== null, minPrice !== '', maxPrice !== ''].filter(Boolean).length;

  return (
    <Modal visible={panelMounted} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.title}>Filters</Text>
              {activeCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countTxt}>{activeCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Icon name="close" size={18} color={C.grey} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* Category */}
            <Text style={styles.sectionLabel}>CATEGORIE</Text>
            <View style={styles.chipRow}>
              {CATS.map(({ key, label, icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.chip, activeCat === key && styles.chipOn]}
                  onPress={() => setActiveCat(key)}
                >
                  <Icon name={icon} size={14} color={activeCat === key ? C.red : C.grey} style={{ marginRight: 4 }} />
                  <Text style={[styles.chipTxt, activeCat === key && styles.chipTxtOn]}>{label}</Text>
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

            {/* Price range sliders */}
            <Text style={styles.sectionLabel}>PRIJSRANGE</Text>
            <PriceSlider
              label="Minimumprijs"
              value={minVal}
              min={PRICE_MIN}
              max={PRICE_MAX - PRICE_STEP}
              step={PRICE_STEP}
              onChange={handleMinChange}
            />
            <PriceSlider
              label="Maximumprijs"
              value={maxVal}
              min={PRICE_MIN + PRICE_STEP}
              max={PRICE_MAX}
              step={PRICE_STEP}
              onChange={handleMaxChange}
            />
            <View style={styles.priceDisplay}>
              <View style={styles.priceTag}>
                <Text style={styles.priceTagLabel}>Van</Text>
                <Text style={styles.priceTagVal}>€{minVal}</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceTag}>
                <Text style={styles.priceTagLabel}>Tot</Text>
                <Text style={styles.priceTagVal}>€{maxVal === PRICE_MAX ? '500+' : maxVal}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetTxt}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyTxt}>Toepassen{activeCount > 0 ? ` (${activeCount})` : ''}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
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
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: C.dark,
  },
  countBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countTxt: { color: C.white, fontSize: 10, fontWeight: '800' },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.lightGrey,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipOn: { backgroundColor: C.red + '18', borderColor: C.red },
  chipTxt: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: '600',
    color: C.grey,
  },
  chipTxtOn: { color: C.red },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: C.lightGrey,
    borderRadius: R.md,
    overflow: 'hidden',
  },
  priceTag: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  priceTagLabel: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: '600',
    color: C.grey,
    letterSpacing: 0.5,
  },
  priceTagVal: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: C.dark,
    marginTop: 2,
  },
  priceDivider: { width: 1, height: '70%', backgroundColor: C.border },
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
    fontFamily: 'Open Sans, system-ui, sans-serif',
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
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
});
