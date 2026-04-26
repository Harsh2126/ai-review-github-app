const Groq = require("groq-sdk");

class AIReviewer {
  constructor() {
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async review(diff) {
    if (!diff || !diff.trim()) return this._emptyReview("No diff content provided.");

    const prompt = `You are an expert code reviewer. Analyze the following git diff and return ONLY a valid JSON object.

Git Diff:
\`\`\`
${diff.slice(0, 8000)}
\`\`\`

Return this exact JSON structure (no markdown, no extra text):
{
  "summary": "2-3 sentence assessment of the overall code changes",
  "score": "X/10",
  "severity": "low|medium|high",
  "issues": [
    {
      "type": "bug|security|performance|style",
      "description": "clear explanation of the issue",
      "suggestion": "specific fix recommendation"
    }
  ],
  "positives": ["list of good practices observed"],
  "must_fix": ["critical issues that must be resolved before merging"]
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      });

      let raw = response.choices[0].message.content.trim();
      if (raw.startsWith("```")) {
        raw = raw.split("```")[1];
        if (raw.startsWith("json")) raw = raw.slice(4);
      }
      return JSON.parse(raw.trim());
    } catch (e) {
      if (e instanceof SyntaxError) return this._emptyReview("AI returned non-JSON response.");
      return this._emptyReview(`Review failed: ${e.message}`);
    }
  }

  formatComment(review) {
    const severityEmoji = { low: "🟢", medium: "🟡", high: "🔴" }[review.severity] || "🟡";
    const typeEmoji = { bug: "🐛", security: "🔒", performance: "⚡", style: "✨" };

    const issuesRows = (review.issues || []).map((i) => {
      const emoji = typeEmoji[i.type] || "📌";
      return `| ${emoji} ${(i.type || "").charAt(0).toUpperCase() + (i.type || "").slice(1)} | ${i.description || ""} | ${i.suggestion || ""} |`;
    }).join("\n");

    const positives = (review.positives || ["No specific positives noted."]).map((p) => `- ${p}`).join("\n");
    const mustFix = (review.must_fix || []).map((m) => `- [ ] ${m}`).join("\n") || "- [ ] No critical issues";

    return `---
## 🤖 AI Code Review

**Score: ${review.score || "N/A"}** | ${severityEmoji} ${(review.severity || "medium").charAt(0).toUpperCase() + (review.severity || "medium").slice(1)} Priority

### 📋 Summary
${review.summary || "No summary available."}

### 🐛 Issues Found
| Type | Description | Fix |
|------|-------------|-----|
${issuesRows || "| ✅ None | No issues detected | — |"}

### ✅ Good Practices
${positives}

### 🚨 Must Fix Before Merge
${mustFix}

---
*Powered by AI Code Reviewer · llama-3.3-70b-versatile*
---`;
  }

  _emptyReview(reason) {
    return { summary: reason, score: "N/A", severity: "low", issues: [], positives: [], must_fix: [] };
  }
}

module.exports = AIReviewer;
