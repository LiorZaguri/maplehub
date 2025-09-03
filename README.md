# 🍁 MapleHub

A comprehensive MapleStory character and boss tracking application built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **Character Roster Management** - Track your MapleStory characters with detailed stats
- **Boss Tracker** - Monitor weekly, daily, and monthly boss progress
- **Performance Optimized** - Fast loading with code splitting and lazy loading
- **PWA Ready** - Service worker for offline support and caching
- **Responsive Design** - Works perfectly on desktop and mobile devices

## 🚀 Performance Features

- **Code Splitting** - Lazy loading for all pages
- **Bundle Optimization** - Vendor chunking and tree shaking
- **Image Optimization** - Lazy loading with proper dimensions
- **CSS Minification** - Tailwind purging and PostCSS optimization
- **Service Worker** - Intelligent caching strategy

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite 5
- **State Management**: React Query (TanStack Query)
- **Database**: Supabase
- **Deployment**: GitHub Pages

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/LiorZaguri/maplehub.git
cd maplehub

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Production build with optimization
npm run optimize

# Bundle analysis
npm run analyze

# Clean build directory
npm run clean
```

## 🌐 Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Set Source to "GitHub Actions"

3. **The GitHub Action will automatically**:
   - Build your application
   - Deploy to GitHub Pages
   - Your app will be available at: `https://liorzaguri.github.io/maplehub/`

### Manual Deployment

If you prefer manual deployment:

1. **Build the application**:
   ```bash
   npm run build:prod
   ```

2. **Deploy the `dist` folder** to GitHub Pages

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development (see `.env.example` for the full list):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For the Supabase Edge Function, define allowed origins in `supabase/.env`:

```env
ALLOWED_ORIGINS=http://localhost:5173
```

### Base Path

The application automatically detects if it's running on GitHub Pages and adjusts the base path accordingly.

## 📱 PWA Features

- **Offline Support** - Service worker caches essential resources
- **Installable** - Add to home screen on mobile devices
- **Background Sync** - Sync data when connection is restored

## 🎯 Performance Metrics

After optimization:
- **JavaScript Bundle**: Reduced from ~4.5MB to ~2.7MB
- **CSS Bundle**: Optimized and minified
- **Loading Speed**: Significantly improved with code splitting
- **Caching**: Service worker for better offline experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Vite](https://vitejs.dev/)
- Data management with [Supabase](https://supabase.com/)
