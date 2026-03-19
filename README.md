# QAInsights Chat Widget

A modern, terminal-inspired chat widget for QAInsights Knowledge Base.

## Features

- 🌓 **Light/Dark Mode** - Persistent theme switching
- 💬 **Terminal Aesthetic** - Matrix-style interface with neon accents
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Streaming Responses** - Real-time message streaming
- 💾 **Session Storage** - Chat history persistence
- 🎨 **Modular Architecture** - Separate CSS, JS, and HTML

## Quick Start

### Local Development
```bash
# Start a local server
python -m http.server 3000
# Then open http://localhost:3000
```

### Production Setup
Update `API_URL` in `chat.js` before deploying:
```javascript
const API_URL = 'https://qainsights-blog-rag.onrender.com/api/chat';
```

### GitHub Pages Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Add chat widget"
git push origin main
```

2. **Enable GitHub Pages**
- Go to your repository → Settings → Pages
- Source: Deploy from a branch → Branch: `main` → Folder: `/root`
- Save and wait for deployment

3. **Access your widget**
- `https://username.github.io/repository-name/`

### Integration

#### Method 1: Direct Embed
```html
<!-- Add to your website's <head> -->
<link href="https://username.github.io/repo-name/styles.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<!-- Add to your website's <body> -->
<div id="dosa-chat-root">
  <!-- Widget content from index.html -->
</div>
<script src="https://username.github.io/repo-name/chat.js"></script>
```

#### Method 2: Iframe Embed
```html
<iframe 
  src="https://username.github.io/repo-name/" 
  width="500" 
  height="700" 
  frameborder="0"
  style="border-radius: 8px;">
</iframe>
```

## Configuration

### API Endpoint
Update `API_URL` in `chat.js`:
```javascript
const API_URL = 'https://your-backend.com/api/chat';
```

### Branding
Customize in `index.html`:
- Header name
- Welcome messages
- Footer text
- Avatar text

## Free Hosting Options

| Platform | Storage | Bandwidth | Custom Domain | HTTPS |
|----------|---------|-----------|---------------|-------|
| **GitHub Pages** | 1GB | 100GB/month | ✅ | ✅ |
| **Netlify** | 100GB | 100GB/month | ✅ | ✅ |
| **Vercel** | Unlimited | 100GB/month | ✅ | ✅ |
| **Firebase Hosting** | 10GB | 360MB/day | ✅ | ✅ |

## Backend Requirements

Your chat backend needs:
- **CORS enabled** for your domain
- **Streaming support** (Server-Sent Events)
- **POST /api/chat** endpoint
- **JSON request/response** format

## License

MIT License - feel free to use in your projects!
