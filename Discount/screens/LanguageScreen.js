import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'nl', abbr: 'NL', name: 'Nederlands',  sub: 'NL & BE' },
  { code: 'en', abbr: 'EN', name: 'English',      sub: 'US, UK & AU' },
  { code: 'de', abbr: 'DE', name: 'Deutsch',      sub: 'DE, AT & CH' },
  { code: 'es', abbr: 'ES', name: 'Español',      sub: 'ES & LATAM' },
];

const REGIONS = {
  nl: [
    { code: 'NL', name: 'Nederland' },
    { code: 'BE', name: 'België' },
  ],
  en: [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
  ],
  de: [
    { code: 'DE', name: 'Deutschland' },
    { code: 'AT', name: 'Österreich' },
    { code: 'CH', name: 'Schweiz' },
  ],
  es: [
    { code: 'ES', name: 'España' },
    { code: 'MX', name: 'México' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
  ],
};

export default function LanguageScreen({ navigation }) {
  const { lang, setLang } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(lang || 'nl');
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[lang || 'nl'][0].code);

  const handleLangSelect = (code) => {
    setSelectedLang(code);
    setSelectedRegion(REGIONS[code][0].code);
  };

  const handleContinue = async () => {
    setLang(selectedLang);
    await AsyncStorage.multiSet([
      ['language', selectedLang],
      ['region', selectedRegion],
    ]);
    navigation.replace('Main');
  };

  const regions = REGIONS[selectedLang] || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand mark */}
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkTxt}>D%</Text>
          </View>
          <Text style={styles.brandName}>Donnie Discount</Text>
        </View>

        {/* Language section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TAAL / LANGUAGE</Text>
          <View style={styles.langGrid}>
            {LANGUAGES.map(l => {
              const active = selectedLang === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langCard, active && styles.langCardActive]}
                  onPress={() => handleLangSelect(l.code)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.langAbbr, active && styles.langAbbrActive]}>{l.abbr}</Text>
                  <Text style={[styles.langName, active && styles.langNameActive]}>{l.name}</Text>
                  <Text style={[styles.langSub, active && styles.langSubActive]}>{l.sub}</Text>
                  {active && (
                    <View style={styles.checkCircle}>
                      <Icon name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Region section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REGIO / REGION</Text>
          <View style={styles.regionRow}>
            {regions.map(r => {
              const active = selectedRegion === r.code;
              return (
                <TouchableOpacity
                  key={r.code}
                  style={[styles.regionChip, active && styles.regionChipActive]}
                  onPress={() => setSelectedRegion(r.code)}
                  activeOpacity={0.85}
                >
                  {active && <Icon name="check" size={14} color={C_RED} style={{ marginRight: 4 }} />}
                  <Text style={[styles.regionCode, active && styles.regionCodeActive]}>{r.code}</Text>
                  <Text style={[styles.regionName, active && styles.regionNameActive]}>{r.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Continue button */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.continueTxt}>Doorgaan</Text>
          <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const C_RED = '#FF4040';
const C_DARK = '#1E2638';
const C_GREY = '#647488';
const C_BORDER = '#E2E8F0';
const C_LIGHT = '#F1F5F9';
const C_WHITE = '#FFFFFF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C_DARK,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 10,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C_RED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandMarkTxt: {
    color: C_WHITE,
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontWeight: '800',
    fontSize: 18,
  },
  brandName: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 20,
    fontWeight: '700',
    color: C_WHITE,
  },

  section: { marginBottom: 28 },
  sectionLabel: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // Language grid (2-column)
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  langCard: {
    width: '47.5%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  langCardActive: {
    backgroundColor: C_WHITE,
    borderColor: C_WHITE,
  },
  langAbbr: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  langAbbrActive: { color: C_RED },
  langName: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  langNameActive: { color: C_DARK },
  langSub: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  langSubActive: { color: C_GREY },
  checkCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C_RED,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Region chips
  regionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  regionChipActive: {
    backgroundColor: C_WHITE,
    borderColor: C_WHITE,
  },
  regionCode: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginRight: 6,
  },
  regionCodeActive: { color: C_RED },
  regionName: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  regionNameActive: { color: C_DARK },

  continueBtn: {
    backgroundColor: C_RED,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  continueTxt: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    color: C_WHITE,
    fontWeight: '700',
    fontSize: 16,
  },
});
