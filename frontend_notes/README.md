# Notes App Frontend

A modern, responsive React frontend for the Notes application built with TypeScript, Vite, and Tailwind CSS. This application provides a clean and intuitive interface for creating, editing, and managing personal notes.

## 🚀 Features

- ✅ **Modern React Architecture** - Built with React 18, TypeScript, and modern hooks
- 🎨 **Beautiful UI** - Clean, dark theme with Tailwind CSS
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ♿ **Accessibility First** - WCAG compliant with proper ARIA labels and keyboard navigation
- 🔄 **Real-time Updates** - Instant note creation, editing, and deletion
- 🔍 **Advanced Search** - Full-text search across all notes
- 🏷️ **Tagging System** - Organize notes with custom tags
- 📦 **Archive Support** - Archive and restore notes as needed
- 🛡️ **Error Boundaries** - Graceful error handling and recovery
- ⚡ **Performance Optimized** - Code splitting, lazy loading, and optimized renders
- 🔧 **Developer Experience** - Hot reload, TypeScript, ESLint, and Prettier

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3
- **Language**: TypeScript 5.6
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Axios 1.7
- **Icons**: Lucide React
- **Development Tools**: ESLint, Prettier
- **Type Safety**: Full TypeScript coverage

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ErrorBoundary.tsx    # Error boundary component
│   ├── ErrorMessage.tsx     # Error message display
│   ├── LoadingSpinner.tsx   # Loading indicator
│   ├── NoteCard.tsx         # Individual note display
│   └── NoteForm.tsx         # Note creation/editing form
├── config/             # Application configuration
│   └── constants.ts         # Constants and configuration values
├── hooks/              # Custom React hooks
│   ├── useForm.ts           # Form state management hook
│   └── useNotes.ts          # Notes data management hook
├── services/           # External service integrations
│   └── api.ts               # API service layer
├── types/              # TypeScript type definitions
│   └── index.ts             # Application type definitions
├── utils/              # Utility functions
│   └── index.ts             # Helper functions and utilities
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0 or yarn >= 1.22.0
- Backend API server running (see backend documentation)

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd notes-app/frontend-notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Notes App
   VITE_ENABLE_DEV_TOOLS=true
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run build:analyze` | Build and analyze bundle size |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code analysis |
| `npm run lint:fix` | Fix auto-fixable linting issues |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run clean` | Clean build artifacts and cache |

## 🎯 Usage

### Creating Notes
1. Fill in the title and content fields in the form
2. Click "Create Note" to save
3. Your note will appear in the notes grid immediately

### Editing Notes
1. Click the edit icon on any note card
2. The form will populate with the note's current content
3. Make your changes and click "Update Note"

### Managing Notes
- **Delete**: Click the trash icon and confirm deletion
- **Copy**: Use the menu to copy note content to clipboard
- **Archive**: Archive notes to keep them but hide from main view
- **Search**: Use the search functionality to find specific notes

### Keyboard Navigation
- Use Tab to navigate between interactive elements
- Press Enter to activate buttons and links
- Use arrow keys within form controls
- Press Escape to close modals and menus

## 🎨 Customization

### Themes
The application uses a dark theme by default. You can customize colors in:
- `src/config/constants.ts` - Theme configuration
- `tailwind.config.js` - Tailwind CSS customization

### API Configuration
Update API settings in:
- `.env` - Environment variables
- `src/config/constants.ts` - API configuration constants
- `src/services/api.ts` - API service implementation

### UI Components
All components are modular and customizable:
- Props interfaces defined in `src/types/index.ts`
- Styling with Tailwind CSS classes
- Accessibility attributes included

## 🧪 Development

### Code Quality
- **TypeScript**: Full type safety with strict mode enabled
- **ESLint**: Comprehensive linting rules for React and TypeScript
- **Prettier**: Consistent code formatting
- **Accessibility**: WCAG compliance with automated checking

### Performance
- **Code Splitting**: Automatic route-based splitting
- **Bundle Optimization**: Vite's built-in optimizations
- **Memory Management**: Proper cleanup of event listeners and timers
- **Efficient Renders**: React.memo and useCallback optimizations

### Error Handling
- **Error Boundaries**: Catch and handle React component errors
- **API Errors**: Comprehensive error handling with user-friendly messages
- **Form Validation**: Real-time validation with helpful feedback
- **Network Issues**: Retry logic and offline handling

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application Settings
VITE_APP_NAME=Notes App
VITE_APP_VERSION=2.0.0
VITE_ENABLE_DEV_TOOLS=true

# Feature Flags
VITE_ENABLE_SEARCH=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_EXPORT=true
```

### Build Configuration
- **Vite Config**: `vite.config.ts`
- **TypeScript**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **Tailwind**: `tailwind.config.js`
- **ESLint**: `eslint.config.js`

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | >= 90 |
| Firefox | >= 88 |
| Safari | >= 14 |
| Edge | >= 90 |

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy Static Files
The `dist/` folder contains all static files ready for deployment to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Environment Configuration
Set production environment variables:
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Notes App
VITE_ENABLE_DEV_TOOLS=false
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new code
3. Include proper accessibility attributes
4. Add JSDoc comments for complex functions
5. Test your changes thoroughly
6. Update documentation as needed

## 🐛 Common Issues

### Build Errors
- Ensure Node.js version >= 18.0.0
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npm run type-check`

### API Connection Issues
- Verify backend server is running
- Check VITE_API_URL in .env file
- Ensure CORS is configured on backend
- Check browser console for network errors

### Performance Issues
- Use React DevTools Profiler
- Check bundle size: `npm run build:analyze`
- Verify no memory leaks in useEffect cleanup

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related

- [Backend API Documentation](../backend_notes/README.md)
- [API Endpoints Reference](../backend_notes/README.md#api-endpoints)
- [Docker Setup Guide](../README.md)

---

Made with ❤️ using React, TypeScript, and Vite
