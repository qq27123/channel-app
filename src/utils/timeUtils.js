/**
 * 时间工具函数
 * 统一使用北京时间（UTC+8）显示
 */

/**
 * 获取北京时间
 * @param {number} timestamp - 时间戳（毫秒）
 * @returns {Date} 北京时间Date对象
 */
export const getBeijingTime = (timestamp) => {
  const date = new Date(timestamp);
  // 获取UTC时间戳
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  // 转换为北京时间（UTC+8）
  const beijingTime = new Date(utcTime + (8 * 3600000));
  return beijingTime;
};

/**
 * 格式化为北京时间字符串
 * @param {number} timestamp - 时间戳（毫秒）
 * @param {string} format - 格式类型：'full'（完整）, 'date'（日期）, 'time'（时间）, 'datetime'（日期+时间）
 * @returns {string} 格式化的时间字符串
 */
export const formatBeijingTime = (timestamp, format = 'full') => {
  if (!timestamp) return '';
  
  const beijingDate = getBeijingTime(timestamp);
  
  const year = beijingDate.getFullYear();
  const month = String(beijingDate.getMonth() + 1).padStart(2, '0');
  const day = String(beijingDate.getDate()).padStart(2, '0');
  const hours = String(beijingDate.getHours()).padStart(2, '0');
  const minutes = String(beijingDate.getMinutes()).padStart(2, '0');
  const seconds = String(beijingDate.getSeconds()).padStart(2, '0');
  
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}`;
    case 'datetime':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case 'full':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

/**
 * 格式化为相对时间（聊天消息用）
 * @param {number} timestamp - 时间戳（毫秒）
 * @returns {string} 相对时间字符串
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const beijingDate = getBeijingTime(timestamp);
  const now = getBeijingTime(Date.now());
  const diffInMinutes = (now - beijingDate) / (1000 * 60);
  
  if (diffInMinutes < 1) {
    return '刚刚';
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}分钟前`;
  } else if (diffInMinutes < 60 * 24) {
    const hours = String(beijingDate.getHours()).padStart(2, '0');
    const minutes = String(beijingDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } else {
    const month = beijingDate.getMonth() + 1;
    const day = beijingDate.getDate();
    const hours = String(beijingDate.getHours()).padStart(2, '0');
    const minutes = String(beijingDate.getMinutes()).padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  }
};

/**
 * 格式化会话列表时间
 * @param {number} timestamp - 时间戳（毫秒）
 * @returns {string} 格式化的时间字符串
 */
export const formatConversationTime = (timestamp) => {
  if (!timestamp) return '';
  
  const beijingDate = getBeijingTime(timestamp);
  const now = getBeijingTime(Date.now());
  const diffInHours = (now - beijingDate) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    const hours = String(beijingDate.getHours()).padStart(2, '0');
    const minutes = String(beijingDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } else if (diffInHours < 24 * 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[beijingDate.getDay()];
  } else {
    const month = beijingDate.getMonth() + 1;
    const day = beijingDate.getDate();
    return `${month}月${day}日`;
  }
};

/**
 * 获取当前北京时间戳
 * @returns {number} 北京时间戳（毫秒）
 */
export const getBeijingTimestamp = () => {
  return Date.now();
};

/**
 * 将北京时间戳转换为本地时间Date对象（用于时间选择器显示）
 * @param {number} beijingTimestamp - 北京时间戳（毫秒）
 * @returns {Date} 本地时间Date对象
 */
export const beijingToLocalDate = (beijingTimestamp) => {
  // 将北京时间戳转换为UTC时间戳
  const beijingDate = new Date(beijingTimestamp);
  const localTimezoneOffset = new Date().getTimezoneOffset(); // 本地时区偏移（分钟）
  const beijingTimezoneOffset = -480; // 北京时区偏移（UTC+8 = -480分钟）
  
  // 计算时区差异（毫秒）
  const timezoneDiff = (localTimezoneOffset - beijingTimezoneOffset) * 60 * 1000;
  
  // 返回调整后的本地时间
  return new Date(beijingTimestamp + timezoneDiff);
};

/**
 * 将本地时间Date对象转换为北京旹间戳（用于保存）
 * @param {Date} localDate - 本地时间Date对象
 * @returns {number} 北京时间戳（毫秒）
 */
export const localDateToBeijing = (localDate) => {
  const localTimezoneOffset = new Date().getTimezoneOffset(); // 本地时区偏移（分钟）
  const beijingTimezoneOffset = -480; // 北京时区偏移（UTC+8 = -480分钟）
  
  // 计算时区差异（毫秒）
  const timezoneDiff = (localTimezoneOffset - beijingTimezoneOffset) * 60 * 1000;
  
  // 返回调整后的北京时间戳
  return localDate.getTime() - timezoneDiff;
};
