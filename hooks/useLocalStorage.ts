
import { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key “' + key + '”:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const valueToStore = typeof storedValue === 'function' ? (storedValue as (val: T) => T)(storedValue) : storedValue;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error setting localStorage key “' + key + '”:', error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
    