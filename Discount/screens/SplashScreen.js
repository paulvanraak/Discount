import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

export default function SplashScreen({ navigation }) {
  const { setLang, setRegion } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const [[, savedLang], [, savedRegion]] = await AsyncStorage.multiGet(['language', 'region']);
        if (savedLang) {
          setLang(savedLang);
          if (savedRegion) setRegion(savedRegion);
          navigation.replace('Main');
        } else {
          navigation.replace('Language');
        }
      } catch {
        navigation.replace('Language');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkTxt}>D%</Text>
      </View>
      <Text style={styles.logoText}>Donnie</Text>
      <Text style={styles.logoSub}>Discount</Text>
      <Text style={styles.tagline}>Extreme kortingen. Elke dag.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF4040',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandMarkTxt: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    color: '#fff',
    fontWeight: '800',
    fontSize: 22,
  },
  logoText: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
  },
  logoSub: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    fontSize: 34,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    marginTop: -6,
  },
  tagline: {
    fontFamily: 'Open Sans, system-ui, sans-serif',
    marginTop: 16,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '500',
  },
});
