# File Explorer

Modern file explorer web application built with Vue 3, Vuetify, and TypeScript. Provides an intuitive interface for managing files and folders with a familiar two-panel layout.

## ✨ Features

- 📁 **Two-Panel Layout**
  - Left panel: Tree view of folder structure
  - Right panel: Content view of selected folder
  
- 📂 **Folder Management**
  - Create new folders
  - Rename existing folders
  - Delete folders
  - Navigate through folder hierarchy
  - Expand/collapse folder tree

- 📄 **File Operations**
  - Upload files
  - Preview files
  - Rename files
  - Delete files
  - Display file size

- 🔍 **Search Functionality**
  - Search through files and folders
  - Real-time filtering of results

- 💫 **Modern UI/UX**
  - Responsive design
  - Drag to resize panels
  - Context menus for quick actions
  - Breadcrumb navigation
  - Loading states and error handling
  - Empty state displays

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd file-explorer
```

2. Install dependencies using your preferred package manager:
```bash
# Using bun
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add necessary API configurations:
```env
VITE_API_BASE_URL=your_api_base_url
```

4. Start the development server:
```bash
# Using bun
bun run dev
```

The application will be available at `http://localhost:3000`

## 💻 Usage

### Folder Navigation
- Click on folders in the left panel to view their contents in the right panel
- Use the expand/collapse arrows to navigate the folder tree
- Use breadcrumb navigation at the top of the right panel for quick navigation

### File Management
1. **Upload Files**
   - Click "Upload File" button in the right panel
   - Select file from your computer
   - Wait for upload to complete

2. **Create Folders**
   - Click "New Folder" button
   - Enter folder name
   - Click Create or press Enter

3. **Rename Items**
   - Click the three dots menu next to any file or folder
   - Select "Rename"
   - Enter new name
   - Click Rename or press Enter

4. **Delete Items**
   - Click the three dots menu next to any file or folder
   - Select "Delete"
   - Confirm deletion

5. **Preview Files**
   - Click on any file to preview its contents
   - Click the preview icon in the file's menu

### Search
- Use the search bar in the toolbar to filter files and folders
- Results update in real-time as you type

## 🛠️ Tech Stack

- Vue 3 - Progressive JavaScript Framework
- Vuetify 3 - Material Design Component Framework
- TypeScript - Type Safety and Better Developer Experience
- Vite - Next Generation Frontend Tooling
- Bun - Runtime Javascript

## 📝 License

[MIT License](LICENSE)

## 👥 Authors

- Initial work - [Prima Jatnika]

## 📮 Support

If you have any questions or need help, please open an issue in the repository.
