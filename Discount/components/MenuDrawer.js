import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, R } from '../data/theme';

const PAGES = ['profile', 'tc', 'privacy', 'feedback', 'contact'];

const MENU_ITEMS = [
  { key: 'profile',  icon: '👤', label: 'Profiel' },
  { key: 'tc',       icon: '📄', label: 'Algemene voorwaarden' },
  { key: 'privacy',  icon: '🔒', label: 'Privacybeleid' },
  { key: 'feedback', icon: '💬', label: 'Feedback' },
  { key: 'contact',  icon: '✉️',  label: 'Contact' },
];

export default function MenuDrawer({ visible, onClose }) {
  const [page, setPage] = useState(null);

  const goBack = () => setPage(null);

  const handleClose = () => {
    setPage(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            {page ? (
              <TouchableOpacity onPress={goBack} style={styles.backBtn}>
                <Text style={styles.backTxt}>← Terug</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.brand}>
                <View style={styles.brandMark}>
                  <Text style={styles.brandMarkTxt}>D%</Text>
                </View>
                <Text style={styles.brandName}>Donnie Discount</Text>
              </View>
            )}
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!page && (
              <View>
                {MENU_ITEMS.map((item) => (
                  <TouchableOpacity key={item.key} style={styles.menuRow} onPress={() => setPage(item.key)}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {page === 'profile'  && <ProfilePage />}
            {page === 'tc'       && <TCPage />}
            {page === 'privacy'  && <PrivacyPage />}
            {page === 'feedback' && <FeedbackPage />}
            {page === 'contact'  && <ContactPage />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ── Sub-pages ────────────────────────────────────────────────────────── */

function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    AsyncStorage.multiGet(['dd_name', 'dd_email']).then(pairs => {
      setName(pairs[0][1] || '');
      setEmail(pairs[1][1] || '');
    });
  }, []);

  const save = async () => {
    await AsyncStorage.multiSet([['dd_name', name], ['dd_email', email]]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={subStyles.wrap}>
      <View style={subStyles.avatar}>
        <Text style={subStyles.avatarTxt}>{name ? name[0].toUpperCase() : '?'}</Text>
      </View>
      <Text style={subStyles.fieldLabel}>Naam</Text>
      <TextInput style={subStyles.input} value={name} onChangeText={setName} placeholder="Jouw naam" placeholderTextColor={C.grey} />
      <Text style={subStyles.fieldLabel}>E-mail</Text>
      <TextInput style={subStyles.input} value={email} onChangeText={setEmail} placeholder="naam@email.com" placeholderTextColor={C.grey} keyboardType="email-address" autoCapitalize="none" />
      <TouchableOpacity style={subStyles.saveBtn} onPress={save}>
        <Text style={subStyles.saveTxt}>{saved ? '✓ Opgeslagen!' : 'Opslaan'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TCPage() {
  return (
    <View style={subStyles.wrap}>
      <Text style={subStyles.pageTitle}>Algemene Voorwaarden</Text>
      <Text style={subStyles.body}>
        Welkom bij Donnie Discount. Door gebruik te maken van onze app gaat u akkoord met de volgende voorwaarden.{'\n\n'}
        <Text style={subStyles.bold}>1. Gebruik van de app{'\n'}</Text>
        Donnie Discount is een informatiedienst die deals en kortingen toont van externe partners. Wij zijn niet verantwoordelijk voor de inhoud of beschikbaarheid van aanbiedingen van derden.{'\n\n'}
        <Text style={subStyles.bold}>2. Affiliatelinks{'\n'}</Text>
        Onze app bevat affiliatelinks. Wanneer u via onze links een aankoop doet, ontvangen wij mogelijk een commissie. Dit brengt voor u geen extra kosten met zich mee.{'\n\n'}
        <Text style={subStyles.bold}>3. Prijsnauwkeurigheid{'\n'}</Text>
        Hoewel wij streven naar actuele prijsinfo, kunnen prijzen en beschikbaarheid zonder kennisgeving wijzigen. Controleer altijd de winkelwebsite voor de definitieve prijs.{'\n\n'}
        <Text style={subStyles.bold}>4. Wijzigingen{'\n'}</Text>
        Wij behouden ons het recht voor deze voorwaarden te wijzigen. Blijf de app gebruiken nadat wijzigingen zijn doorgevoerd betekent dat u akkoord gaat met de nieuwe voorwaarden.{'\n\n'}
        Vragen? Neem contact op via info@donniediscount.nl
      </Text>
    </View>
  );
}

function PrivacyPage() {
  return (
    <View style={subStyles.wrap}>
      <Text style={subStyles.pageTitle}>Privacybeleid</Text>
      <Text style={subStyles.body}>
        Uw privacy is belangrijk voor ons. Dit beleid legt uit welke gegevens wij verzamelen en hoe wij deze gebruiken.{'\n\n'}
        <Text style={subStyles.bold}>Gegevens die wij opslaan:{'\n'}</Text>
        • Naam en e-mailadres (optioneel, alleen lokaal opgeslagen){'\n'}
        • App-voorkeuren en favorieten (lokaal op uw apparaat){'\n'}
        • Anonieme gebruiksstatistieken{'\n\n'}
        <Text style={subStyles.bold}>Wij delen uw gegevens niet{'\n'}</Text>
        Wij verkopen, verhuren of delen uw persoonlijke gegevens nooit met derden voor marketingdoeleinden.{'\n\n'}
        <Text style={subStyles.bold}>Cookies & tracking{'\n'}</Text>
        Externe partnerwebsites kunnen eigen cookies plaatsen wanneer u via onze links doorklinkt. Raadpleeg het privacybeleid van de betreffende winkel.{'\n\n'}
        <Text style={subStyles.bold}>Contact{'\n'}</Text>
        Vragen over privacy? Mail ons op privacy@donniediscount.nl
      </Text>
    </View>
  );
}

function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (rating === 0) return;
    setSent(true);
  };

  if (sent) {
    return (
      <View style={[subStyles.wrap, { alignItems: 'center', paddingTop: 40 }]}>
        <Text style={{ fontSize: 48 }}>🎉</Text>
        <Text style={[subStyles.pageTitle, { textAlign: 'center', marginTop: 12 }]}>Bedankt!</Text>
        <Text style={[subStyles.body, { textAlign: 'center' }]}>Jouw feedback helpt ons verbeteren.</Text>
      </View>
    );
  }

  return (
    <View style={subStyles.wrap}>
      <Text style={subStyles.pageTitle}>Geef feedback</Text>
      <Text style={subStyles.body}>Hoe tevreden ben jij met Donnie Discount?</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 20 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <TouchableOpacity key={s} onPress={() => setRating(s)}>
            <Text style={{ fontSize: 36, opacity: s <= rating ? 1 : 0.3 }}>⭐</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={subStyles.fieldLabel}>Jouw bericht (optioneel)</Text>
      <TextInput
        style={[subStyles.input, { height: 100, textAlignVertical: 'top', paddingTop: 10 }]}
        value={msg}
        onChangeText={setMsg}
        placeholder="Wat kunnen wij beter doen?"
        placeholderTextColor={C.grey}
        multiline
      />
      <TouchableOpacity style={[subStyles.saveBtn, rating === 0 && { opacity: 0.4 }]} onPress={submit}>
        <Text style={subStyles.saveTxt}>Verstuur feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

function ContactPage() {
  return (
    <View style={subStyles.wrap}>
      <Text style={subStyles.pageTitle}>Contact</Text>

      <ContactRow icon="✉️" label="E-mail" value="info@donniediscount.nl" onPress={() => Linking.openURL('mailto:info@donniediscount.nl')} />
      <ContactRow icon="🌐" label="Website" value="www.donniediscount.nl" onPress={() => Linking.openURL('https://donniediscount.nl')} />
      <ContactRow icon="📸" label="Instagram" value="@donniediscount" onPress={() => Linking.openURL('https://instagram.com/donniediscount')} />

      <View style={subStyles.contactBox}>
        <Text style={subStyles.bold}>Zakelijk contact</Text>
        <Text style={[subStyles.body, { marginTop: 4 }]}>
          Voor partnerships, affiliate samenwerking of persvragen:{'\n'}business@donniediscount.nl
        </Text>
      </View>
    </View>
  );
}

function ContactRow({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity style={subStyles.contactRow} onPress={onPress}>
      <Text style={{ fontSize: 20, width: 32 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={subStyles.fieldLabel}>{label}</Text>
        <Text style={[subStyles.body, { color: C.ocean }]}>{value}</Text>
      </View>
      <Text style={{ color: C.grey }}>›</Text>
    </TouchableOpacity>
  );
}

/* ── Styles ───────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  panel: {
    width: 320,
    backgroundColor: C.white,
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
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandMarkTxt: { color: C.white, fontWeight: '900', fontSize: 12, fontFamily: 'Poppins, system-ui, sans-serif' },
  brandName: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 14, fontWeight: '700', color: C.dark },
  backBtn: { paddingVertical: 4 },
  backTxt: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 14, color: C.ocean, fontWeight: '600' },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.lightGrey, justifyContent: 'center', alignItems: 'center',
  },
  closeTxt: { fontSize: 14, color: C.grey, fontWeight: '700' },
  content: { flex: 1 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.lightGrey,
    gap: 14,
  },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 15, fontWeight: '500', color: C.dark },
  menuArrow: { fontSize: 20, color: C.grey },
});

const subStyles = StyleSheet.create({
  wrap: { padding: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.red, justifyContent: 'center',
    alignItems: 'center', alignSelf: 'center', marginBottom: 20,
  },
  avatarTxt: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 28, fontWeight: '900', color: C.white },
  pageTitle: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 18, fontWeight: '700', color: C.dark, marginBottom: 12 },
  body: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 13, color: C.grey, lineHeight: 20 },
  bold: { fontFamily: 'Poppins, system-ui, sans-serif', fontWeight: '700', color: C.dark },
  fieldLabel: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 10, fontWeight: '700', color: C.grey, letterSpacing: 1, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: R.md,
    paddingHorizontal: 14, height: 46,
    fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 14, color: C.dark,
    outlineStyle: 'none',
  },
  saveBtn: { backgroundColor: C.red, borderRadius: R.lg, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  saveTxt: { fontFamily: 'Poppins, system-ui, sans-serif', color: C.white, fontWeight: '700', fontSize: 15 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.lightGrey, gap: 12 },
  contactBox: { marginTop: 20, padding: 16, backgroundColor: C.lightGrey, borderRadius: R.lg },
});
