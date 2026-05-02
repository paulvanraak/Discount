import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands',  sub: 'NL / BE' },
  { code: 'en', flag: '🇺🇸', name: 'English',     sub: 'US / UK / AU' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch',     sub: 'DE / AT / CH' },
  { code: 'es', flag: '🇪🇸', name: 'Español',     sub: 'ES / LATAM' },
];

export default function LanguageScreen({ navigation }) {
  const { lang, setLang, t } = useLanguage();

  const handleSelect = async (code) => {
    setLang(code);
    await AsyncStorage.setItem('language', code);
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Donnie</Text>
        <Text style={styles.logoSub}>Discount</Text>
      </View>

      <Text style={styles.prompt}>{t.selectLanguage}</Text>

      <View style={styles.list}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            style={[styles.row, lang === l.code && styles.rowActive]}
            onPress={() => handleSelect(l.code)}
            activeOpacity={0.8}
          >
            <Text style={styles.flag}>{l.flag}</Text>
            <View style={styles.textBlock}>
              <Text style={[styles.langName, lang === l.code && styles.langNameActive]}>
                {l.name}
              </Text>
              <Text style={styles.langSub}>{l.sub}</Text>
            </View>
            {lang === l.code && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF8C00',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
  },
  logoSub: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#333',
    marginTop: -8,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  list: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  textBlock: {
    flex: 1,
  },
  langName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  langNameActive: {
    color: '#FF8C00',
  },
  langSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  check: {
    fontSize: 20,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
});