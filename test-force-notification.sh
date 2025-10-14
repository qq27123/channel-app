#!/bin/bash

# 强制提醒功能测试脚本
# 用于快速启动和测试强制提醒功能

echo "=================================="
echo "  强制提醒功能测试工具"
echo "=================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 channel-app 目录下运行此脚本"
    exit 1
fi

echo "📋 测试准备清单："
echo ""
echo "□ 准备两台手机（或一台手机+一台平板）"
echo "□ 两台设备都安装了 Expo Go 应用"
echo "□ 两台设备连接到同一 WiFi 网络"
echo "□ 确保手机允许通知权限"
echo ""

read -p "是否已准备好？(y/n): " ready

if [ "$ready" != "y" ]; then
    echo "请准备好设备后再运行此脚本"
    exit 0
fi

echo ""
echo "🚀 正在启动 Expo 开发服务器..."
echo ""

# 启动 Expo
npx expo start

echo ""
echo "=================================="
echo "  测试步骤"
echo "=================================="
echo ""
echo "1️⃣  设备A (频道主)："
echo "   - 扫描二维码打开应用"
echo "   - 注册: 频道主A / 13800000001"
echo "   - 创建频道: 强提醒测试频道"
echo ""
echo "2️⃣  设备B (用户)："
echo "   - 扫描二维码打开应用"
echo "   - 注册: 用户B / 13800000002"
echo "   - 订阅: 强提醒测试频道"
echo ""
echo "3️⃣  设备A (审核)："
echo "   - 进入消息页面"
echo "   - 批准订阅申请"
echo "   - 选择会员期限: 1分钟(测试)"
echo ""
echo "4️⃣  设备B (开启)："
echo "   - 刷新频道详情页"
echo "   - 点击: 开启强制提醒"
echo "   - 允许通知权限"
echo ""
echo "5️⃣  设备A (发布)："
echo "   - 发布测试内容"
echo ""
echo "6️⃣  设备B (验证)："
echo "   - ✅ 震动 (1.5秒)"
echo "   - ✅ 横幅通知"
echo "   - ✅ 声音提醒"
echo "   - ✅ 锁屏显示"
echo ""
echo "=================================="
echo "详细文档: docs/FORCE_NOTIFICATION_TEST_GUIDE.md"
echo "=================================="
