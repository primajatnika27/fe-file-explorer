import type { ExplorerResponse, Folder } from "../types/explorer";
import { fetchWithError } from "../utils/fetchUtils";
import { API_BASE_URL } from "../config/api";

class ExplorerService {
  async getFolders(): Promise<ExplorerResponse<Folder[]>> {
    try {
      const data = await fetchWithError<Folder[]>(
        `${API_BASE_URL}/folders/root`
      );
      return data;
    } catch (error) {
      console.error("Error fetching folders:", error);
      throw error;
    }
  }

  async getFolderDetail(id: string): Promise<ExplorerResponse<Folder>> {
    try {
      const data = await fetchWithError<Folder>(
        `${API_BASE_URL}/folders/${id}`
      );
      return data;
    } catch (error) {
      console.error("Error fetching folder detail:", error);
      throw error;
    }
  }

  async createFolder(
    name: string,
    parentId?: string
  ): Promise<ExplorerResponse<void>> {
    try {
      const data = await fetchWithError<void>(`${API_BASE_URL}/folders`, {
        method: "POST",
        body: JSON.stringify({ name, ...(parentId ? { parentId } : {}) }),
      });
      return data;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }

  async deleteFolder(id: string): Promise<ExplorerResponse<void>> {
    try {
      const data = await fetchWithError<void>(`${API_BASE_URL}/folders/${id}`, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  }

  async renameFolder(
    id: string,
    name: string
  ): Promise<ExplorerResponse<void>> {
    try {
      const data = await fetchWithError<void>(`${API_BASE_URL}/folders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      return data;
    } catch (error) {
      console.error("Error renaming folder:", error);
      throw error;
    }
  }

  async uploadFile(
    folderId: string,
    file: File
  ): Promise<ExplorerResponse<void>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/files/upload/${folderId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async deleteFile(id: string): Promise<ExplorerResponse<void>> {
    try {
      const data = await fetchWithError<void>(`${API_BASE_URL}/files/${id}`, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async renameFile(id: string, name: string): Promise<ExplorerResponse<void>> {
    try {
      const data = await fetchWithError<void>(`${API_BASE_URL}/files/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      return data;
    } catch (error) {
      console.error("Error renaming file:", error);
      throw error;
    }
  }

  async getFileUrl(id: string): Promise<ExplorerResponse<{ url: string }>> {
    try {
      const data = await fetchWithError<{ url: string }>(
        `${API_BASE_URL}/files/url/${id}`
      );
      return data;
    } catch (error) {
      console.error("Error getting file URL:", error);
      throw error;
    }
  }
}

export const explorerService = new ExplorerService();
