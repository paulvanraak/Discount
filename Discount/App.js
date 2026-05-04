import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageProvider } from './context/LanguageContext';
import SplashScreen from './screens/SplashScreen';
import LanguageScreen from './screens/LanguageScreen';
import HomeScreen from './screens/HomeScreen';
import { initAnalytics } from './services/analytics';

// ── Web-only setup (runs once at module load) ─────────────────
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Fonts
  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&family=Nunito:wght@800;900&display=swap';
  document.head.appendChild(fonts);

  const icons = document.createElement('link');
  icons.rel = 'stylesheet';
  icons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(icons);

  // SVG favicon (smiley price-tag mark)
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 108"><path d="M50,3 C76,3 95,16 95,36 L95,79 Q95,105 68,105 L32,105 Q5,105 5,79 L5,36 C5,16 24,3 50,3 Z" fill="#F0674E"/><circle cx="50" cy="20" r="8" fill="white"/><circle cx="34" cy="52" r="7" fill="white"/><circle cx="66" cy="52" r="7" fill="white"/><path d="M28,68 Q50,90 72,68" stroke="white" stroke-width="7.5" fill="none" stroke-linecap="round"/></svg>`;
  const faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = 'image/svg+xml';
  faviconLink.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(faviconSvg)}`;
  document.head.appendChild(faviconLink);

  // SEO meta tags
  document.title = 'Donnie Discount — Extreme kortingen. Elke dag.';

  const addMeta = (attrs) => {
    const m = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => m.setAttribute(k, v));
    document.head.appendChild(m);
  };

  addMeta({ name: 'description',          content: 'Extreme kortingen op tech, fashion, keuken en meer. Elke dag verse deals tot 80% korting. Bespaar slim met Donnie Discount.' });
  addMeta({ name: 'robots',               content: 'index, follow' });
  addMeta({ name: 'theme-color',          content: '#FF4040' });
  addMeta({ name: 'mobile-web-app-capable', content: 'yes' });
  addMeta({ name: 'apple-mobile-web-app-capable', content: 'yes' });
  addMeta({ name: 'apple-mobile-web-app-status-bar-style', content: 'default' });
  addMeta({ name: 'apple-mobile-web-app-title', content: 'Donnie Discount' });
  addMeta({ property: 'og:type',          content: 'website' });
  addMeta({ property: 'og:title',         content: 'Donnie Discount — Extreme kortingen. Elke dag.' });
  addMeta({ property: 'og:description',   content: 'Elke dag nieuwe deals. Tot 80% korting op tech, fashion, keuken en meer.' });
  addMeta({ property: 'og:url',           content: 'https://donniediscount.com/' });
  addMeta({ property: 'og:image',         content: 'https://donniediscount.com/og-image.png' });
  addMeta({ property: 'og:locale',        content: 'nl_NL' });
  addMeta({ name: 'twitter:card',         content: 'summary_large_image' });
  addMeta({ name: 'twitter:title',        content: 'Donnie Discount — Extreme kortingen' });
  addMeta({ name: 'twitter:description',  content: 'Elke dag nieuwe deals. Tot 80% korting.' });

  // Analytics (GA4 + Meta Pixel) — IDs configured via .env
  initAnalytics();
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="Main" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
