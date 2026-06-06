import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../constants/Colors';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ScoreCircle({ score, size = 'md', showLabel = true }: ScoreCircleProps) {
  const getColor = (s: number) => {
    if (s >= 75) return Colors.secondary;
    if (s >= 50) return Colors.warning;
    return Colors.danger;
  };

  const sizeMap = {
    sm: { outer: 48, font: FontSize.md, sub: FontSize.xs },
    md: { outer: 64, font: FontSize.xl, sub: FontSize.xs },
    lg: { outer: 88, font: FontSize.xxl, sub: FontSize.sm },
  };

  const dim = sizeMap[size];
  const color = getColor(score);

  return (
    <View style={[styles.outer, {
      width: dim.outer,
      height: dim.outer,
      borderRadius: dim.outer / 2,
      borderColor: color,
    }]}>
      <Text style={[styles.score, { fontSize: dim.font, color }]}>{score}</Text>
      {showLabel && <Text style={[styles.label, { fontSize: dim.sub }]}>/100</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  score: {
    fontWeight: '700',
    lineHeight: undefined,
  },
  label: {
    color: Colors.textSecondary,
    marginTop: -2,
  },
});
