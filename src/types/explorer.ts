export interface File {
  id: string;
  name: string;
  extension: string;
  parentId: string;
  storageKey: string;
  mimeType: string;
  size: number;
}

export interface Folder {
  name: string;
  id: string;
  parentId: string | null;
  subFolders: Folder[];
  files: File[];
}

export interface ExplorerResponse<T = Folder[]> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface ExplorerItemProps {
  name: string;
  isFolder?: boolean;
  modified?: string;
  size?: number;
  onClick?: () => void;
  isSelected?: boolean;
}
