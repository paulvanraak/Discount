import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { C, R } from '../data/theme';

const LEVELS = [
  { name: 'Bronze',  min: 0,   max: 49,  icon: '🥉', color: '#CD7F32' },
  { name: 'Silver',  min: 50,  max: 199, icon: '🥈', color: '#A8A9AD' },
  { name: 'Gold',    min: 200, max: 499, icon: '🥇', color: '#FFD700' },
  { name: 'Diamond', min: 500, max: Infinity, icon: '💎', color: '#0067FF' },
];

const BADGES = [
  { id: 'first_save',   icon: '❤️',  name: 'First Save',    desc: 'Sla je eerste deal op',        req: s => s.favCount >= 1 },
  { id: 'deal_hunter',  icon: '🎯',  name: 'Deal Hunter',   desc: 'Open 10 deals',                 req: s => s.clicks >= 10 },
  { id: 'streak_3',     icon: '🔥',  name: 'On Fire',       desc: '3 dagen op rij bezoeken',       req: s => s.streak >= 3 },
  { id: 'streak_7',     icon: '⚡',  name: 'Dedicated',     desc: '7 dagen op rij bezoeken',       req: s => s.streak >= 7 },
  { id: 'collector',    icon: '💾',  name: 'Collector',     desc: '10 deals opgeslagen',            req: s => s.favCount >= 10 },
  { id: 'century',      icon: '💯',  name: 'Century Club',  desc: '100 punten verdiend',            req: s => s.points >= 100 },
];

function getLevel(points) {
  return LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
}

function getNextLevel(points) {
  const idx = LEVELS.findIndex(l => points >= l.min && points <= l.max);
  return LEVELS[idx + 1] || null;
}

export default function RewardsScreen({ points, streak, clicks, favCount }) {
  const level = getLevel(points);
  const next = getNextLevel(points);
  const stats = { points, streak, clicks, favCount };

  const progress = next
    ? Math.min(((points - level.min) / (next.min - level.min)) * 100, 100)
    : 100;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Reward 1: Points & Level ──────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Punten & Level</Text>
            <Text style={styles.cardSub}>Verdien punten door deals te bekijken en op te slaan</Text>
          </View>
        </View>

        <View style={[styles.levelBadge, { backgroundColor: level.color + '20', borderColor: level.color }]}>
          <Text style={styles.levelIcon}>{level.icon}</Text>
          <View>
            <Text style={[styles.levelName, { color: level.color }]}>{level.name}</Text>
            <Text style={styles.levelPoints}>{points} punten</Text>
          </View>
        </View>

        {next && (
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: next.color }]} />
            </View>
            <Text style={styles.progressLabel}>{next.min - points} punten naar {next.icon} {next.name}</Text>
          </View>
        )}

        <View style={styles.earnGrid}>
          <EarnRow icon="👆" text="Deal bekijken" pts="+1 pt" />
          <EarnRow icon="❤️"  text="Deal opslaan" pts="+5 pt" />
          <EarnRow icon="📅" text="Dagelijks bezoek" pts="+2 pt" />
        </View>
      </View>

      {/* ── Reward 2: Daily Streak ────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🔥</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Dagelijkse Streak</Text>
            <Text style={styles.cardSub}>Kom elke dag terug en bouw je streak op</Text>
          </View>
        </View>

        <View style={styles.streakCenter}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>{streak === 1 ? 'dag' : 'dagen'} op rij 🔥</Text>
        </View>

        <View style={styles.streakDots}>
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <View key={d} style={[styles.streakDot, d <= streak && styles.streakDotActive]}>
              <Text style={[styles.streakDotTxt, d <= streak && styles.streakDotTxtActive]}>
                {d <= streak ? '🔥' : d.toString()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.streakTip}>
          <Text style={styles.streakTipTxt}>
            {streak >= 7
              ? '🏆 Geweldig! Je hebt 7 dagen op rij gescoord!'
              : streak >= 3
              ? `🔥 Nog ${7 - streak} dagen voor je 7-daagse badge!`
              : `💡 Kom morgen terug om je streak te verlengen!`}
          </Text>
        </View>
      </View>

      {/* ── Reward 3: Badges ─────────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🏅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Badges</Text>
            <Text style={styles.cardSub}>Unlock achievements door de app te gebruiken</Text>
          </View>
        </View>

        <View style={styles.badgeGrid}>
          {BADGES.map(badge => {
            const earned = badge.req(stats);
            return (
              <View key={badge.id} style={[styles.badgeItem, !earned && styles.badgeLocked]}>
                <Text style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>{badge.icon}</Text>
                <Text style={[styles.badgeName, !earned && { color: C.grey }]}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
                {earned && <Text style={styles.badgeEarned}>✓ Verdiend</Text>}
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function EarnRow({ icon, text, pts }) {
  return (
    <View style={styles.earnRow}>
      <Text style={styles.earnIcon}>{icon}</Text>
      <Text style={styles.earnText}>{text}</Text>
      <Text style={styles.earnPts}>{pts}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.lightGrey },
  content: { padding: 16, gap: 16 },

  card: {
    backgroundColor: C.white,
    borderRadius: R.xl,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  cardIcon: { fontSize: 28, marginTop: 2 },
  cardTitle: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 16, fontWeight: '700', color: C.dark },
  cardSub: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 12, color: C.grey, marginTop: 2 },

  // Points card
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: R.lg,
    borderWidth: 2,
    marginBottom: 14,
  },
  levelIcon: { fontSize: 36 },
  levelName: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 18, fontWeight: '800' },
  levelPoints: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 12, color: C.grey, marginTop: 2 },
  progressWrap: { marginBottom: 16 },
  progressBar: { height: 8, backgroundColor: C.lightGrey, borderRadius: R.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: R.full },
  progressLabel: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 11, color: C.grey, marginTop: 6, textAlign: 'center' },
  earnGrid: { gap: 8 },
  earnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  earnIcon: { fontSize: 16, width: 24 },
  earnText: { flex: 1, fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 13, color: C.dark },
  earnPts: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 13, fontWeight: '700', color: C.success },

  // Streak card
  streakCenter: { alignItems: 'center', marginVertical: 8 },
  streakNumber: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 56, fontWeight: '900', color: C.dark, lineHeight: 64 },
  streakLabel: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 16, fontWeight: '600', color: C.grey },
  streakDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 14 },
  streakDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.lightGrey, justifyContent: 'center', alignItems: 'center',
  },
  streakDotActive: { backgroundColor: C.red },
  streakDotTxt: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 12, color: C.grey, fontWeight: '700' },
  streakDotTxtActive: { color: C.white, fontSize: 16 },
  streakTip: { backgroundColor: C.lightGrey, borderRadius: R.md, padding: 12 },
  streakTipTxt: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 13, color: C.dark, textAlign: 'center' },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: {
    width: '47%',
    backgroundColor: C.lightGrey,
    borderRadius: R.lg,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  badgeLocked: { opacity: 0.45 },
  badgeIcon: { fontSize: 32 },
  badgeIconLocked: { opacity: 0.4 },
  badgeName: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 12, fontWeight: '700', color: C.dark, textAlign: 'center' },
  badgeDesc: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 10, color: C.grey, textAlign: 'center' },
  badgeEarned: { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 10, fontWeight: '700', color: C.success, marginTop: 2 },
});
