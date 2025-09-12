import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.NODE_ENV === 'production' ? '/maplehub/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only apply obfuscation in production builds
    mode === 'production' && obfuscatorPlugin({
      include: [/\.(jsx?|tsx?)$/],
      exclude: [/node_modules/, /\.nuxt/, /App\.tsx$/, /main\.tsx$/, /pages\/.*\.tsx$/], // Exclude main entry points and pages
      apply: 'build',
      options: {
        // Basic obfuscation settings
        compact: true,
        controlFlowFlattening: false, // Disable to avoid breaking dynamic imports
        controlFlowFlatteningThreshold: 0,
        deadCodeInjection: false, // Disable to avoid breaking module loading
        deadCodeInjectionThreshold: 0,
        debugProtection: false, // Disable to avoid breaking in development
        debugProtectionInterval: 0,
        disableConsoleOutput: true,
        
        // String obfuscation - more conservative
        stringArray: true,
        stringArrayCallsTransform: false, // Disable to preserve import paths
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1, // Reduce complexity
        stringArrayWrappersChainedCalls: false, // Disable to preserve imports
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.5, // Reduce threshold
        
        // Identifier obfuscation
        identifierNamesGenerator: 'hexadecimal',
        identifiersPrefix: '',
        renameGlobals: false,
        renameProperties: false,
        renamePropertiesMode: 'safe',
        
        // Transformations
        transformObjectKeys: false, // Disable to preserve module paths
        unicodeEscapeSequence: false,
        
        // Self-defending
        selfDefending: false, // Disable to avoid breaking module loading
        
        // Performance settings
        simplify: true,
        splitStrings: false, // Disable to preserve import paths
        splitStringsChunkLength: 10,
        
        // Additional protections
        target: 'browser',
        log: false,
        sourceMap: false,
        
        // Preserve dynamic imports and module paths
        reservedNames: [
          'import', 'require', 'module', 'exports', 'lazy', 'Suspense',
          'getAssetUrl', 'getBasePath', 'window', 'location', 'hostname',
          'Index', 'BossTracker', 'TaskTracker', 'VITracker', 'Mules', 
          'ServerStatus', 'LiberationCalculator', 'FragmentCalculator', 'NotFound'
        ],
        reservedStrings: [
          '/pages/', '/assets/', '/maplehub/', './pages/', './assets/',
          '/bosses/', 'bosses/', 'placeholder.png', 'placeholder.svg',
          'getAssetUrl', 'getBasePath', 'window.location.hostname', 'github.io',
          'Index', 'BossTracker', 'TaskTracker', 'VITracker', 'Mules', 
          'ServerStatus', 'LiberationCalculator', 'FragmentCalculator', 'NotFound'
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
            return 'vendor';
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash].[ext]`;
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    chunkSizeWarningLimit: 1500, // Increase from 1000kB to 1500kB
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}));