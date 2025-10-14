// Firebase服务封装
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

import { auth, db, isFirebaseConfigured } from '../config/firebase';

// 🔐 认证服务
export const AuthService = {
  // 登录
  async signIn(email, password) {
    // ⚠️ 如果Firebase未配置，返回错误提示
    if (!isFirebaseConfigured || !auth) {
      console.warn('⚠️ Firebase未配置，无法使用Firebase认证');
      return { 
        success: false, 
        error: 'Firebase未配置，请使用本地存储模式' 
      };
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('🎉 用户登录成功:', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      return { success: false, error: FirebaseHelper.handleError(error) };
    }
  },

  // 注册
  async signUp(email, password, displayName = null) {
    // ⚠️ 如果Firebase未配置，返回错误提示
    if (!isFirebaseConfigured || !auth) {
      console.warn('⚠️ Firebase未配置，无法使用Firebase认证');
      return { 
        success: false, 
        error: 'Firebase未配置，请使用本地存储模式' 
      };
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 更新用户显示名称
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      console.log('🎉 用户注册成功:', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ 注册失败:', error.message);
      return { success: false, error: FirebaseHelper.handleError(error) };
    }
  },

  // 登出
  async signOut() {
    if (!isFirebaseConfigured || !auth) {
      return { success: true }; // 本地模式下直接返回成功
    }
    
    try {
      await signOut(auth);
      console.log('👋 用户已登出');
      return { success: true };
    } catch (error) {
      console.error('❌ 登出失败:', error.message);
      return { success: false, error: FirebaseHelper.handleError(error) };
    }
  },

  // 监听认证状态变化
  onAuthStateChanged(callback) {
    if (!isFirebaseConfigured || !auth) {
      // 本地模式下，直接返回空用户
      callback(null);
      return () => {}; // 返回空的取消订阅函数
    }
    
    return onAuthStateChanged(auth, (user) => {
      console.log('🔄 认证状态变化:', user ? `用户: ${user.uid}` : '未登录');
      callback(user);
    });
  },

  // 获取当前用户
  getCurrentUser() {
    if (!isFirebaseConfigured || !auth) {
      return null;
    }
    return auth.currentUser;
  }
};

// 🗄️ 数据库服务
export const DatabaseService = {
  // 创建文档
  async create(collectionName, data, customId = null) {
    try {
      let result;
      
      if (customId) {
        // 使用自定义ID创建文档
        const docRef = doc(db, collectionName, customId);
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp()
        });
        result = { id: customId };
      } else {
        // 自动生成ID
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp()
        });
        result = { id: docRef.id };
      }
      
      console.log(`✅ 文档创建成功: ${collectionName}/${result.id}`);
      return { success: true, id: result.id };
    } catch (error) {
      console.error(`❌ 文档创建失败 (${collectionName}):`, error.message);
      return { success: false, error: FirebaseHelper.handleError(error) };
    }
  },

  // 更新文档
  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      console.log(`✅ 文档更新成功: ${collectionName}/${docId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ 文档更新失败 (${collectionName}/${docId}):`, error.message);
      return { success: false, error: FirebaseHelper.handleError(error) };
    }
  },

  // 删除文档
  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      console.log(`✅ 文档删除成功: ${collectionName}/${docId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ 文档删除失败 (${collectionName}/${docId}):`, error.message);
      return { success: false, error: FirebaseHelper.handleError(error) };
    }
  },

  // 获取单个文档
  async getDoc(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        console.log(`✅ 文档获取成功: ${collectionName}/${docId}`);
        return { success: true, data };
      } else {
        console.warn(`⚠️ 文档不存在: ${collectionName}/${docId}`);
        return { success: false, error: '文档不存在' };
      }
    } catch (error) {
      console.error(`❌ 文档获取失败 (${collectionName}/${docId}):`, error.message);
      return { success: false, error: FirebaseHelper.handleError(error) };
    }
  },

  // 获取集合数据
  async getCollection(collectionName, conditions = []) {
    try {
      let q = collection(db, collectionName);
      
      // 添加查询条件
      conditions.forEach(condition => {
        if (condition.type === 'where') {
          q = query(q, where(condition.field, condition.operator, condition.value));
        } else if (condition.type === 'orderBy') {
          q = query(q, orderBy(condition.field, condition.direction || 'desc'));
        }
      });
      
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ 集合数据获取成功: ${collectionName} (${data.length}条)`);
      return { success: true, data };
    } catch (error) {
      console.error(`❌ 集合数据获取失败 (${collectionName}):`, error.message);
      return { success: false, error: FirebaseHelper.handleError(error) };
    }
  },

  // 实时监听集合数据
  onCollectionSnapshot(collectionName, callback, conditions = []) {
    try {
      let q = collection(db, collectionName);
      
      // 添加查询条件
      conditions.forEach(condition => {
        if (condition.type === 'where') {
          q = query(q, where(condition.field, condition.operator, condition.value));
        } else if (condition.type === 'orderBy') {
          q = query(q, orderBy(condition.field, condition.direction || 'desc'));
        }
      });
      
      console.log(`🔄 开始监听集合: ${collectionName}`);
      
      return onSnapshot(q, (snapshot) => {
        const data = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`🔄 集合数据更新: ${collectionName} (${data.length}条)`);
        callback(data);
      }, (error) => {
        console.error(`❌ 集合监听失败 (${collectionName}):`, error.message);
        callback([]);
      });
    } catch (error) {
      console.error(`❌ 集合监听设置失败 (${collectionName}):`, error.message);
      return () => {}; // 返回空的取消订阅函数
    }
  },

  // 实时监听单个文档
  onDocSnapshot(collectionName, docId, callback) {
    try {
      const docRef = doc(db, collectionName, docId);
      
      console.log(`🔄 开始监听文档: ${collectionName}/${docId}`);
      
      return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() };
          console.log(`🔄 文档数据更新: ${collectionName}/${docId}`);
          callback(data);
        } else {
          console.warn(`⚠️ 监听的文档不存在: ${collectionName}/${docId}`);
          callback(null);
        }
      }, (error) => {
        console.error(`❌ 文档监听失败 (${collectionName}/${docId}):`, error.message);
        callback(null);
      });
    } catch (error) {
      console.error(`❌ 文档监听设置失败 (${collectionName}/${docId}):`, error.message);
      return () => {}; // 返回空的取消订阅函数
    }
  }
};

// 🛠️ Firebase辅助函数
export const FirebaseHelper = {
  // 手机号转邮箱格式（用于Firebase认证）
  phoneToEmail(phone) {
    // 移除手机号中的特殊字符，只保留数字
    const cleanPhone = phone.replace(/\D/g, '');
    return `${cleanPhone}@channelapp.local`;
  },

  // 邮箱转手机号
  emailToPhone(email) {
    return email.replace('@channelapp.local', '');
  },

  // 验证手机号格式
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 验证密码强度
  validatePassword(password) {
    if (password.length < 6) {
      return { valid: false, message: '密码长度至少6位' };
    }
    if (password.length > 20) {
      return { valid: false, message: '密码长度不能超过20位' };
    }
    return { valid: true, message: '密码格式正确' };
  },

  // 处理Firebase错误
  handleError(error) {
    const errorMessages = {
      // 认证错误
      'auth/invalid-email': '邮箱格式无效',
      'auth/user-disabled': '用户账户已被禁用',
      'auth/user-not-found': '用户不存在',
      'auth/wrong-password': '密码错误',
      'auth/email-already-in-use': '该手机号已被注册',
      'auth/weak-password': '密码强度太弱，至少需要6位',
      'auth/network-request-failed': '网络连接失败，请检查网络',
      'auth/too-many-requests': '登录尝试次数过多，请稍后再试',
      'auth/operation-not-allowed': '该登录方式未启用',
      'auth/invalid-credential': '登录凭据无效',
      
      // Firestore错误
      'permission-denied': '权限不足，请检查安全规则',
      'unavailable': '服务暂时不可用，请稍后重试',
      'deadline-exceeded': '请求超时，请检查网络连接',
      'resource-exhausted': '配额已用尽，请联系管理员',
      'failed-precondition': '操作失败，请重试',
      'aborted': '操作被中止，请重试',
      'out-of-range': '参数超出范围',
      'unimplemented': '功能尚未实现',
      'internal': '内部服务器错误',
      'data-loss': '数据丢失或损坏',
      
      // 网络错误
      'network-request-failed': '网络请求失败，请检查网络连接'
    };

    const message = errorMessages[error.code] || error.message || '未知错误';
    
    // 开发环境下输出详细错误信息
    if (__DEV__) {
      console.error('🔥 Firebase错误详情:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    }

    return message;
  },

  // 格式化时间戳
  formatTimestamp(timestamp) {
    if (!timestamp) return null;
    
    // Firebase Timestamp 转 JavaScript Date
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // 普通时间戳
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // 字符串时间戳
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    return timestamp;
  },

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// 🧪 Firebase连接测试
export const testFirebaseConnection = async () => {
  console.log('🔥 开始测试Firebase连接...');
  
  try {
    // 测试数据库写入
    const testData = {
      message: 'Firebase连接测试',
      timestamp: new Date().toISOString(),
      testId: FirebaseHelper.generateId()
    };
    
    const result = await DatabaseService.create('_test', testData);
    
    if (result.success) {
      console.log('✅ Firebase连接成功！');
      console.log('📋 测试文档ID:', result.id);
      
      // 测试数据读取
      const readResult = await DatabaseService.getDoc('_test', result.id);
      if (readResult.success) {
        console.log('✅ 数据读取成功！');
      }
      
      // 清理测试数据
      await DatabaseService.delete('_test', result.id);
      console.log('🗑️ 测试数据已清理');
      
      return true;
    } else {
      console.error('❌ Firebase连接失败:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase测试异常:', error);
    return false;
  }
};

// 默认导出
export default {
  AuthService,
  DatabaseService,
  FirebaseHelper,
  testFirebaseConnection
};