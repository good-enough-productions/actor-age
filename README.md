# IMDb Actor Age at Release Extension

A modern Chrome extension that displays actors' ages at the time of movie release on IMDb's Full Cast and Crew pages. Built with TypeScript, modern web APIs, and deployed on Google Cloud Run.

## 🚀 Features

- **Automatic Age Display**: Shows ages for top 10 cast members automatically
- **On-Demand Loading**: "Get Age" buttons for remaining cast members
- **Modern Architecture**: TypeScript, ES2022, Manifest V3
- **Cloud-Powered**: API service deployed on Google Cloud Run
- **Caching**: Intelligent caching to reduce API calls
- **Rate Limiting**: Built-in protection against API abuse
- **Responsive Design**: Clean, IMDb-integrated UI

## 🏗️ Architecture

### Extension Components
- **Background Script**: Handles tab monitoring and API communication
- **Content Script**: Modifies IMDb pages and manages UI
- **Popup**: Extension status and information
- **API Service**: Node.js/Express server on Google Cloud Run

### Technology Stack
- **Frontend**: TypeScript, Chrome Extension APIs
- **Backend**: Node.js, Express, Google Cloud Run
- **APIs**: The Movie Database (TMDB)
- **Build Tools**: Webpack, TypeScript Compiler
- **Testing**: Jest, ESLint
- **Deployment**: Docker, Google Cloud Build

## 📦 Installation

### Prerequisites
- Node.js 18+
- Chrome browser
- Google Cloud account (for API deployment)
- TMDB API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/imdb-extension.git
   cd imdb-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your TMDB API key
   ```

4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### API Server Deployment

#### Local Development
```bash
npm run start:server
```

#### Google Cloud Run Deployment

1. **Set up Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Store API key in Secret Manager**
   ```bash
   echo "your_tmdb_api_key" | gcloud secrets create tmdb-api-key --data-file=-
   ```

3. **Deploy using Cloud Build**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

4. **Update extension manifest**
   - Update the API URL in `src/services/ApiService.ts`
   - Rebuild and reload the extension

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 Performance Optimizations

### Caching Strategy
- **Browser Cache**: 24-hour TTL for API responses
- **Server Cache**: In-memory caching with NodeCache
- **Smart Loading**: Only fetch data when needed

### Rate Limiting
- **Client-side**: Debounced requests
- **Server-side**: 100 requests per minute per IP
- **API Protection**: Prevents TMDB API quota exhaustion

### Bundle Optimization
- **Tree Shaking**: Removes unused code
- **Code Splitting**: Separate bundles for different components
- **Minification**: Compressed production builds

## 🔒 Security Features

### API Security
- **CORS Protection**: Restricted origins
- **Helmet.js**: Security headers
- **Rate Limiting**: DDoS protection
- **Input Validation**: Sanitized user inputs

### Extension Security
- **Manifest V3**: Latest security standards
- **Minimal Permissions**: Only required permissions
- **Content Security Policy**: XSS protection
- **Secure Communication**: HTTPS-only API calls

## 🚀 Deployment Guide

### Google Cloud Run Setup

1. **Create a new project**
   ```bash
   gcloud projects create imdb-extension-api
   gcloud config set project imdb-extension-api
   ```

2. **Enable required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

3. **Set up billing** (required for Cloud Run)
   - Visit Google Cloud Console
   - Enable billing for your project

4. **Deploy the service**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TMDB_API_KEY` | The Movie Database API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 8080) | No |

### Monitoring and Logging

- **Cloud Logging**: Automatic log collection
- **Cloud Monitoring**: Performance metrics
- **Error Reporting**: Automatic error tracking
- **Health Checks**: Built-in health endpoint

## 📈 Usage Analytics

The extension includes privacy-respecting usage tracking:
- No personal data collection
- Aggregated usage statistics only
- GDPR compliant
- Opt-out available

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the API
- [IMDb](https://www.imdb.com/) for the platform
- Chrome Extensions team for the APIs

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/imdb-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/imdb-extension/discussions)
- **Email**: support@yourextension.com

## 🔄 Changelog

### v2.0.0 (Latest)
- Complete TypeScript rewrite
- Manifest V3 migration
- Google Cloud Run deployment
- Improved caching and performance
- Enhanced security features
- Modern build pipeline

### v1.0.0
- Initial release
- Basic age calculation functionality
- TMDB API integration