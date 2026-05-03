import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

export default function SplashScreen({ navigation }) {
  const { setLang } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const saved = await AsyncStorage.getItem('language');
      if (saved) {
        setLang(saved);
        navigation.replace('Main');
      } else {
        navigation.replace('Language');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>Donnie</Text>
      <Text style={styles.logoSub}>Discount</Text>
      <Text style={styles.tagline}>Extreme kortingen. Elke dag.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  logoSub: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginTop: -10,
  },
  tagline: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});