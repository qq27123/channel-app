// 环境变量配置加载工具
import Constants from 'expo-constants';

// 从环境变量中获取配置
const getConfig = (key, defaultValue = null) => {
  // 首先尝试从环境变量获取
  if (process.env[key] !== undefined) {
    return process.env[key];
  }
  
  // 然后尝试从Expo常量获取
  if (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra[key] !== undefined) {
    return Constants.expoConfig.extra[key];
  }
  
  // 最后返回默认值
  return defaultValue;
};

// Firebase配置
export const firebaseConfig = {
  apiKey: getConfig('FIREBASE_API_KEY'),
  authDomain: getConfig('FIREBASE_AUTH_DOMAIN'),
  projectId: getConfig('FIREBASE_PROJECT_ID'),
  storageBucket: getConfig('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getConfig('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getConfig('FIREBASE_APP_ID'),
  measurementId: getConfig('FIREBASE_MEASUREMENT_ID'),
};

// 应用配置
export const appConfig = {
  env: getConfig('APP_ENV', 'development'),
  name: getConfig('APP_NAME', 'Default App'),
  version: getConfig('APP_VERSION', '1.0.0'),
  debug: getConfig('DEBUG', false) === 'true' || getConfig('DEBUG', false) === true,
  logLevel: getConfig('LOG_LEVEL', 'info'),
  contactEmail: getConfig('CONTACT_EMAIL', 'support@example.com'),
};

// 数据库配置
export const databaseConfig = {
  local: {
    host: getConfig('LOCAL_DB_HOST', 'localhost'),
    port: getConfig('LOCAL_DB_PORT', '5432'),
    name: getConfig('LOCAL_DB_NAME', 'default_db'),
    user: getConfig('LOCAL_DB_USER', 'default_user'),
    password: getConfig('LOCAL_DB_PASSWORD', ''),
  },
};

// 检查Firebase是否已配置
export const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey.length > 10 && 
  firebaseConfig.projectId.length > 5;

// 检查是否为开发环境
export const isDevelopment = appConfig.env === 'development';

// 检查是否启用调试模式
export const isDebug = appConfig.debug;

export default {
  firebaseConfig,
  appConfig,
  databaseConfig,
  isFirebaseConfigured,
  isDevelopment,
  isDebug,
};