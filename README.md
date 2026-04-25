# 🤖 AI Code Reviewer — GitHub App

Automatically reviews every Pull Request using **Groq's llama3-70b-8192** model and posts a structured markdown comment with bugs, security issues, performance tips, and a score.

---

## 🚀 Quick Start

### 1. Get a Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / log in → **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_`)

---

### 2. Create a GitHub App

1. Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App**
2. Fill in:
   - **App name**: `my-ai-code-reviewer` (must be unique)
   - **Homepage URL**: `https://your-railway-url.railway.app`
   - **Webhook URL**: `https://your-railway-url.railway.app/webhook`
   - **Webhook secret**: generate a random string (e.g. `openssl rand -hex 32`)
3. **Permissions** (Repository):
   - Pull requests: **Read & Write**
   - Contents: **Read**
4. **Subscribe to events**: ✅ Pull request, ✅ Installation
5. Click **Create GitHub App**
6. On the app page → **Generate a private key** → download the `.pem` file
7. Note your **App ID** (shown at the top of the app settings page)

---

### 3. Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
3. Select this repository
4. Add the following **Environment Variables** in Railway:

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | `gsk_xxxxx` |
| `GITHUB_APP_ID` | `123456` |
| `GITHUB_APP_PRIVATE_KEY` | Full contents of the `.pem` file (newlines as `\n`) |
| `GITHUB_WEBHOOK_SECRET` | Your webhook secret string |
| `GITHUB_CLIENT_ID` | From GitHub App settings |
| `GITHUB_CLIENT_SECRET` | From GitHub App settings |
| `PORT` | `5000` |

> **Tip for private key**: Run `awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private-key.pem` to get the single-line format.

5. Railway will auto-deploy. Copy the public URL and update your GitHub App's **Webhook URL**.

---

### 4. Install the App on Your Repositories

1. Go to your GitHub App page → **Install App**
2. Choose your account / organization
3. Select repositories → **Install**
4. You'll be redirected to `/install/success`

---

### 5. Local Development

```bash
# Clone and install dependencies
git clone https://github.com/your-username/ai-review-github-app
cd ai-review-github-app
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your keys

# Run the server
python src/app.py

# Expose locally with ngrok (for webhook testing)
ngrok http 5000
# Use the ngrok URL as your GitHub App webhook URL
```

---

## 📊 Dashboard

Visit `https://your-railway-url.railway.app/dashboard` to see:
- Total PRs reviewed
- Active installations
- Recent review history with scores and severity badges

---

## 🔍 Review Format

Every PR gets a comment like:

```
## 🤖 AI Code Review

**Score: 7/10** | 🟡 Medium Priority

### 📋 Summary
The changes introduce a new authentication flow but lack input validation...

### 🐛 Issues Found
| Type       | Description                        | Fix                          |
|------------|------------------------------------|------------------------------|
| 🔒 Security | SQL query uses string interpolation | Use parameterized queries    |

### ✅ Good Practices
- Proper use of async/await
- Clear variable naming

### 🚨 Must Fix Before Merge
- [ ] SQL injection vulnerability in login handler
```

---

## 📁 Project Structure

```
ai-review-github-app/
├── src/
│   ├── app.py              # Flask routes
│   ├── github_app.py       # GitHub App auth + API calls
│   ├── reviewer.py         # Groq AI review logic
│   ├── webhook_handler.py  # Webhook event processing
│   └── database.py         # SQLite persistence
├── dashboard/
│   ├── index.html          # Dashboard UI
│   ├── style.css
│   └── app.js
├── .env.example
├── requirements.txt
├── Procfile
└── railway.json
```

---

## 🛠 Tech Stack

- **Backend**: Python + Flask
- **AI**: Groq API (`llama3-70b-8192`)
- **GitHub Integration**: PyGithub + GitHub Apps JWT auth
- **Database**: SQLite
- **Deployment**: Railway
