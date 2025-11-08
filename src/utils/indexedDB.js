// Utility để quản lý IndexedDB cho việc lưu trữ resources và user profile

const DB_NAME = 'AILearningPlatformDB';
const DB_VERSION = 5; // Tăng version để thêm analytics stores
const STORE_NAME = 'resources';
const USER_STORE_NAME = 'userProfile';
const CHAT_STORE_NAME = 'chatConversations';
const LEARNING_ACTIVITIES_STORE = 'learningActivities';
const QUIZ_RESULTS_STORE = 'quizResults';

// Khởi tạo database
const initDB = () => {
  return new Promise((resolve, reject) => {
    console.log('🔧 Đang khởi tạo IndexedDB...');
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('❌ Lỗi khi mở database:', event.target.error);
      reject('Lỗi khi mở database: ' + event.target.error);
    };

    request.onsuccess = (event) => {
      console.log('✅ Database đã mở thành công');
      const db = event.target.result;
      console.log('📊 Object stores có sẵn:', Array.from(db.objectStoreNames));
      
      // Kiểm tra xem có đủ stores không
      const requiredStores = [STORE_NAME, USER_STORE_NAME, CHAT_STORE_NAME, LEARNING_ACTIVITIES_STORE, QUIZ_RESULTS_STORE];
      const missingStores = requiredStores.filter(store => !db.objectStoreNames.contains(store));
      
      if (missingStores.length > 0) {
        console.warn('⚠️ Thiếu object stores:', missingStores);
        console.log('🔄 Đang reset database để tạo lại...');
        db.close();
        
        // Xóa database cũ
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        deleteRequest.onsuccess = () => {
          console.log('✅ Đã xóa database cũ');
          console.log('🔄 Đang tạo lại database...');
          // Thử tạo lại
          setTimeout(() => {
            window.location.reload();
          }, 500);
        };
        deleteRequest.onerror = () => {
          reject('Không thể xóa database cũ. Vui lòng xóa thủ công trong DevTools.');
        };
        return;
      }
      
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      console.log('🔄 Đang nâng cấp database...');
      const db = event.target.result;
      
      // Tạo object store cho resources nếu chưa tồn tại
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('➕ Tạo object store:', STORE_NAME);
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        
        // Tạo các index để tìm kiếm nhanh
        objectStore.createIndex('topic', 'topic', { unique: false });
        objectStore.createIndex('subtopic', 'subtopic', { unique: false });
        objectStore.createIndex('compositeKey', ['topic', 'subtopic'], { unique: true });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      } else {
        console.log('✅ Object store đã tồn tại:', STORE_NAME);
      }

      // Tạo object store cho user profile nếu chưa tồn tại
      if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
        console.log('➕ Tạo object store:', USER_STORE_NAME);
        const userStore = db.createObjectStore(USER_STORE_NAME, { keyPath: 'id' });
        userStore.createIndex('username', 'username', { unique: false });
      } else {
        console.log('✅ Object store đã tồn tại:', USER_STORE_NAME);
      }

      // Tạo object store cho chat conversations nếu chưa tồn tại
      if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
        console.log('➕ Tạo object store:', CHAT_STORE_NAME);
        const chatStore = db.createObjectStore(CHAT_STORE_NAME, { keyPath: 'id' });
        chatStore.createIndex('timestamp', 'timestamp', { unique: false });
        chatStore.createIndex('title', 'title', { unique: false });
      } else {
        console.log('✅ Object store đã tồn tại:', CHAT_STORE_NAME);
      }

      // Tạo object store cho learning activities nếu chưa tồn tại
      if (!db.objectStoreNames.contains(LEARNING_ACTIVITIES_STORE)) {
        console.log('➕ Tạo object store:', LEARNING_ACTIVITIES_STORE);
        const activitiesStore = db.createObjectStore(LEARNING_ACTIVITIES_STORE, { keyPath: 'id', autoIncrement: true });
        activitiesStore.createIndex('timestamp', 'timestamp', { unique: false });
        activitiesStore.createIndex('topic', 'topic', { unique: false });
        activitiesStore.createIndex('activityType', 'activityType', { unique: false });
        activitiesStore.createIndex('date', 'date', { unique: false });
      } else {
        console.log('✅ Object store đã tồn tại:', LEARNING_ACTIVITIES_STORE);
      }

      // Tạo object store cho quiz results nếu chưa tồn tại
      if (!db.objectStoreNames.contains(QUIZ_RESULTS_STORE)) {
        console.log('➕ Tạo object store:', QUIZ_RESULTS_STORE);
        const quizResultsStore = db.createObjectStore(QUIZ_RESULTS_STORE, { keyPath: 'id', autoIncrement: true });
        quizResultsStore.createIndex('timestamp', 'timestamp', { unique: false });
        quizResultsStore.createIndex('topic', 'topic', { unique: false });
        quizResultsStore.createIndex('subtopic', 'subtopic', { unique: false });
        quizResultsStore.createIndex('score', 'score', { unique: false });
        quizResultsStore.createIndex('date', 'date', { unique: false });
      } else {
        console.log('✅ Object store đã tồn tại:', QUIZ_RESULTS_STORE);
      }
      
      console.log('✅ Database upgrade hoàn tất');
    };

    request.onblocked = (event) => {
      console.warn('⚠️ Database bị chặn:', event);
    };
  });
};

// Lưu resource vào IndexedDB
export const saveResource = async (resourceData) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      // Thêm timestamp để theo dõi thời gian tạo
      const dataToSave = {
        ...resourceData,
        timestamp: new Date().toISOString(),
      };
      
      const request = objectStore.add(dataToSave);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        // Nếu đã tồn tại (unique constraint), thử update
        updateResource(resourceData).then(resolve).catch(reject);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi lưu resource:', error);
    throw error;
  }
};

// Cập nhật resource đã tồn tại
export const updateResource = async (resourceData) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('compositeKey');
      
      // Tìm resource hiện có
      const getRequest = index.get([resourceData.topic, resourceData.subtopic]);
      
      getRequest.onsuccess = () => {
        const existingData = getRequest.result;
        
        if (existingData) {
          // Cập nhật với id hiện có
          const dataToUpdate = {
            ...resourceData,
            id: existingData.id,
            timestamp: new Date().toISOString(),
            createdAt: existingData.timestamp, // Giữ timestamp tạo ban đầu
          };
          
          const updateRequest = objectStore.put(dataToUpdate);
          
          updateRequest.onsuccess = () => {
            resolve(updateRequest.result);
          };
          
          updateRequest.onerror = () => {
            reject('Lỗi khi cập nhật resource');
          };
        } else {
          reject('Không tìm thấy resource để cập nhật');
        }
      };
      
      getRequest.onerror = () => {
        reject('Lỗi khi tìm resource');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật resource:', error);
    throw error;
  }
};

// Lấy resource theo topic và subtopic
export const getResource = async (topic, subtopic) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('compositeKey');
      
      const request = index.get([topic, subtopic]);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lấy resource');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi lấy resource:', error);
    throw error;
  }
};

// Lấy tất cả resources của một topic
export const getResourcesByTopic = async (topic) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('topic');
      
      const request = index.getAll(topic);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lấy resources');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi lấy resources:', error);
    throw error;
  }
};

// Lấy tất cả resources
export const getAllResources = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      const request = objectStore.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lấy tất cả resources');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả resources:', error);
    throw error;
  }
};

// Xóa resource
export const deleteResource = async (topic, subtopic) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('compositeKey');
      
      const getRequest = index.get([topic, subtopic]);
      
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        
        if (data) {
          const deleteRequest = objectStore.delete(data.id);
          
          deleteRequest.onsuccess = () => {
            resolve(true);
          };
          
          deleteRequest.onerror = () => {
            reject('Lỗi khi xóa resource');
          };
        } else {
          resolve(false);
        }
      };
      
      getRequest.onerror = () => {
        reject('Lỗi khi tìm resource để xóa');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi xóa resource:', error);
    throw error;
  }
};

// Xóa tất cả resources của một topic
export const deleteResourcesByTopic = async (topic) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('topic');
      
      const request = index.openCursor(IDBKeyRange.only(topic));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve(true);
        }
      };
      
      request.onerror = () => {
        reject('Lỗi khi xóa resources');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi xóa resources:', error);
    throw error;
  }
};

// Xóa toàn bộ database (dùng cho mục đích debug hoặc reset)
export const clearAllResources = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      
      const request = objectStore.clear();
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject('Lỗi khi xóa toàn bộ resources');
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi xóa toàn bộ resources:', error);
    throw error;
  }
};

// Kiểm tra xem resource đã tồn tại chưa
export const resourceExists = async (topic, subtopic) => {
  try {
    const resource = await getResource(topic, subtopic);
    return !!resource;
  } catch (error) {
    console.error('Lỗi khi kiểm tra resource:', error);
    return false;
  }
};

// Export statistics
export const getResourceStats = async () => {
  try {
    const allResources = await getAllResources();
    
    const topicCount = {};
    allResources.forEach(resource => {
      topicCount[resource.topic] = (topicCount[resource.topic] || 0) + 1;
    });
    
    return {
      totalResources: allResources.length,
      resourcesByTopic: topicCount,
      oldestResource: allResources.length > 0 
        ? allResources.reduce((oldest, current) => 
            new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest
          ) 
        : null,
      newestResource: allResources.length > 0 
        ? allResources.reduce((newest, current) => 
            new Date(current.timestamp) > new Date(newest.timestamp) ? current : newest
          ) 
        : null,
    };
  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    return null;
  }
};

// ===== USER PROFILE FUNCTIONS =====

// Lưu hoặc cập nhật user profile
export const saveUserProfile = async (userData) => {
  try {
    console.log('💾 saveUserProfile được gọi với:', userData);
    const db = await initDB();
    console.log('✅ Database đã được khởi tạo');
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([USER_STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(USER_STORE_NAME);
        
        // User profile luôn có id = 'current_user'
        const dataToSave = {
          id: 'current_user',
          username: userData.username,
          avatarType: userData.avatarType || 'default', // Có thể mở rộng sau
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        console.log('📝 Dữ liệu sẽ được lưu:', dataToSave);
        const request = objectStore.put(dataToSave);
        
        request.onsuccess = () => {
          console.log('✅ Put request thành công:', request.result);
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          console.error('❌ Put request lỗi:', event.target.error);
          reject('Lỗi khi lưu user profile: ' + event.target.error);
        };
        
        transaction.oncomplete = () => {
          console.log('✅ Transaction hoàn tất');
          db.close();
        };

        transaction.onerror = (event) => {
          console.error('❌ Transaction lỗi:', event.target.error);
          reject('Lỗi transaction: ' + event.target.error);
        };
      } catch (err) {
        console.error('❌ Lỗi trong promise:', err);
        reject(err);
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi lưu user profile:', error);
    throw error;
  }
};

// Lấy user profile
export const getUserProfile = async () => {
  try {
    console.log('🔍 getUserProfile được gọi');
    const db = await initDB();
    console.log('✅ Database đã được khởi tạo');
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([USER_STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(USER_STORE_NAME);
        
        const request = objectStore.get('current_user');
        
        request.onsuccess = () => {
          console.log('✅ Get request thành công:', request.result);
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          console.error('❌ Get request lỗi:', event.target.error);
          reject('Lỗi khi lấy user profile: ' + event.target.error);
        };
        
        transaction.oncomplete = () => {
          console.log('✅ Transaction hoàn tất');
          db.close();
        };
      } catch (err) {
        console.error('❌ Lỗi trong promise:', err);
        reject(err);
      }
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy user profile:', error);
    throw error;
  }
};

// Kiểm tra xem user đã có profile chưa
export const hasUserProfile = async () => {
  try {
    console.log('🔍 hasUserProfile được gọi');
    const profile = await getUserProfile();
    const result = !!profile;
    console.log('✅ hasUserProfile kết quả:', result, 'profile:', profile);
    return result;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra user profile:', error);
    return false;
  }
};

// Cập nhật username
export const updateUsername = async (newUsername) => {
  try {
    const currentProfile = await getUserProfile();
    if (!currentProfile) {
      throw new Error('User profile không tồn tại');
    }
    
    return await saveUserProfile({
      ...currentProfile,
      username: newUsername,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật username:', error);
    throw error;
  }
};

// ===== CHAT CONVERSATION FUNCTIONS =====

// Lưu conversation mới
export const saveChatConversation = async (conversationData) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CHAT_STORE_NAME);
      
      const dataToSave = {
        id: conversationData.id || `chat_${Date.now()}`,
        title: conversationData.title || 'Cuộc trò chuyện mới',
        messages: conversationData.messages || [],
        timestamp: conversationData.timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const request = objectStore.put(dataToSave);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lưu conversation');
      };
      
      transaction.oncomplete = () => {
        // Không đóng db để tránh conflict với các transaction khác
        // IndexedDB sẽ tự quản lý connection
      };
    });
  } catch (error) {
    console.error('Lỗi khi lưu conversation:', error);
    throw error;
  }
};

// Lấy conversation theo ID
export const getChatConversation = async (conversationId) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(CHAT_STORE_NAME);
      
      const request = objectStore.get(conversationId);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lấy conversation');
      };
      
      transaction.oncomplete = () => {
        // Không đóng db để tránh conflict với các transaction khác
        // IndexedDB sẽ tự quản lý connection
      };
    });
  } catch (error) {
    console.error('Lỗi khi lấy conversation:', error);
    throw error;
  }
};

// Lấy tất cả conversations
export const getAllChatConversations = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(CHAT_STORE_NAME);
      
      const request = objectStore.getAll();
      
      request.onsuccess = () => {
        // Sắp xếp theo updatedAt mới nhất
        const conversations = request.result.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        resolve(conversations);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lấy tất cả conversations');
      };
      
      transaction.oncomplete = () => {
        // Không đóng db để tránh conflict với các transaction khác
        // IndexedDB sẽ tự quản lý connection
      };
    });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả conversations:', error);
    throw error;
  }
};

// Xóa conversation
export const deleteChatConversation = async (conversationId) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CHAT_STORE_NAME);
      
      const request = objectStore.delete(conversationId);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject('Lỗi khi xóa conversation');
      };
      
      transaction.oncomplete = () => {
        // Không đóng db để tránh conflict với các transaction khác
        // IndexedDB sẽ tự quản lý connection
      };
    });
  } catch (error) {
    console.error('Lỗi khi xóa conversation:', error);
    throw error;
  }
};

// Xóa tất cả conversations
export const clearAllChatConversations = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHAT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CHAT_STORE_NAME);
      
      const request = objectStore.clear();
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject('Lỗi khi xóa tất cả conversations');
      };
      
      transaction.oncomplete = () => {
        // Không đóng db để tránh conflict với các transaction khác
        // IndexedDB sẽ tự quản lý connection
      };
    });
  } catch (error) {
    console.error('Lỗi khi xóa tất cả conversations:', error);
    throw error;
  }
};

// Update conversation (thêm message mới)
export const updateChatConversation = async (conversationId, newMessages) => {
  try {
    const conversation = await getChatConversation(conversationId);
    
    // Nếu conversation chưa tồn tại, tạo mới
    if (!conversation) {
      console.log('Conversation chưa tồn tại, tạo mới:', conversationId);
      
      let title = 'Cuộc trò chuyện mới';
      if (newMessages.length > 0) {
        const firstUserMessage = newMessages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
          title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
        }
      }
      
      return await saveChatConversation({
        id: conversationId,
        title,
        messages: newMessages,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    // Tạo title từ message đầu tiên nếu chưa có
    let title = conversation.title;
    if (title === 'Cuộc trò chuyện mới' && newMessages.length > 0) {
      const firstUserMessage = newMessages.find(msg => msg.role === 'user');
      if (firstUserMessage) {
        title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
      }
    }
    
    return await saveChatConversation({
      ...conversation,
      title,
      messages: newMessages,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật conversation:', error);
    throw error;
  }
};

// ===== LEARNING ACTIVITIES TRACKING =====

export const saveLearningActivity = async (activityData) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([LEARNING_ACTIVITIES_STORE], 'readwrite');
      const objectStore = transaction.objectStore(LEARNING_ACTIVITIES_STORE);
      
      const dataToSave = {
        ...activityData,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
      };
      
      const request = objectStore.add(dataToSave);
      
      request.onsuccess = () => {
        console.log('✅ Đã lưu learning activity');
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lưu learning activity');
      };
      
      transaction.oncomplete = () => {
        // db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi lưu learning activity:', error);
    throw error;
  }
};

export const getAllLearningActivities = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([LEARNING_ACTIVITIES_STORE], 'readonly');
      const objectStore = transaction.objectStore(LEARNING_ACTIVITIES_STORE);
      
      const request = objectStore.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lấy learning activities');
      };
      
      transaction.oncomplete = () => {
        // db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi lấy learning activities:', error);
    throw error;
  }
};

// ===== QUIZ RESULTS TRACKING =====

export const saveQuizResult = async (quizData) => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([QUIZ_RESULTS_STORE], 'readwrite');
      const objectStore = transaction.objectStore(QUIZ_RESULTS_STORE);
      
      const dataToSave = {
        ...quizData,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        passed: quizData.score >= 70,
      };
      
      const request = objectStore.add(dataToSave);
      
      request.onsuccess = () => {
        console.log('✅ Đã lưu quiz result');
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lưu quiz result');
      };
      
      transaction.oncomplete = () => {
        // db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi lưu quiz result:', error);
    throw error;
  }
};

export const getAllQuizResults = async () => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([QUIZ_RESULTS_STORE], 'readonly');
      const objectStore = transaction.objectStore(QUIZ_RESULTS_STORE);
      
      const request = objectStore.getAll();
      
      request.onsuccess = () => {
        const results = request.result.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        resolve(results);
      };
      
      request.onerror = () => {
        reject('Lỗi khi lấy quiz results');
      };
      
      transaction.oncomplete = () => {
        // db.close();
      };
    });
  } catch (error) {
    console.error('Lỗi khi lấy quiz results:', error);
    throw error;
  }
};

export const calculateTimeSpentByTopic = async () => {
  try {
    const activities = await getAllLearningActivities();
    
    const timeByTopic = {};
    activities.forEach(activity => {
      const topic = activity.topic || 'Unknown';
      const duration = activity.duration || 0;
      
      timeByTopic[topic] = (timeByTopic[topic] || 0) + duration;
    });
    
    return timeByTopic;
  } catch (error) {
    console.error('Lỗi khi tính time spent:', error);
    return {};
  }
};

export const getAnalyticsData = async () => {
  try {
    const [activities, quizResults, timeSpent] = await Promise.all([
      getAllLearningActivities(),
      getAllQuizResults(),
      calculateTimeSpentByTopic()
    ]);
    
    const topics = [...new Set([
      ...activities.map(a => a.topic).filter(Boolean),
      ...quizResults.map(q => q.topic).filter(Boolean)
    ])];
    
    return {
      learning_activities: activities,
      quiz_results: quizResults.map(q => ({
        topic: q.topic,
        subtopic: q.subtopic,
        score: q.score,
        total_questions: q.totalQuestions,
        correct_answers: q.correctAnswers,
        time_spent: q.timeSpent,
        timestamp: q.timestamp,
        passed: q.passed
      })),
      time_spent: timeSpent,
      current_topics: topics
    };
  } catch (error) {
    console.error('Lỗi khi lấy analytics data:', error);
    return {
      learning_activities: [],
      quiz_results: [],
      time_spent: {},
      current_topics: []
    };
  }
};
