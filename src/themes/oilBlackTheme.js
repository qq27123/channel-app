/**
 * 油黑主题样式系统
 * 统一管理所有页面的油黑主题设计规范
 */

// 核心颜色系统
export const OilBlackColors = {
  // 主要背景色
  background: {
    primary: '#0C0C0C',          // 油黑主色
    secondary: '#1A1A1A',        // 渐变次色
    gradient: ['#0C0C0C', '#1A1A1A', '#0C0C0C'], // 背景渐变
  },
  
  // 半透明覆盖层
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',    // 最浅
    medium: 'rgba(255, 255, 255, 0.08)',   // 中等
    heavy: 'rgba(255, 255, 255, 0.12)',    // 较重
    strong: 'rgba(255, 255, 255, 0.15)',   // 最重
  },
  
  // 边框颜色
  border: {
    light: 'rgba(255, 255, 255, 0.1)',     // 浅边框
    medium: 'rgba(255, 255, 255, 0.15)',   // 中等边框
    heavy: 'rgba(255, 255, 255, 0.2)',     // 重边框
    accent: 'rgba(0, 122, 255, 0.4)',      // 强调边框
  },
  
  // 文字颜色
  text: {
    primary: '#FFFFFF',       // 主要文字 - 纯白
    secondary: '#CCCCCC',     // 次要文字 - 浅灰
    tertiary: '#999999',      // 辅助文字 - 中灰
    disabled: '#666666',      // 禁用文字 - 深灰
  },
  
  // 图标颜色
  icon: {
    primary: '#CCCCCC',       // 主要图标
    secondary: '#999999',     // 次要图标
    disabled: '#666666',      // 禁用图标
  },
  
  // 状态颜色
  status: {
    success: '#34C759',       // 成功
    warning: '#FF9500',       // 警告
    error: '#FF3B30',         // 错误
    info: '#007AFF',          // 信息
  }
};

// 阴影系统
export const OilBlackShadows = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  }
};

// 通用容器样式
export const OilBlackContainers = {
  // 主容器
  main: {
    flex: 1,
  },
  
  // 渐变容器
  gradient: {
    flex: 1,
  },
  
  // 玻璃态卡片
  glassCard: {
    backgroundColor: OilBlackColors.overlay.medium,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: OilBlackColors.border.medium,
    ...OilBlackShadows.heavy,
  },
  
  // 小玻璃态卡片
  glassCardSmall: {
    backgroundColor: OilBlackColors.overlay.medium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: OilBlackColors.border.light,
    ...OilBlackShadows.medium,
  },
  
  // 输入框容器
  inputContainer: {
    backgroundColor: OilBlackColors.overlay.heavy,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OilBlackColors.border.heavy,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  
  // 分隔线
  separator: {
    height: 1,
    backgroundColor: OilBlackColors.border.light,
  },
  
  // 空状态容器
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  }
};

// 文字样式
export const OilBlackText = {
  // 标题
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: OilBlackColors.text.primary,
  },
  
  // 副标题
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: OilBlackColors.text.primary,
  },
  
  // 正文
  body: {
    fontSize: 16,
    color: OilBlackColors.text.primary,
    lineHeight: 22,
  },
  
  // 次要正文
  bodySecondary: {
    fontSize: 16,
    color: OilBlackColors.text.secondary,
    lineHeight: 22,
  },
  
  // 标签
  caption: {
    fontSize: 14,
    color: OilBlackColors.text.secondary,
  },
  
  // 小标签
  captionSmall: {
    fontSize: 12,
    color: OilBlackColors.text.tertiary,
  },
  
  // 时间戳
  timestamp: {
    fontSize: 12,
    color: OilBlackColors.text.tertiary,
  }
};

// 按钮样式
export const OilBlackButtons = {
  // 主要按钮
  primary: {
    backgroundColor: OilBlackColors.status.info,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 次要按钮
  secondary: {
    backgroundColor: OilBlackColors.overlay.medium,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: OilBlackColors.border.medium,
  },
  
  // 危险按钮
  danger: {
    backgroundColor: OilBlackColors.status.error,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 圆形按钮
  rounded: {
    backgroundColor: OilBlackColors.status.info,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
};

// 输入框样式
export const OilBlackInputs = {
  // 基础输入框
  base: {
    backgroundColor: OilBlackColors.overlay.heavy,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: OilBlackColors.border.heavy,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: OilBlackColors.text.primary,
  },
  
  // 搜索框
  search: {
    backgroundColor: OilBlackColors.overlay.heavy,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OilBlackColors.border.heavy,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: OilBlackColors.text.primary,
  },
  
  // 多行输入框
  multiline: {
    backgroundColor: OilBlackColors.overlay.heavy,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: OilBlackColors.border.heavy,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: OilBlackColors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  }
};

// 布局样式
export const OilBlackLayouts = {
  // 页面容器
  screen: {
    flex: 1,
    backgroundColor: OilBlackColors.background.primary,
  },
  
  // 内容区域
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  
  // 头部区域
  header: {
    backgroundColor: OilBlackColors.overlay.medium,
    borderBottomWidth: 1,
    borderBottomColor: OilBlackColors.border.medium,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  
  // 底部区域
  footer: {
    backgroundColor: OilBlackColors.overlay.medium,
    borderTopWidth: 1,
    borderTopColor: OilBlackColors.border.medium,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  
  // 行布局
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // 列布局
  column: {
    flexDirection: 'column',
  },
  
  // 居中布局
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 间距布局
  spaceBetween: {
    justifyContent: 'space-between',
  }
};

// 通用间距
export const OilBlackSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// 通用圆角
export const OilBlackBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 50,
};

// 导出默认主题对象
export const OilBlackTheme = {
  colors: OilBlackColors,
  shadows: OilBlackShadows,
  containers: OilBlackContainers,
  text: OilBlackText,
  buttons: OilBlackButtons,
  inputs: OilBlackInputs,
  layouts: OilBlackLayouts,
  spacing: OilBlackSpacing,
  borderRadius: OilBlackBorderRadius,
};

export default OilBlackTheme;