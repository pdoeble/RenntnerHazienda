/// <reference types="vite/client" />

interface Window {
  showSaveFilePicker?: unknown;
  showDirectoryPicker?: unknown;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}
