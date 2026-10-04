# 🤖 AI Code Reviewer — GitHub App

## 🚀 How to Use

### Step 1: Open the Live Demo

Visit the live application:

👉 **[AI Code Reviewer — Live Demo](https://ai-review-github-app.onrender.com)*
### Step 2: Install the GitHub App

On the live demo page, click on:

**"Install on GitHub"**

You will be redirected to GitHub to install the AI Code Reviewer App.

---

### Step 3: Select Your Repository

GitHub will ask where you want to install the app.

You can choose:

- **All repositories**, or
- **Only select repositories**

Select the repository where you want to use the AI Code Reviewer.

Then click **Install**.

---

### Step 4: Create a Pull Request

After installing the app:

1. Open the selected GitHub repository.
2. Create a new branch.
3. Make some code changes.
4. Push your changes.
5. Create a Pull Request.

---

### Step 5: AI Automatically Reviews Your Code

Once the Pull Request is created or updated, the AI Code Reviewer automatically starts the review.

It:

- 🔍 Analyzes the changed code
- 🐛 Finds potential bugs
- 🔐 Identifies security issues
- ⚡ Suggests performance improvements
- 📊 Generates a code quality score

---

### Step 6: View the Review

After the analysis is completed, the AI-generated review is automatically posted as a comment on your Pull Request.

Example:

```text
🤖 AI Code Review

Score: 8/10

🐛 Bugs
Potential issues found...

🔐 Security
Security concerns...

⚡ Performance
Optimization suggestions...

✅ Positives
Good practices detected...

🔗 **Live Demo**: [https://ai-review-github-app.onrender.com](https://ai-review-github-app.onrender.com)

Automatically reviews every Pull Request using **Groq's llama-3.3-70b-versatile** model and posts a structured markdown comment with bugs, security issues, performance tips, and a score.

---

## 🛠 Tech Stack

- **Backend**: Node.js + Express
- **AI**: Groq API (`llama-3.3-70b-versatile`)
- **GitHub Integration**: Octokit + GitHub Apps JWT auth
- **Database**: MongoDB Atlas (Mongoose)
- **Deployment**: Render

---

## 📁 Project Structure

```
ai-review-github-app/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── webhookController.js   # Webhook event logic (PR + installation)
│   │   └── dashboardController.js # Stats API + dashboard page
│   ├── middleware/
│   │   └── verifySignature.js     # GitHub webhook signature verification
│   ├── models/
│   │   ├── Installation.js        # GitHub App installation schema
│   │   ├── Review.js              # PR review schema
│   │   └── Usage.js               # Monthly usage tracking schema
│   ├── routes/
│   │   ├── webhook.js             # POST /webhook
│   │   ├── dashboard.js           # GET / /dashboard /api/stats
│   │   └── health.js              # GET /health
│   ├── services/
│   │   ├── githubService.js       # GitHub API (JWT, diff, comment)
│   │   └── reviewerService.js     # Groq AI review + comment formatter
│   └── app.js                     # Express server entry point
├── dashboard/
│   ├── js/
│   │   ├── config.js              # Constants (APP_NAME, API URL)
│   │   ├── api.js                 # Fetch calls to backend
│   │   ├── utils.js               # escHtml, formatDate helpers
│   │   ├── render.js              # DOM rendering functions
│   │   └── main.js                # Entry point, init + auto-refresh
│   ├── index.html                 # Dashboard UI
│   └── style.css                  # Dark theme styles
├── .env.example
├── package.json
└── README.md
```

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
   - **Homepage URL**: `https://your-render-url.onrender.com`
   - **Webhook URL**: `https://your-render-url.onrender.com/webhook`
   - **Webhook secret**: generate a random string
3. **Permissions** (Repository):
   - Pull requests: **Read & Write**
   - Contents: **Read**
4. **Subscribe to events**: ✅ Pull request, ✅ Installation
5. Click **Create GitHub App**
6. On the app page → **Generate a private key** → download the `.pem` file
7. Note your **App ID** (shown at the top of the app settings page)

---

### 3. Setup MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. **Database Access** → Add a user with password
4. **Network Access** → Allow access from anywhere (`0.0.0.0/0`)
5. **Connect** → Copy the connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-reviewer
```

---

### 4. Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node src/app.js`
5. Add **Environment Variables**:

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | `gsk_xxxxx` |
| `GITHUB_APP_ID` | `123456` |
| `GITHUB_APP_PRIVATE_KEY` | Full `.pem` contents (newlines as `\n`) |
| `GITHUB_WEBHOOK_SECRET` | Your webhook secret |
| `GITHUB_CLIENT_ID` | From GitHub App settings |
| `GITHUB_CLIENT_SECRET` | From GitHub App settings |
| `MONGODB_URI` | Your Atlas connection string |
| `PORT` | `5000` |

> **Tip for private key**: Run this to get single-line format:
> ```bash
> python -c "print(open('private-key.pem').read().replace('\n', '\\n'))"
> ```

6. Deploy — copy the public URL and update your GitHub App's **Webhook URL**

---

### 5. Install the App on Your Repositories

1. Go to your GitHub App page → **Install App**
2. Choose your account / organization
3. Select repositories → **Install**
4. You'll be redirected to `/install/success`

---

### 6. Local Development

```bash
# Clone and install dependencies
git clone https://github.com/Harsh2126/ai-review-github-app
cd ai-review-github-app
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your keys

# Run the server
node src/app.js

# Expose locally with ngrok (for webhook testing)
ngrok http 5000
# Use the ngrok URL as your GitHub App webhook URL
```

---

## 📊 Dashboard

Visit `https://your-render-url.onrender.com/dashboard` to see:
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
| Type        | Description                         | Fix                        |
|-------------|-------------------------------------|----------------------------|
| 🔒 Security | SQL query uses string interpolation | Use parameterized queries  |

### ✅ Good Practices
- Proper use of async/await
- Clear variable naming

### 🚨 Must Fix Before Merge
- [ ] SQL injection vulnerability in login handler
```
