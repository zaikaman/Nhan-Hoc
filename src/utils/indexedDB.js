// Utility để quản lý IndexedDB cho việc lưu trữ resources

const DB_NAME = 'AILearningPlatformDB';
const DB_VERSION = 1;
const STORE_NAME = 'resources';

// Khởi tạo database
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject('Lỗi khi mở database');
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Tạo object store nếu chưa tồn tại
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        
        // Tạo các index để tìm kiếm nhanh
        objectStore.createIndex('topic', 'topic', { unique: false });
        objectStore.createIndex('subtopic', 'subtopic', { unique: false });
        objectStore.createIndex('compositeKey', ['topic', 'subtopic'], { unique: true });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
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
