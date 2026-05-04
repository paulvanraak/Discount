import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from '../components/Icon';
import { C, R } from '../data/theme';

const LEVELS = [
  { name: 'Bronze',  min: 0,   max: 49,       color: '#CD7F32', abbr: 'BR' },
  { name: 'Silver',  min: 50,  max: 199,      color: '#A8A9AD', abbr: 'SL' },
  { name: 'Gold',    min: 200, max: 499,      color: '#FFD700', abbr: 'GD' },
  { name: 'Diamond', min: 500, max: Infinity, color: '#0067FF', abbr: 'DM' },
];

const BADGES = [
  { id: 'first_save',  icon: 'bookmark',              name: 'First Save',   desc: 'Bewaar je eerste deal',        req: s => s.favCount >= 1 },
  { id: 'deal_hunter', icon: 'gps-fixed',             name: 'Deal Hunter',  desc: 'Open 10 deals',                req: s => s.clicks >= 10 },
  { id: 'streak_3',    icon: 'local-fire-department', name: 'On Fire',      desc: '3 dagen op rij',               req: s => s.streak >= 3 },
  { id: 'streak_7',    icon: 'bolt',                  name: 'Dedicated',    desc: '7 dagen op rij',               req: s => s.streak >= 7 },
  { id: 'collector',   icon: 'collections-bookmark',  name: 'Collector',    desc: '10 deals bewaard',             req: s => s.favCount >= 10 },
  { id: 'century',     icon: 'grade',                 name: 'Century Club', desc: '100 punten verdiend',          req: s => s.points >= 100 },
];

const EARN_ACTIONS = [
  { icon: 'touch-app',      text: 'Deal bekijken',       pts: '+1 pt',  color: C.ocean },
  { icon: 'bookmark',       text: 'Deal bewaren',        pts: '+5 pt',  color: C.success },
  { icon: 'calendar-today', text: 'Dagelijks terugkomen',pts: '+2 pt',  color: C.warning },
];

function getLevel(points) {
  return LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
}
function getNextLevel(points) {
  const idx = LEVELS.findIndex(l => points >= l.min && points <= l.max);
  return LEVELS[idx + 1] || null;
}

export default function RewardsScreen({ points, streak, clicks, favCount }) {
  const level   = getLevel(points);
  const next    = getNextLevel(points);
  const stats   = { points, streak, clicks, favCount };
  const progress = next
    ? Math.min(((points - level.min) / (next.min - level.min)) * 100, 100)
    : 100;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero: Points & Level ──────────────────────────────────────── */}
      <View style={[styles.heroCard, { borderColor: level.color + '40' }]}>
        {/* Level badge */}
        <View style={[styles.levelRing, { borderColor: level.color }]}>
          <View style={[styles.levelDot, { backgroundColor: level.color }]}>
            <Text style={styles.levelAbbr}>{level.abbr}</Text>
          </View>
        </View>

        <View style={styles.heroMid}>
          <Text style={[styles.levelName, { color: level.color }]}>{level.name} Level</Text>
          <Text style={styles.heroPoints}>{points}</Text>
          <Text style={styles.heroPtLabel}>punten</Text>
        </View>

        {next && (
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: next.color }]} />
            </View>
            <Text style={styles.progressHint}>{next.min - points} punten tot {next.name}</Text>
          </View>
        )}
      </View>

      {/* ── Earn actions ─────────────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="stars" size={22} color={C.warning} />
          <Text style={styles.cardTitle}>Punten verdienen</Text>
        </View>
        <View style={styles.earnGrid}>
          {EARN_ACTIONS.map(({ icon, text, pts, color }) => (
            <View key={icon} style={styles.earnRow}>
              <View style={[styles.earnIcon, { backgroundColor: color + '18' }]}>
                <Icon name={icon} size={18} color={color} />
              </View>
              <Text style={styles.earnText}>{text}</Text>
              <View style={[styles.earnPtsBadge, { backgroundColor: color + '18' }]}>
                <Text style={[styles.earnPts, { color }]}>{pts}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── Daily Streak ─────────────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="local-fire-department" size={22} color={C.red} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Dagelijkse Streak</Text>
            <Text style={styles.cardSub}>Kom elke dag terug</Text>
          </View>
          <View style={styles.streakBig}>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakDayLabel}>{streak === 1 ? 'dag' : 'dagen'}</Text>
          </View>
        </View>

        <View style={styles.dotRow}>
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <View key={d} style={[styles.dot, d <= streak && styles.dotActive]}>
              {d <= streak
                ? <Icon name="local-fire-department" size={14} color={C.white} />
                : <Text style={styles.dotTxt}>{d}</Text>}
            </View>
          ))}
        </View>

        <View style={styles.streakTip}>
          <Icon name="info" size={14} color={C.grey} style={{ marginTop: 1 }} />
          <Text style={styles.streakTipTxt}>
            {streak >= 7
              ? 'Geweldig! 7 dagen op rij gescoord!'
              : streak >= 3
              ? `Nog ${7 - streak} dagen voor je 7-daagse badge!`
              : 'Kom morgen terug om je streak te verlengen.'}
          </Text>
        </View>
      </View>

      {/* ── Badges ───────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="emoji-events" size={22} color={C.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Badges</Text>
            <Text style={styles.cardSub}>{BADGES.filter(b => b.req(stats)).length}/{BADGES.length} behaald</Text>
          </View>
        </View>

        <View style={styles.badgeGrid}>
          {BADGES.map(badge => {
            const earned = badge.req(stats);
            return (
              <View key={badge.id} style={[styles.badgeItem, earned && styles.badgeItemEarned]}>
                <View style={[styles.badgeIconWrap, earned ? { backgroundColor: C.red + '18' } : { backgroundColor: C.lightGrey }]}>
                  <Icon name={badge.icon} size={28} color={earned ? C.red : C.grey} />
                </View>
                <Text style={[styles.badgeName, !earned && { color: C.grey }]}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
                {earned && (
                  <View style={styles.earnedPill}>
                    <Icon name="check" size={10} color={C.white} />
                    <Text style={styles.earnedTxt}>Behaald</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:   { flex: 1, backgroundColor: C.lightGrey },
  content:  { padding: 16, gap: 14 },

  // Hero card
  heroCard: {
    backgroundColor: C.white,
    borderRadius: R.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  levelRing: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  levelDot: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
  },
  levelAbbr: { color: C.white, fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 16, fontWeight: '800' },
  heroMid: { alignItems: 'center', marginBottom: 16 },
  levelName: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 14, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  heroPoints: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 52, fontWeight: '800', color: C.dark, lineHeight: 58 },
  heroPtLabel: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 14, color: C.grey, fontWeight: '500' },
  progressSection: { width: '100%' },
  progressTrack: { height: 8, backgroundColor: C.lightGrey, borderRadius: R.full, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: R.full },
  progressHint: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 11, color: C.grey, textAlign: 'center' },

  // Generic card
  card: {
    backgroundColor: C.white,
    borderRadius: R.xl,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardTitle: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 16, fontWeight: '700', color: C.dark },
  cardSub:   { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 12, color: C.grey, marginTop: 1 },

  // Earn actions
  earnGrid: { gap: 10 },
  earnRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  earnIcon: { width: 38, height: 38, borderRadius: R.md, justifyContent: 'center', alignItems: 'center' },
  earnText: { flex: 1, fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 14, color: C.dark, fontWeight: '500' },
  earnPtsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full },
  earnPts: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 13, fontWeight: '800' },

  // Streak
  streakBig: { alignItems: 'center' },
  streakNum: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 36, fontWeight: '800', color: C.dark, lineHeight: 40 },
  streakDayLabel: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 11, color: C.grey },
  dotRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, gap: 4 },
  dot: {
    flex: 1, height: 36, borderRadius: R.md,
    backgroundColor: C.lightGrey, justifyContent: 'center', alignItems: 'center',
  },
  dotActive: { backgroundColor: C.red },
  dotTxt: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 12, color: C.grey, fontWeight: '700' },
  streakTip: { flexDirection: 'row', gap: 6, backgroundColor: C.lightGrey, borderRadius: R.md, padding: 10 },
  streakTipTxt: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 12, color: C.dark, flex: 1 },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: {
    width: '47%',
    backgroundColor: C.lightGrey,
    borderRadius: R.lg, padding: 14,
    alignItems: 'center', gap: 5,
    opacity: 0.5,
  },
  badgeItemEarned: { opacity: 1, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  badgeIconWrap: {
    width: 52, height: 52, borderRadius: R.lg,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  badgeName: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 12, fontWeight: '700', color: C.dark, textAlign: 'center' },
  badgeDesc: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 10, color: C.grey, textAlign: 'center' },
  earnedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.success, borderRadius: R.full,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 2,
  },
  earnedTxt: { fontFamily: 'Open Sans, system-ui, sans-serif', fontSize: 10, fontWeight: '700', color: C.white },
});
