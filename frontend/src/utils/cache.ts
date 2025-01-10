interface CacheData {
    data: any;
    timestamp: number;
  }
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  export const cache = {
    set: (key: string, data: any) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      );
    },
  
    get: (key: string) => {
      const item = localStorage.getItem(key);
      if (!item) return null;
  
      const { data, timestamp } = JSON.parse(item) as CacheData;
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }
  
      return data;
    },
  
    clear: () => {
      localStorage.clear();
    }
  };