// Cache สำหรับเก็บ avatar URLs
const avatarCache = new Map();

/**
 * สร้าง cached avatar URL
 * @param {string} userId - ID ของผู้ใช้
 * @returns {string} Avatar URL หรือ empty string ถ้าไม่มี userId
 */
export const getCachedAvatarUrl = (userId) => {
  if (!userId) return '';
  
  // ตรวจสอบว่ามี cache หรือไม่
  if (avatarCache.has(userId)) {
    return avatarCache.get(userId);
  }
  
  // สร้าง URL ใหม่และเก็บใน cache
  const url = `https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${userId}/avatar.jpg?&${Date.now()}`;
  avatarCache.set(userId, url);
  return url;
};

/**
 * ลบ cache ของ user เฉพาะ
 * @param {string} userId - ID ของผู้ใช้
 */
export const clearUserAvatar = (userId) => {
  avatarCache.delete(userId);
};

/**
 * ลบ cache ทั้งหมด
 */
export const clearAllAvatarCache = () => {
  avatarCache.clear();
};