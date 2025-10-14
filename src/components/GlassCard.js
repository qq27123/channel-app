/**
 * 玻璃态卡片组件
 * Glass Morphism Card Component
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { glassMorphism, shadows, borderRadius, spacing } from '../styles/theme';

export const GlassCard = ({ 
  children, 
  style, 
  gradient = null,
  glassType = 'standard',
  shadowType = 'soft',
  ...props 
}) => {
  const glassStyle = glassMorphism[glassType] || glassMorphism.standard;
  const shadowStyle = shadows[shadowType] || shadows.soft;

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          shadowStyle,
          style,
        ]}
        {...props}
      >
        <View style={[styles.glassOverlay, glassStyle]}>
          {children}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        glassStyle,
        shadowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  glassOverlay: {
    flex: 1,
    borderRadius: borderRadius.large,
  },
});

export default GlassCard;
