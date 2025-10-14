# 🗄️ Firebase数据结构设计

## 📊 数据库架构概览

我们将使用Firestore作为主数据库，设计以下集合（Collections）：

```
channelapp-firestore/
├── users/              📋 用户信息
├── channels/           📢 频道数据  
├── messages/           💬 消息数据
├── subscriptions/      🔔 订阅关系
├── reports/            🛡️ 举报记录
├── categories/         🏷️ 分类管理
└── notifications/      📱 通知记录
```

---

## 👥 Users Collection (用户信息)

### 文档结构
```javascript
users/{userId}
{
  id: string,              // 用户唯一标识 (Firebase UID)
  phone: string,           // 手机号 (唯一)
  email: string,           // 转换后的邮箱格式 (用于Firebase Auth)
  nickname: string,        // 用户昵称
  avatar: string,          // 头像URL (可选)
  role: string,           // 用户角色: 'admin' | 'user'
  status: string,         // 账户状态: 'active' | 'disabled' | 'deleted'
  lastLoginAt: timestamp, // 最后登录时间
  createdAt: timestamp,   // 创建时间
  updatedAt: timestamp    // 更新时间
}
```

### 索引设计
```javascript
// 复合索引
phone (升序)              // 按手机号查询
role (升序)               // 按角色筛选
status (升序)             // 按状态筛选
createdAt (降序)          // 按创建时间排序
```

### 示例数据
```javascript
{
  id: "firebase-user-uid-123",
  phone: "13800138000",
  email: "13800138000@channelapp.local",
  nickname: "管理员",
  avatar: null,
  role: "admin",
  status: "active",
  lastLoginAt: "2025-01-13T10:00:00Z",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-13T10:00:00Z"
}
```

---

## 📢 Channels Collection (频道数据)

### 文档结构  
```javascript
channels/{channelId}
{
  id: string,              // 频道唯一标识
  title: string,           // 频道标题
  description: string,     // 频道描述
  category: string,        // 频道分类
  creatorId: string,       // 创建者用户ID
  creatorInfo: {          // 创建者信息 (冗余存储，提高查询性能)
    nickname: string,
    avatar: string
  },
  subscriberCount: number, // 订阅人数 (冗余字段，实时更新)
  messageCount: number,    // 消息数量 (冗余字段)
  lastMessageAt: timestamp,// 最后消息时间
  isPublic: boolean,       // 是否公开
  status: string,          // 频道状态: 'active' | 'archived' | 'deleted'
  settings: {             // 频道设置
    allowComments: boolean,
    allowImages: boolean,
    moderationEnabled: boolean
  },
  createdAt: timestamp,    // 创建时间
  updatedAt: timestamp     // 更新时间
}
```

### 索引设计
```javascript
// 单字段索引
category (升序)           // 按分类筛选
creatorId (升序)          // 查询用户创建的频道
status (升序)             // 按状态筛选
isPublic (升序)           // 公开/私有筛选

// 复合索引  
category (升序), createdAt (降序)        // 分类内按时间排序
creatorId (升序), status (升序)          // 用户频道按状态筛选
isPublic (升序), subscriberCount (降序)  // 公开频道按热度排序
```

### 示例数据
```javascript
{
  id: "channel_001",
  title: "科技前沿",
  description: "分享最新的科技资讯和趋势",
  category: "科技",
  creatorId: "firebase-user-uid-123",
  creatorInfo: {
    nickname: "管理员",
    avatar: null
  },
  subscriberCount: 156,
  messageCount: 23,
  lastMessageAt: "2025-01-13T09:30:00Z",
  isPublic: true,
  status: "active",
  settings: {
    allowComments: true,
    allowImages: true,
    moderationEnabled: false
  },
  createdAt: "2025-01-10T14:20:00Z",
  updatedAt: "2025-01-13T09:30:00Z"
}
```

---

## 💬 Messages Collection (消息数据)

### 文档结构
```javascript
messages/{messageId}
{
  id: string,              // 消息唯一标识
  channelId: string,       // 所属频道ID
  senderId: string,        // 发送者用户ID
  senderInfo: {           // 发送者信息 (冗余存储)
    nickname: string,
    avatar: string,
    role: string
  },
  content: string,         // 消息内容
  type: string,           // 消息类型: 'text' | 'image' | 'audio' | 'video'
  mediaUrl: string,       // 媒体文件URL (可选)
  replyTo: string,        // 回复的消息ID (可选)
  isEdited: boolean,      // 是否已编辑
  editedAt: timestamp,    // 编辑时间
  isDeleted: boolean,     // 是否已删除
  deletedAt: timestamp,   // 删除时间
  reactions: {            // 消息反应 (点赞等)
    like: number,
    dislike: number
  },
  createdAt: timestamp,   // 创建时间
  updatedAt: timestamp    // 更新时间
}
```

### 索引设计
```javascript
// 单字段索引
channelId (升序)          // 按频道查询消息
senderId (升序)           // 查询用户发送的消息
type (升序)              // 按消息类型筛选

// 复合索引
channelId (升序), createdAt (升序)     // 频道内按时间排序
channelId (升序), isDeleted (升序)     // 频道内有效消息
senderId (升序), createdAt (降序)      // 用户消息按时间排序
```

### 示例数据
```javascript
{
  id: "message_001",
  channelId: "channel_001", 
  senderId: "firebase-user-uid-123",
  senderInfo: {
    nickname: "管理员",
    avatar: null,
    role: "admin"
  },
  content: "欢迎大家关注科技前沿频道！",
  type: "text",
  mediaUrl: null,
  replyTo: null,
  isEdited: false,
  editedAt: null,
  isDeleted: false,
  deletedAt: null,
  reactions: {
    like: 5,
    dislike: 0
  },
  createdAt: "2025-01-13T09:30:00Z",
  updatedAt: "2025-01-13T09:30:00Z"
}
```

---

## 🔔 Subscriptions Collection (订阅关系)

### 文档结构
```javascript
subscriptions/{subscriptionId}
{
  id: string,              // 订阅关系唯一标识
  userId: string,          // 订阅者用户ID
  channelId: string,       // 被订阅的频道ID
  userInfo: {             // 订阅者信息 (冗余存储)
    nickname: string,
    avatar: string
  },
  channelInfo: {          // 频道信息 (冗余存储)
    title: string,
    category: string
  },
  status: string,         // 订阅状态: 'pending' | 'approved' | 'rejected'
  notificationEnabled: boolean, // 是否启用通知
  lastReadAt: timestamp,  // 最后阅读时间
  subscribeAt: timestamp, // 订阅时间
  approvedAt: timestamp,  // 审核通过时间
  rejectedAt: timestamp,  // 拒绝时间
  createdAt: timestamp,   // 创建时间
  updatedAt: timestamp    // 更新时间
}
```

### 索引设计
```javascript
// 单字段索引
userId (升序)             // 查询用户订阅
channelId (升序)          // 查询频道订阅者
status (升序)             // 按状态筛选

// 复合索引
userId (升序), status (升序)              // 用户订阅按状态筛选
channelId (升序), status (升序)           // 频道订阅者按状态筛选
userId (升序), subscribeAt (降序)         // 用户订阅按时间排序
```

### 示例数据
```javascript
{
  id: "subscription_001",
  userId: "firebase-user-uid-456",
  channelId: "channel_001",
  userInfo: {
    nickname: "用户A",
    avatar: null
  },
  channelInfo: {
    title: "科技前沿",
    category: "科技"
  },
  status: "approved",
  notificationEnabled: true,
  lastReadAt: "2025-01-13T09:25:00Z",
  subscribeAt: "2025-01-12T16:00:00Z",
  approvedAt: "2025-01-12T16:05:00Z",
  rejectedAt: null,
  createdAt: "2025-01-12T16:00:00Z",
  updatedAt: "2025-01-12T16:05:00Z"
}
```

---

## 🛡️ Reports Collection (举报记录)

### 文档结构
```javascript
reports/{reportId}
{
  id: string,              // 举报记录唯一标识
  reporterId: string,      // 举报者用户ID
  reporterInfo: {         // 举报者信息
    nickname: string,
    phone: string
  },
  targetType: string,     // 举报对象类型: 'message' | 'channel' | 'user'
  targetId: string,       // 被举报对象的ID
  targetInfo: {           // 被举报对象信息
    // 根据targetType动态包含不同字段
  },
  reason: string,         // 举报原因枚举值
  reasonText: string,     // 举报原因文本
  description: string,    // 详细描述 (可选)
  evidence: string[],     // 证据材料URLs (可选)
  status: string,         // 处理状态: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  handlerId: string,      // 处理者用户ID (可选)
  handlerInfo: {          // 处理者信息 (可选)
    nickname: string,
    role: string
  },
  handlerNote: string,    // 处理备注 (可选)
  resolution: string,     // 处理结果 (可选)
  resolvedAt: timestamp,  // 解决时间 (可选)
  createdAt: timestamp,   // 创建时间
  updatedAt: timestamp    // 更新时间
}
```

---

## 🏷️ Categories Collection (分类管理)

### 文档结构
```javascript
categories/{categoryId}
{
  id: string,              // 分类唯一标识
  name: string,           // 分类名称
  description: string,    // 分类描述
  icon: string,          // 分类图标
  color: string,         // 分类颜色
  order: number,         // 排序权重
  channelCount: number,  // 频道数量 (冗余字段)
  isDefault: boolean,    // 是否为默认分类
  isActive: boolean,     // 是否启用
  createdBy: string,     // 创建者用户ID
  createdAt: timestamp,  // 创建时间
  updatedAt: timestamp   // 更新时间
}
```

---

## 📱 Notifications Collection (通知记录)

### 文档结构
```javascript
notifications/{notificationId}
{
  id: string,              // 通知唯一标识
  userId: string,          // 接收者用户ID
  type: string,           // 通知类型: 'message' | 'subscription' | 'system'
  title: string,          // 通知标题
  body: string,           // 通知内容
  data: object,          // 附加数据 (包含跳转信息等)
  isRead: boolean,       // 是否已读
  readAt: timestamp,     // 阅读时间
  isDelivered: boolean,  // 是否已推送
  deliveredAt: timestamp,// 推送时间
  priority: string,      // 优先级: 'high' | 'normal' | 'low'
  expiresAt: timestamp,  // 过期时间
  createdAt: timestamp,  // 创建时间
  updatedAt: timestamp   // 更新时间
}
```

---

## 🔧 数据库配置

### 安全规则 (Firestore Security Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户数据 - 只能访问自己的
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 频道数据 - 认证用户可读，创建者可写
    match /channels/{channelId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.creatorId == request.auth.uid;
    }
    
    // 消息数据 - 认证用户可读写
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.senderId == request.auth.uid;
    }
    
    // 订阅关系 - 用户只能管理自己的订阅
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.channelCreatorId == request.auth.uid);
    }
    
    // 举报记录 - 举报者和管理员可访问
    match /reports/{reportId} {
      allow read, create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.reporterId == request.auth.uid || 
         getUserRole(request.auth.uid) == 'admin');
    }
    
    // 分类管理 - 所有人可读，管理员可写
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        getUserRole(request.auth.uid) == 'admin';
    }
    
    // 通知记录 - 用户只能访问自己的通知
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // 辅助函数：获取用户角色
    function getUserRole(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.role;
    }
  }
}
```

### 索引配置
```javascript
// 复合索引 (需要在Firebase控制台创建)
[
  {
    "collection": "channels",
    "fields": [
      { "field": "category", "mode": "ASCENDING" },
      { "field": "createdAt", "mode": "DESCENDING" }
    ]
  },
  {
    "collection": "messages", 
    "fields": [
      { "field": "channelId", "mode": "ASCENDING" },
      { "field": "createdAt", "mode": "ASCENDING" }
    ]
  },
  {
    "collection": "subscriptions",
    "fields": [
      { "field": "userId", "mode": "ASCENDING" },
      { "field": "status", "mode": "ASCENDING" }
    ]
  }
]
```

---

## 🚀 数据迁移策略

### 从内存存储迁移到Firestore

**步骤1：数据导出**
```javascript
// 导出现有内存数据
const exportCurrentData = () => {
  return {
    users: users,           // 用户数据
    channels: channels,     // 频道数据
    messages: chatData,     // 聊天数据
    subscriptions: userSubscriptions,
    categories: categories
  };
};
```

**步骤2：数据转换**
```javascript
// 转换数据格式以符合Firestore结构
const transformDataForFirestore = (memoryData) => {
  // 转换用户数据
  const transformedUsers = memoryData.users.map(user => ({
    ...user,
    email: FirebaseHelper.phoneToEmail(user.phone),
    status: 'active',
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  // ... 其他数据转换逻辑
};
```

**步骤3：批量导入Firestore**
```javascript
// 批量导入数据到Firestore
const migrateDataToFirestore = async (transformedData) => {
  // 使用批处理提高性能
  const batch = writeBatch(db);
  
  // 导入用户
  transformedData.users.forEach(user => {
    const userRef = doc(db, 'users', user.id);
    batch.set(userRef, user);
  });
  
  // 提交批处理
  await batch.commit();
};
```

---

## 📊 性能优化建议

### 1. 数据冗余策略
- 在频道文档中冗余存储创建者信息，避免多次查询
- 在消息文档中冗余存储发送者信息
- 维护订阅数量等统计字段

### 2. 查询优化
- 合理设计复合索引
- 使用分页查询处理大量数据
- 实现本地缓存减少网络请求

### 3. 实时监听优化
- 只监听必要的数据集合
- 及时取消不需要的监听
- 使用条件查询减少监听范围

### 4. 批处理操作
- 批量写入减少网络往返
- 事务处理确保数据一致性
- 离线队列处理网络异常

---

## ✅ 数据结构验证

创建数据验证函数：
```javascript
// 数据结构验证
export const validateDataStructure = {
  user: (data) => {
    const required = ['phone', 'nickname'];
    return required.every(field => data[field] != null);
  },
  
  channel: (data) => {
    const required = ['title', 'description', 'category', 'creatorId'];
    return required.every(field => data[field] != null);
  },
  
  message: (data) => {
    const required = ['channelId', 'senderId', 'content', 'type'];
    return required.every(field => data[field] != null);
  }
};
```

这个数据结构设计确保了：
- 🔒 数据安全性和权限控制
- ⚡ 查询性能优化
- 📱 实时数据同步
- 🔄 数据一致性维护
- 📊 统计信息准确性

接下来我们将基于这个设计实施代码升级！
