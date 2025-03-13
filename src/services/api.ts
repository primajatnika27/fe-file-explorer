import type { ExplorerResponse, Folder } from "../types/explorer";

const API_BASE_URL = "http://localhost:3000/api/v1";

class ExplorerService {
  private async fetchWithError<T = Folder[]>(
    url: string,
    options?: RequestInit
  ): Promise<ExplorerResponse<T>> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async getFolders(): Promise<ExplorerResponse<Folder[]>> {
    try {
      const data = await this.fetchWithError(`${API_BASE_URL}/folders/root`);
      return data;
    } catch (error) {
      console.error("Error fetching folders:", error);
      throw error;
    }
  }

  async getFolderDetail(id: string): Promise<ExplorerResponse<Folder>> {
    try {
      const data = await this.fetchWithError<Folder>(
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
  ): Promise<ExplorerResponse> {
    try {
      const data = await this.fetchWithError(`${API_BASE_URL}/folders`, {
        method: "POST",
        body: JSON.stringify({ name, ...(parentId ? { parentId } : {}) }),
      });
      return data;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }

  async deleteFolder(id: string): Promise<ExplorerResponse> {
    try {
      const data = await this.fetchWithError(`${API_BASE_URL}/folders/${id}`, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  }

  async renameFolder(id: string, name: string): Promise<ExplorerResponse> {
    try {
      const data = await this.fetchWithError(`${API_BASE_URL}/folders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      return data;
    } catch (error) {
      console.error("Error renaming folder:", error);
      throw error;
    }
  }

  async uploadFile(folderId: string, file: File): Promise<ExplorerResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Direct fetch call instead of using fetchWithError to avoid Content-Type override
      const response = await fetch(`${API_BASE_URL}/files/upload/${folderId}`, {
        method: "POST",
        body: formData,
        // Don't set any headers, let browser set the correct multipart/form-data with boundary
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

  async deleteFile(id: string): Promise<ExplorerResponse> {
    try {
      const data = await this.fetchWithError(`${API_BASE_URL}/files/${id}`, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async renameFile(id: string, name: string): Promise<ExplorerResponse> {
    try {
      const data = await this.fetchWithError(`${API_BASE_URL}/files/${id}`, {
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
      const data = await this.fetchWithError<{ url: string }>(
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
