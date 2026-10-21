// Shared shapes used across services, hooks and screens.
export type PickedFile = {
  uri: string;
  name: string;
  size?: number;      // bytes, when the OS reports it
  mimeType?: string;
  isImage: boolean;
};
