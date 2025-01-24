export type StorageLocation = 'cloud' | 'local';

const STORAGE_LOCATION_KEY = 'transcript_storage_location';

export const transcriptStorageSettings = {
  getStorageLocation: (): StorageLocation => {
    const location = localStorage.getItem(STORAGE_LOCATION_KEY);
    return (location as StorageLocation) || 'cloud'; // Default to cloud
  },

  setStorageLocation: (location: StorageLocation): void => {
    localStorage.setItem(STORAGE_LOCATION_KEY, location);
  },

  isCloudStorage: (): boolean => {
    return transcriptStorageSettings.getStorageLocation() === 'cloud';
  }
};
