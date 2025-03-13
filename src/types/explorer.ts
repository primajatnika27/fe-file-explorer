export interface File {
  id: string;
  name: string;
  extension: string;
  parentId: string;
  storageKey: string;
  mimeType: string;
  size: number;
}

export interface RootNavigation {
  id: string;
  name: string;
}

export interface Folder {
  name: string;
  id: string;
  parentId: string | null;
  subFolders: Folder[];
  files: File[];
  rootNavigation: RootNavigation[];
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
