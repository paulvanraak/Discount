import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'nl', abbr: 'NL', name: 'Nederlands', sub: 'NL & BE' },
  { code: 'en', abbr: 'EN', name: 'English',    sub: 'US, UK & AU' },
  { code: 'de', abbr: 'DE', name: 'Deutsch',    sub: 'DE, AT & CH' },
  { code: 'es', abbr: 'ES', name: 'Español',    sub: 'ES & LATAM' },
];

export const REGIONS = {
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

const LOCALE_MAP = {
  'nl-NL': { lang: 'nl', region: 'NL' }, 'nl-BE': { lang: 'nl', region: 'BE' },
  'en-US': { lang: 'en', region: 'US' }, 'en-GB': { lang: 'en', region: 'UK' },
  'en-AU': { lang: 'en', region: 'AU' }, 'en-CA': { lang: 'en', region: 'CA' },
  'de-DE': { lang: 'de', region: 'DE' }, 'de-AT': { lang: 'de', region: 'AT' },
  'de-CH': { lang: 'de', region: 'CH' }, 'es-ES': { lang: 'es', region: 'ES' },
  'es-MX': { lang: 'es', region: 'MX' }, 'es-AR': { lang: 'es', region: 'AR' },
  'es-CO': { lang: 'es', region: 'CO' },
};

export function detectBrowserLocale() {
  try {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const full = navigator.language;
      if (LOCALE_MAP[full]) return LOCALE_MAP[full];
      const langCode = full.split('-')[0];
      const langMap = { nl: 'nl', en: 'en', de: 'de', es: 'es' };
      const lang = langMap[langCode];
      if (lang) return { lang, region: REGIONS[lang][0].code };
    }
  } catch {}
  return { lang: 'nl', region: 'NL' };
}

export default function LanguageScreen({ navigation }) {
  const { setLang, setRegion } = useLanguage();
  const [{ lang: initLang, region: initRegion }] = useState(() => detectBrowserLocale());
  const [selectedLang, setSelectedLang] = useState(initLang);
  const [selectedRegion, setSelectedRegion] = useState(initRegion);

  const handleLangSelect = (code) => {
    setSelectedLang(code);
    setSelectedRegion(REGIONS[code][0].code);
  };

  const handleContinue = async () => {
    setLang(selectedLang);
    setRegion(selectedRegion);
    await AsyncStorage.multiSet([['language', selectedLang], ['region', selectedRegion]]);
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.brandMark}>
            <Text style={s.brandMarkTxt}>D%</Text>
          </View>
          <Text style={s.brandName}>Donnie Discount</Text>
        </View>

        <LanguagePicker
          selectedLang={selectedLang}
          selectedRegion={selectedRegion}
          onLangSelect={handleLangSelect}
          onRegionSelect={setSelectedRegion}
        />

        <TouchableOpacity style={s.continueBtn} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={s.continueTxt}>Doorgaan</Text>
          <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable picker used both here and in MenuDrawer
export function LanguagePicker({ selectedLang, selectedRegion, onLangSelect, onRegionSelect }) {
  const regions = REGIONS[selectedLang] || [];
  return (
    <View>
      <Text style={s.sectionLabel}>TAAL / LANGUAGE</Text>
      <View style={s.langGrid}>
        {LANGUAGES.map(l => {
          const active = selectedLang === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              style={[s.langCard, active && s.langCardActive]}
              onPress={() => onLangSelect(l.code)}
              activeOpacity={0.85}
            >
              <Text style={[s.langAbbr, active && s.langAbbrActive]}>{l.abbr}</Text>
              <Text style={[s.langName, active && s.langNameActive]}>{l.name}</Text>
              <Text style={[s.langSub, active && s.langSubActive]}>{l.sub}</Text>
              {active && (
                <View style={s.checkCircle}>
                  <Icon name="check" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[s.sectionLabel, { marginTop: 24 }]}>REGIO / REGION</Text>
      <Text style={s.regionHint}>Bepaalt welke winkels we tonen</Text>
      <View style={s.regionRow}>
        {regions.map(r => {
          const active = selectedRegion === r.code;
          return (
            <TouchableOpacity
              key={r.code}
              style={[s.regionChip, active && s.regionChipActive]}
              onPress={() => onRegionSelect(r.code)}
              activeOpacity={0.85}
            >
              {active && <Icon name="check" size={14} color={C_RED} style={{ marginRight: 4 }} />}
              <Text style={[s.regionCode, active && s.regionCodeActive]}>{r.code}</Text>
              <Text style={[s.regionName, active && s.regionNameActive]}>{r.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const C_RED = '#FF4040';
const C_DARK = '#1E2638';
const C_GREY = '#647488';
const C_WHITE = '#FFFFFF';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C_DARK },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40, gap: 10 },
  brandMark: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: C_RED, justifyContent: 'center', alignItems: 'center',
  },
  brandMarkTxt: { color: C_WHITE, fontFamily: 'Open Sans, system-ui, sans-serif', fontWeight: '800', fontSize: 18 },
  brandName: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 20, fontWeight: '700', color: C_WHITE },

  sectionLabel: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 10, fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5, marginBottom: 6,
  },
  regionHint: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12,
  },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langCard: {
    width: '47.5%', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 16, borderWidth: 1.5,
    borderColor: 'transparent', position: 'relative',
  },
  langCardActive: { backgroundColor: C_WHITE, borderColor: C_WHITE },
  langAbbr: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  langAbbrActive: { color: C_RED },
  langName: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  langNameActive: { color: C_DARK },
  langSub: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  langSubActive: { color: C_GREY },
  checkCircle: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C_RED, justifyContent: 'center', alignItems: 'center',
  },

  regionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  regionChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  regionChipActive: { backgroundColor: C_WHITE, borderColor: C_WHITE },
  regionCode: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.9)', marginRight: 6 },
  regionCodeActive: { color: C_RED },
  regionName: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  regionNameActive: { color: C_DARK },

  continueBtn: {
    backgroundColor: C_RED, borderRadius: 16, height: 56,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28,
  },
  continueTxt: { fontFamily: 'Open Sans, system-ui, sans-serif', color: C_WHITE, fontWeight: '700', fontSize: 16 },
});
