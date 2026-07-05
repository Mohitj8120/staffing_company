import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const PLANS = [
  {
    name: 'Free Starter',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for a quick update or testing out our AI neural parser.',
    resumes: '3 Resumes Total',
    features: [
      '3 Tailored Resumes total',
      'ATS score optimization check',
      'Standard template output',
      'PDF direct download link',
      'Academic scores retention'
    ],
    color: '#9494a8',
    gradient: ['rgba(148, 148, 168, 0.08)', 'rgba(148, 148, 168, 0.02)'],
    borderGlow: 'rgba(148, 148, 168, 0.15)',
    popular: false,
    badgeText: 'Basic'
  },
  {
    name: 'Starter Pro',
    price: '₹449',
    period: 'month',
    description: 'Designed for active job seekers targeting multiple fields.',
    resumes: '5 Resumes Daily',
    features: [
      '5 Tailored Resumes daily',
      'Custom PDF filenames',
      'Advanced ATS tailoring (STAR)',
      'Direct system download',
      'No background delay',
      'Chrome Extension access'
    ],
    color: '#00e5ff',
    gradient: ['rgba(0, 229, 255, 0.12)', 'rgba(0, 229, 255, 0.02)'],
    borderGlow: 'rgba(0, 229, 255, 0.25)',
    popular: false,
    badgeText: 'Active'
  },
  {
    name: 'Elite Executive',
    price: '₹849',
    period: 'month',
    description: 'Our most popular plan for power users and competitive SDE applications.',
    resumes: '12 Resumes Daily',
    features: [
      '12 Tailored Resumes daily',
      'Magic Redesign templates 🪄',
      'Full ATS keyword optimization',
      'Highest AI queue priority',
      'Dedicated profile storage',
      'Certification link injections'
    ],
    color: '#8a2be2',
    gradient: ['rgba(138, 43, 226, 0.18)', 'rgba(138, 43, 226, 0.03)'],
    borderGlow: 'rgba(138, 43, 226, 0.45)',
    popular: true,
    badgeText: 'Best Choice'
  },
  {
    name: 'Infinite Apex',
    price: '₹1149',
    period: 'month',
    description: 'Ultimate power plan for consultants and high-volume applications.',
    resumes: '25 Resumes Daily',
    features: [
      '25 Tailored Resumes daily',
      'All features of Elite Executive',
      'Multiple base profile storage',
      '1-on-1 review discount',
      'Unlimited download rebuilds',
      'Priority customer support'
    ],
    color: '#ffaa00',
    gradient: ['rgba(255, 170, 0, 0.15)', 'rgba(255, 100, 0, 0.02)'],
    borderGlow: 'rgba(255, 170, 0, 0.45)',
    popular: false,
    badgeText: 'Ultimate'
  }
];

export default function PricingTab() {
  const handlePurchase = (planName) => {
    Alert.alert(
      'Upgrade Plan ⚡',
      `Would you like to subscribe to the ${planName} plan? Payment gateway integration is coming soon.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient
      colors={[theme.bgGradientStart, theme.bgGradientEnd]}
      style={styles.container}
    >
      {/* Decorative Blur Blobs */}
      <View style={styles.glowBlobLeft} />
      <View style={styles.glowBlobRight} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header section */}
        <View style={styles.header}>
          <LinearGradient
            colors={theme.gradientPrimary}
            style={styles.badge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.badgeText}>PLANS & SUBSCIPTIONS</Text>
          </LinearGradient>
          <Text style={styles.title}>
            Choose Your <Text style={styles.accentText}>Neural Limit</Text>
          </Text>
          <Text style={styles.subtitle}>
            Scale up your tailoring capacity to get matching competitive edge.
          </Text>
        </View>

        {/* List of pricing cards */}
        {PLANS.map((plan) => (
          <LinearGradient
            key={plan.name}
            colors={plan.gradient}
            style={[
              styles.card,
              { borderColor: plan.borderGlow },
              plan.popular && styles.popularCard
            ]}
          >
            {/* Plan Badge */}
            <View style={styles.cardHeader}>
              <Text style={[styles.planBadgeText, { color: plan.color }]}>
                ✦ {plan.badgeText.toUpperCase()}
              </Text>
              {plan.popular && (
                <LinearGradient
                  colors={theme.gradientPrimary}
                  style={styles.popularBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </LinearGradient>
              )}
            </View>

            {/* Plan Name & Desc */}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDesc}>{plan.description}</Text>

            {/* Price section */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>/{plan.period}</Text>
            </View>

            <Text style={[styles.resumesLimit, { color: plan.color }]}>
              ⚡ {plan.resumes}
            </Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Features list */}
            <View style={styles.featuresContainer}>
              {plan.features.map((feat) => (
                <View key={feat} style={styles.featureRow}>
                  <View style={[styles.checkCircle, { borderColor: plan.borderGlow }]}>
                    <Text style={[styles.checkText, { color: plan.color }]}>✓</Text>
                  </View>
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>

            {/* Action button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePurchase(plan.name)}
              style={styles.buttonWrapper}
            >
              {plan.popular ? (
                <LinearGradient
                  colors={theme.gradientPrimary}
                  style={styles.btnPopular}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.btnText}>Upgrade Now</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.btnOutline, { borderColor: plan.borderGlow }]}>
                  <Text style={styles.btnOutlineText}>
                    {plan.price === '₹0' ? 'Get Started' : 'Subscribe'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgDark,
  },
  glowBlobLeft: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    top: 50,
    left: -100,
    zIndex: 0,
  },
  glowBlobRight: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    bottom: 100,
    right: -100,
    zIndex: 0,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: theme.textMain,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  accentText: {
    color: theme.secondary,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  popularBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planName: {
    color: theme.textMain,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  planDesc: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    color: theme.textMain,
    fontSize: 32,
    fontWeight: '800',
  },
  period: {
    color: theme.textMuted,
    fontSize: 14,
    marginLeft: 4,
  },
  resumesLimit: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 18,
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 10,
    fontWeight: '800',
  },
  featureText: {
    color: '#d1d1e0',
    fontSize: 12.5,
  },
  buttonWrapper: {
    width: '100%',
  },
  btnPopular: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  btnOutline: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  btnOutlineText: {
    color: theme.textMain,
    fontWeight: '700',
    fontSize: 14,
  },
});
