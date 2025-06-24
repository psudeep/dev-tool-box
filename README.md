# Dev Toolbox 🧠

A comprehensive desktop application for developers featuring essential utilities in one convenient package. Built with Electron and React, it provides a native desktop experience across Windows, macOS, and Linux.

![Dev Toolbox](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🛠️ Features

### 📄 JSON Formatter & Validator
- Format, validate, and beautify JSON data
- Syntax highlighting and error detection
- Minification and pretty printing
- Sample JSON templates

### 🔓 Base64/JWT Decoder
- Decode Base64 strings
- JWT token parsing and inspection
- Header and payload viewing
- Signature validation display

### 🔄 cURL Converter
- Convert cURL commands to JavaScript code
- Support for Fetch API, Axios, and XMLHttpRequest
- Header and data preservation
- Multiple output formats

### 🔍 Regex Tester
- Test regular expressions against sample text
- Live match highlighting
- Group capture and named groups
- Common pattern templates

### 🎨 Color Picker
- Visual color picker interface
- Convert between HEX, RGB, HSL formats
- Color palette management
- Accessibility testing

### 📝 Markdown Preview
- Real-time Markdown to HTML conversion
- GitHub Flavored Markdown support
- Split view and full-screen modes
- Export to HTML

### 🌐 API Tester
- Test REST APIs with custom headers
- Support for all HTTP methods
- Request/response history
- Response time and size tracking

## 🏗️ Project Structure

```
dev-toolbox/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   └── manifest.json      # Web app manifest
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # Main Electron process
│   │   └── preload.js     # Preload script for security
│   ├── components/        # React components
│   │   ├── Home.js        # Home page component
│   │   ├── Sidebar.js     # Navigation sidebar
│   │   ├── JsonFormatter.js
│   │   ├── Decoder.js
│   │   ├── CurlConverter.js
│   │   ├── RegexTester.js
│   │   ├── ColorPicker.js
│   │   ├── MarkdownPreview.js
│   │   └── ApiTester.js
│   ├── __tests__/         # Test files
│   │   ├── components/    # Component tests
│   │   └── setup.js       # Test setup
│   ├── App.js             # Main React app
│   ├── App.css            # App styles
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── jest.e2e.config.js     # E2E test configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dev-toolbox.git
   cd dev-toolbox
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   This will start both the React development server and Electron app.

## 📋 Available Scripts

### Development
```bash
# Start development environment (React + Electron)
npm run dev

# Start only React development server
npm run start-renderer

# Start only Electron (requires React server to be running)
npm start
```

### Building
```bash
# Build React app for production
npm run build

# Build Electron app for current platform
npm run build-electron

# Build for all platforms (Windows, macOS, Linux)
npm run build-all

# Build without publishing
npm run dist

# Package app without installer
npm run pack
```

### Testing
```bash
# Run React component tests
npm test

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm test -- --coverage
```

### Publishing
```bash
# Build and publish to GitHub Releases
npm run publish
```

## 🧪 Testing

The project includes comprehensive testing setup:

### Unit Tests
- React component testing with React Testing Library
- Jest configuration for modern JavaScript features
- Mocked Electron APIs for testing

### E2E Tests
- End-to-end testing setup with custom configuration
- Integration tests for complete user workflows

### Running Tests
```bash
# Interactive test runner
npm test

# Run tests once
npm test -- --watchAll=false

# Run with coverage report
npm test -- --coverage --watchAll=false

# Run E2E tests
npm run test:e2e
```

## 📦 Building for Production

### Single Platform
```bash
# Build for current platform
npm run build-electron
```

### Multi-Platform
```bash
# Build for all platforms
npm run build-all
```

### Platform-Specific Builds
```bash
# macOS only
npm run build && npx electron-builder --mac

# Windows only
npm run build && npx electron-builder --win

# Linux only
npm run build && npx electron-builder --linux
```

## 🔧 Configuration

### Electron Builder Configuration
The app is configured to build for multiple platforms with the following output formats:

- **macOS**: DMG installer with support for both Intel and Apple Silicon
- **Windows**: NSIS installer for x64 and x86 architectures
- **Linux**: AppImage and DEB packages for x64

### Development Configuration
- Hot reload enabled for development
- DevTools automatically opened in development mode
- Secure context isolation enabled
- Node integration disabled for security

## 🛡️ Security

This application follows Electron security best practices:

- Context isolation enabled
- Node integration disabled in renderer
- Remote module disabled
- Preload scripts for secure IPC communication
- Input sanitization for all user data

## 🔄 Auto-Updates

The application supports automatic updates through electron-builder's built-in update mechanism. Updates are distributed through GitHub Releases.

## 🎨 Customization

### Themes
The application supports both light and dark modes across all tools. Theme preference is maintained per-tool basis.

### Adding New Tools
To add a new tool:

1. Create a new component in `src/components/`
2. Add the route in `src/App.js`
3. Update the sidebar navigation in `src/components/Sidebar.js`
4. Add any necessary dependencies to `package.json`

## 📱 Platform-Specific Features

### macOS
- Native menu bar integration
- Keyboard shortcuts follow macOS conventions
- Proper window management

### Windows
- Native Windows installer
- Start menu integration
- Windows-specific keyboard shortcuts

### Linux
- AppImage for universal compatibility
- DEB package for Debian-based distributions
- Desktop file integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Maintain consistent code style
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) - Framework for desktop apps
- [React](https://reactjs.org/) - UI library
- [CodeMirror](https://codemirror.net/) - Code editor component
- [Marked](https://marked.js.org/) - Markdown parser
- [Axios](https://axios-http.com/) - HTTP client
- [React Color](https://casesandberg.github.io/react-color/) - Color picker component

## 🐛 Bug Reports

If you find a bug, please create an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- System information (OS, version, etc.)

## 💡 Feature Requests

Feature requests are welcome! Please create an issue with:
- Clear description of the feature
- Use case and benefits
- Any implementation suggestions

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review common troubleshooting steps

---

**Built with ❤️ by developers, for developers** 