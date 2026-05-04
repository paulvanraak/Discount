import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Platform,
} from 'react-native';
import Icon from './Icon';
import { C, R } from '../data/theme';

const DISCOUNTS = [
  { label: '40%+', value: 40 },
  { label: '50%+', value: 50 },
  { label: '60%+', value: 60 },
  { label: '70%+', value: 70 },
];

const PRICE_MIN  = 0;
const PRICE_MAX  = 500;
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
        style={{ width: '100%', accentColor: C.red, cursor: 'pointer', outline: 'none', height: 4 }}
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
  wrap:     { marginHorizontal: 20, marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label:    { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 14, fontWeight: '600', color: C.grey },
  value:    { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 15, fontWeight: '800', color: C.red },
  tickRow:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tick:     { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 12, color: C.grey },
};

export default function FilterPanel({
  visible, onClose,
  activeDisc, setActiveDisc,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  onApply, onReset,
}) {
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [panelMounted, setPanelMounted] = useState(false);

  const minVal = parseInt(minPrice) || PRICE_MIN;
  const maxVal = parseInt(maxPrice) || PRICE_MAX;

  useEffect(() => {
    if (visible) {
      setPanelMounted(true);
      // Use separate animations — JS driver for fade ensures first-frame opacity=0
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }).start();
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: false }).start();
    } else {
      Animated.timing(slideAnim, { toValue: -PANEL_WIDTH, duration: 220, useNativeDriver: true }).start();
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => {
        slideAnim.setValue(-PANEL_WIDTH);
        fadeAnim.setValue(0);
        setPanelMounted(false);
      });
    }
  }, [visible]);

  const handleClose = () => onClose();
  const handleApply = () => { onApply(); onClose(); };

  const handleReset = () => {
    setActiveDisc(null);
    setMinPrice('');
    setMaxPrice('');
    onReset();   // HomeScreen applies reset directly (avoids stale closure)
    onClose();
  };

  const handleMinChange = (val) => {
    const clamped = Math.min(val, maxVal - PRICE_STEP);
    setMinPrice(clamped === PRICE_MIN ? '' : String(clamped));
  };

  const handleMaxChange = (val) => {
    const clamped = Math.max(val, minVal + PRICE_STEP);
    setMaxPrice(clamped === PRICE_MAX ? '' : String(clamped));
  };

  const activeCount = [activeDisc !== null, minPrice !== '', maxPrice !== ''].filter(Boolean).length;

  return (
    <Modal visible={panelMounted} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>

        {/* Panel slides in from left */}
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

            {/* ── Discount 2×2 grid ── */}
            <Text style={styles.sectionLabel}>MINIMALE KORTING</Text>
            <View style={styles.discountGrid}>
              {DISCOUNTS.map(({ label, value }) => {
                const active = activeDisc === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.discountBtn, active && styles.discountBtnOn]}
                    onPress={() => setActiveDisc(active ? null : value)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.discountTxt, active && styles.discountTxtOn]}>{label}</Text>
                    <Text style={[styles.discountSub, active && styles.discountSubOn]}>of hoger</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Price sliders ── */}
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

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetTxt}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyTxt}>Toepassen{activeCount > 0 ? ` (${activeCount})` : ''}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Backdrop fades in with JS driver (no first-frame flash) */}
        <Animated.View style={[styles.backdropWrap, { opacity: fadeAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        </Animated.View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:      { flex: 1, flexDirection: 'row' },
  backdropWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
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
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: C.dark,
  },
  countBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.red, justifyContent: 'center', alignItems: 'center',
  },
  countTxt: { color: C.white, fontSize: 10, fontWeight: '800' },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.lightGrey, justifyContent: 'center', alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1,
    marginTop: 20, marginBottom: 12, paddingHorizontal: 20,
  },

  // Discount 2×2 grid
  discountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  discountBtn: {
    width: '47%',
    paddingVertical: 14,
    borderRadius: R.md,
    backgroundColor: C.lightGrey,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  discountBtnOn: { backgroundColor: C.red + '14', borderColor: C.red },
  discountTxt: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 20,
    fontWeight: '800',
    color: C.grey,
  },
  discountTxtOn: { color: C.red },
  discountSub: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: '500',
    color: C.grey,
    marginTop: 2,
  },
  discountSubOn: { color: C.red },

  // Price summary
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: C.lightGrey,
    borderRadius: R.md,
    overflow: 'hidden',
  },
  priceTag:      { flex: 1, alignItems: 'center', paddingVertical: 10 },
  priceTagLabel: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 10, fontWeight: '600', color: C.grey, letterSpacing: 0.5 },
  priceTagVal:   { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 16, fontWeight: '800', color: C.dark, marginTop: 2 },
  priceDivider:  { width: 1, height: '70%', backgroundColor: C.border },

  // Footer
  footer: {
    flexDirection: 'row', gap: 10, padding: 20,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  resetBtn: {
    flex: 1, height: 48, borderRadius: R.lg,
    borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  resetTxt: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 14, fontWeight: '600', color: C.grey },
  applyBtn: {
    flex: 2, height: 48, borderRadius: R.lg,
    backgroundColor: C.red, justifyContent: 'center', alignItems: 'center',
  },
  applyTxt: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 14, fontWeight: '700', color: C.white },
});
