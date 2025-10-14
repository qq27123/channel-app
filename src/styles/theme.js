/**
 * 玻璃态渐变主题配置
 * Glassmorphism Theme Configuration
 */

// 渐变色彩方案
export const gradients = {
  // 紫色系 - 神秘优雅
  purple: ['#9D50BB', '#6E48AA'],
  purpleLight: ['#C471ED', '#9D50BB'],
  
  // 粉色系 - 活力温暖
  pink: ['#FF6B9D', '#C44569'],
  pinkLight: ['#FFB6C1', '#FF6B9D'],
  
  // 橙色系 - 热情活力
  orange: ['#FF9A56', '#FF6B6B'],
  orangeLight: ['#FFBE76', '#FF9A56'],
  
  // 蓝色系 - 科技清新
  blue: ['#4E54C8', '#8F94FB'],
  blueLight: ['#667EEA', '#4E54C8'],
  
  // 青色系 - 清新舒适
  cyan: ['#11998E', '#38EF7D'],
  cyanLight: ['#38EF7D', '#11998E'],
  
  // 组合渐变 - 多彩炫酷
  rainbow: ['#FA709A', '#FEE140'],
  sunset: ['#FF9A56', '#FF6B9D', '#C44569'],
  aurora: ['#4E54C8', '#8F94FB', '#38EF7D'],
};

// 玻璃态效果配置
export const glassMorphism = {
  // 标准玻璃效果
  standard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  // 深色玻璃效果
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // 浅色玻璃效果
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  // 强效玻璃效果
  strong: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
};

// 阴影效果
export const shadows = {
  // 柔和阴影
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  
  // 中等阴影
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  
  // 强烈阴影
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  
  // 彩色阴影
  colorful: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// 圆角配置
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  round: 50,
};

// 间距配置
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// 字体配置
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
};

// 颜色配置
export const colors = {
  // 主色调
  primary: '#8F94FB',
  primaryDark: '#4E54C8',
  primaryLight: '#A8ADF8',
  
  // 辅助色
  secondary: '#FF6B9D',
  secondaryDark: '#C44569',
  secondaryLight: '#FF8BB0',
  
  // 强调色
  accent: '#38EF7D',
  accentDark: '#11998E',
  accentLight: '#5FF39E',
  
  // 中性色
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // 语义色
  success: '#38EF7D',
  warning: '#FFBE76',
  error: '#FF6B6B',
  info: '#667EEA',
  
  // 背景色
  background: '#F8F9FD',
  backgroundDark: '#1A1A2E',
  surface: '#FFFFFF',
  
  // 文本色
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textWhite: '#FFFFFF',
};

export default {
  gradients,
  glassMorphism,
  shadows,
  borderRadius,
  spacing,
  typography,
  colors,
};
