import React from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// 🔥 Firebase测试（开发环境）
// 暂时禁用Firebase测试，避免配置错误
// import './src/test/firebaseTest';

// Context Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ChannelProvider } from './src/context/ChannelContext';
import { ChatProvider, useChat } from './src/context/ChatContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { SubscriptionNotificationProvider } from './src/context/SubscriptionNotificationContext';
import { PrivacyProvider, usePrivacy } from './src/context/PrivacyContext';
import { ReportProvider } from './src/context/ReportContext';
import { ContentFilterProvider } from './src/context/ContentFilterContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import ChannelSquareScreen from './src/screens/ChannelSquareScreen';
import ChannelDetailScreen from './src/screens/ChannelDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CreateChannelScreen from './src/screens/CreateChannelScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import FirebaseTestScreen from './src/screens/FirebaseTestScreen';
import TestScreen from './src/screens/TestScreen';

// Components
import PrivacyModal from './src/components/PrivacyModal';
import ReportModal from './src/components/ReportModal';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 底部标签导航
function MainTabNavigator() {
  const { user } = useAuth();
  const { unreadCounts, getTotalUnreadCount } = useChat();
  const [localUnreadCount, setLocalUnreadCount] = React.useState(0);
  
  // 监听unreadCounts的变化，实时更新局部状态
  React.useEffect(() => {
    if (user && user.id) {
      const count = unreadCounts[user.id] || 0;
      console.log(`[App] 用户 ${user.id} 的未读数量更新: ${count}`);
      console.log('[App] 当前unreadCounts:', unreadCounts);
      setLocalUnreadCount(count);
    } else {
      setLocalUnreadCount(0);
    }
  }, [user, unreadCounts]);
  
  // 初始化时加载未读数量
  React.useEffect(() => {
    if (user && user.id) {
      getTotalUnreadCount(user.id);
    }
  }, [user]);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'ChannelSquare') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'FirebaseTest') {
            iconName = focused ? 'cloud' : 'cloud-outline';
          } else if (route.name === 'Test') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#0C0C0C',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.15)',
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        headerStyle: {
          backgroundColor: '#0C0C0C',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.15)',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#FFFFFF',
        },
      })}
    >
      <Tab.Screen 
        name="ChannelSquare" 
        component={ChannelSquareScreen}
        options={{
          title: '频道广场',
          tabBarLabel: '广场',
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          title: '消息',
          tabBarLabel: '消息',
          tabBarBadge: localUnreadCount > 0 ? (localUnreadCount > 99 ? '99+' : localUnreadCount.toString()) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            marginTop: 2,
          },
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: '个人中心',
          tabBarLabel: '我的',
        }}
      />
      <Tab.Screen 
        name="FirebaseTest" 
        component={FirebaseTestScreen}
        options={{
          title: 'Firebase测试',
          tabBarLabel: '测试',
        }}
      />
      <Tab.Screen 
        name="Test" 
        component={TestScreen}
        options={{
          title: '应用测试',
          tabBarLabel: '测试',
        }}
      />
    </Tab.Navigator>
  );
}

// 主导航器
function AppNavigator() {
  const { user, loading } = useAuth();
  const { hasAcceptedPrivacy, loading: privacyLoading } = usePrivacy();

  if (loading || privacyLoading) {
    return null; // 可以添加一个加载屏幕
  }

  // 如果用户未同意隐私协议，显示隐私弹窗（在任何界面之前）
  if (!hasAcceptedPrivacy) {
    return (
      <>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Privacy" component={() => null} />
        </Stack.Navigator>
        <PrivacyModal />
      </>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0C0C0C',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.15)',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#FFFFFF',
        },
      }}
    >
      {user ? (
        // 已登录用户的导航
        <>
          <Stack.Screen 
            name="MainTab" 
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ChannelDetail" 
            component={ChannelDetailScreen}
            options={{
              title: '频道详情',
              headerBackTitle: '返回',
            }}
          />
          <Stack.Screen 
            name="CreateChannel" 
            component={CreateChannelScreen}
            options={{
              title: '创建频道',
              headerBackTitle: '返回',
            }}
          />
          <Stack.Screen 
            name="ChatDetail" 
            component={ChatDetailScreen}
            options={{
              title: '聊天',
              headerBackTitle: '返回',
            }}
          />
        </>
      ) : (
        // 未登录用户的导航
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ 
            headerShown: false,
            animationTypeForReplace: 'push',
          }}
        />
      )}
    </Stack.Navigator>
  );
}

// 根组件
export default function App() {
  return (
    <PrivacyProvider>
      <ReportProvider>
        <ContentFilterProvider>
          <AuthProvider>
            <ChannelProvider>
              <ChatProvider>
                <NotificationProvider>
                  <SubscriptionNotificationProvider>
                    <NavigationContainer>
                      <AppNavigator />
                    </NavigationContainer>
                    <PrivacyModal />
                    <ReportModal />
                  </SubscriptionNotificationProvider>
                </NotificationProvider>
              </ChatProvider>
            </ChannelProvider>
          </AuthProvider>
        </ContentFilterProvider>
      </ReportProvider>
    </PrivacyProvider>
  );
}