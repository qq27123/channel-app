# 📦 Firebase依赖包安装指南

## 🎯 需要安装的包

我们需要安装以下Firebase相关的npm包：

```bash
# Firebase核心包
npm install firebase

# 可选：React Native Firebase (性能更好，但配置复杂)
# npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

## 🚀 推荐方案：使用Web SDK

考虑到你的项目是用Expo构建的，我推荐使用Firebase Web SDK，因为：

✅ **优势**：
- 配置简单，无需原生配置
- 与Expo完美兼容
- 支持所有平台（Web/iOS/Android）
- 无需ejecting Expo

⚠️ **注意**：
- 性能略低于原生SDK
- 包体积稍大

## 📋 安装步骤

### 第一步：安装Firebase SDK

```bash
# 在项目根目录执行
npm install firebase
```

### 第二步：验证安装

安装完成后，检查package.json：

```json
{
  "dependencies": {
    "firebase": "^10.5.0",
    // ... 其他依赖
  }
}
```

### 第三步：创建Firebase配置文件

创建 `src/config/firebase.js`：

```javascript
// Firebase配置文件
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import Constants from 'expo-constants';

// Firebase项目配置
// 请替换为你的实际配置信息
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 初始化服务
export const auth = getAuth(app);
export const db = getFirestore(app);

// 开发环境连接模拟器 (可选)
if (__DEV__ && Constants.platform?.web) {
  // Web开发环境使用模拟器
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('模拟器连接失败，使用线上服务');
  }
}

export default app;
```

### 第四步：创建Firebase服务工具

创建 `src/services/firebaseService.js`：

```javascript
// Firebase服务封装
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
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
  serverTimestamp
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';

// 认证服务
export const AuthService = {
  // 登录
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 注册
  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 登出
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 监听认证状态
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// 数据库服务
export const DatabaseService = {
  // 创建文档
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
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
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 删除文档
  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 获取单个文档
  async getDoc(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        return { success: false, error: '文档不存在' };
      }
    } catch (error) {
      return { success: false, error: error.message };
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
          q = query(q, orderBy(condition.field, condition.direction));
        }
      });
      
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 实时监听集合数据
  onCollectionSnapshot(collectionName, callback, conditions = []) {
    let q = collection(db, collectionName);
    
    // 添加查询条件
    conditions.forEach(condition => {
      if (condition.type === 'where') {
        q = query(q, where(condition.field, condition.operator, condition.value));
      } else if (condition.type === 'orderBy') {
        q = query(q, orderBy(condition.field, condition.direction));
      }
    });
    
    return onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      callback(data);
    }, (error) => {
      console.error('监听数据失败:', error);
      callback([]);
    });
  }
};

// 辅助函数
export const FirebaseHelper = {
  // 手机号转邮箱格式（用于Firebase认证）
  phoneToEmail(phone) {
    return `${phone}@channelapp.local`;
  },

  // 邮箱转手机号
  emailToPhone(email) {
    return email.replace('@channelapp.local', '');
  },

  // 处理Firebase错误
  handleError(error) {
    const errorMessages = {
      'auth/invalid-email': '邮箱格式无效',
      'auth/user-disabled': '用户账户已被禁用',
      'auth/user-not-found': '用户不存在',
      'auth/wrong-password': '密码错误',
      'auth/email-already-in-use': '邮箱已被注册',
      'auth/weak-password': '密码强度太弱',
      'auth/network-request-failed': '网络连接失败',
      'permission-denied': '权限不足',
      'unavailable': '服务暂时不可用'
    };

    return errorMessages[error.code] || error.message || '未知错误';
  }
};
```

## 🔧 安装验证

创建 `src/test/firebaseTest.js` 用于测试连接：

```javascript
// Firebase连接测试
import { AuthService, DatabaseService } from '../services/firebaseService';

export const testFirebaseConnection = async () => {
  console.log('🔥 开始测试Firebase连接...');
  
  try {
    // 测试数据库写入
    const result = await DatabaseService.create('test', {
      message: 'Firebase连接测试',
      timestamp: new Date().toISOString()
    });
    
    if (result.success) {
      console.log('✅ Firebase连接成功！');
      console.log('测试文档ID:', result.id);
      
      // 清理测试数据
      await DatabaseService.delete('test', result.id);
      console.log('✅ 测试数据已清理');
      
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
```

## 📱 在App.js中测试

在App.js中添加测试代码：

```javascript
import React, { useEffect } from 'react';
import { testFirebaseConnection } from './src/test/firebaseTest';

export default function App() {
  useEffect(() => {
    // 开发环境下测试Firebase连接
    if (__DEV__) {
      testFirebaseConnection();
    }
  }, []);

  // ... 其他代码
}
```

## ✅ 安装完成检查

- [ ] firebase包已安装
- [ ] package.json中确认版本
- [ ] firebase.js配置文件已创建
- [ ] firebaseService.js服务文件已创建
- [ ] 测试文件已创建
- [ ] 在App.js中添加了测试代码

## 🆘 常见问题

### 问题1：npm install失败
```bash
# 清理缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm install firebase
```

### 问题2：Expo兼容性问题
```bash
# 确保使用兼容版本
npm install firebase@^10.5.0
```

### 问题3：配置信息从哪里获取
1. 打开Firebase控制台
2. 项目设置 > 常规
3. 你的应用 > Web应用
4. 复制配置对象

## 📞 下一步

完成安装后，告诉我：
1. "Firebase包安装完成"
2. 或遇到的任何错误信息

我会帮你进行Firebase项目配置和代码集成！

---

**预计完成时间：15-30分钟**
**难度等级：⭐⭐☆☆☆ (简单)**