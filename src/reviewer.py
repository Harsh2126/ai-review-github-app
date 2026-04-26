import os
import json
from groq import Groq


class AIReviewer:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def review(self, diff: str) -> dict:
        if not diff or not diff.strip():
            return self._empty_review("No diff content provided.")

        prompt = f"""You are an expert code reviewer. Analyze the following git diff and return ONLY a valid JSON object.

Git Diff:
```
{diff[:8000]}
```

Return this exact JSON structure (no markdown, no extra text):
{{
  "summary": "2-3 sentence assessment of the overall code changes",
  "score": "X/10",
  "severity": "low|medium|high",
  "issues": [
    {{
      "type": "bug|security|performance|style",
      "description": "clear explanation of the issue",
      "suggestion": "specific fix recommendation"
    }}
  ],
  "positives": ["list of good practices observed"],
  "must_fix": ["critical issues that must be resolved before merging"]
}}"""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.3,
            )
            raw = response.choices[0].message.content.strip()
            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw.strip())
        except json.JSONDecodeError:
            return self._empty_review("AI returned non-JSON response.")
        except Exception as e:
            return self._empty_review(f"Review failed: {str(e)}")

    def format_comment(self, review: dict) -> str:
        severity_emoji = {"low": "🟢", "medium": "🟡", "high": "🔴"}.get(
            review.get("severity", "medium"), "🟡"
        )
        type_emoji = {"bug": "🐛", "security": "🔒", "performance": "⚡", "style": "✨"}

        issues_rows = ""
        for issue in review.get("issues", []):
            emoji = type_emoji.get(issue.get("type", "style"), "📌")
            issues_rows += f"| {emoji} {issue.get('type','').capitalize()} | {issue.get('description','')} | {issue.get('suggestion','')} |\n"

        positives = "\n".join(
            f"- {p}" for p in review.get("positives", ["No specific positives noted."])
        )
        must_fix = "\n".join(
            f"- [ ] {m}" for m in review.get("must_fix", [])
        ) or "- [ ] No critical issues"

        return f"""---
## 🤖 AI Code Review

**Score: {review.get('score', 'N/A')}** | {severity_emoji} {review.get('severity', 'medium').capitalize()} Priority

### 📋 Summary
{review.get('summary', 'No summary available.')}

### 🐛 Issues Found
| Type | Description | Fix |
|------|-------------|-----|
{issues_rows if issues_rows else '| ✅ None | No issues detected | — |\n'}
### ✅ Good Practices
{positives}

### 🚨 Must Fix Before Merge
{must_fix}

---
*Powered by AI Code Reviewer · llama3-70b-8192*
---"""

    def _empty_review(self, reason: str) -> dict:
        return {
            "summary": reason,
            "score": "N/A",
            "severity": "low",
            "issues": [],
            "positives": [],
            "must_fix": [],
        }
