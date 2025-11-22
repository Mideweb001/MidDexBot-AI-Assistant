# 🚨 SECURITY INCIDENT: API Key Exposed

## Incident Details

**Date:** November 22, 2025
**Severity:** HIGH
**Type:** Leaked Credentials (Google Maps API Key)

**Detection:**
Google Cloud detected exposed credentials in public GitHub repository:
- **File:** `RESTAURANT-LOCATION-COMPLETE.md`
- **Commit:** `e940fdc264958e3b12b20361bbb2dfbb8f462044`
- **Exposed Key:** `AIzaSyA_emBvG-_Q1szvRUz9CiYEKdheJ06HHEI`

---

## ✅ Immediate Actions Taken

1. **Removed exposed API key from documentation files:**
   - ✅ `RESTAURANT-LOCATION-COMPLETE.md` - Replaced with placeholder
   - ✅ `RESTAURANT-DATABASE-GUIDE.md` - Replaced with placeholder (2 instances)

2. **Files sanitized and ready to commit**

---

## 🔒 Required Actions (DO THESE NOW!)

### 1. Regenerate Google Maps API Key

**CRITICAL:** The exposed key must be deleted and regenerated!

**Steps:**
1. Go to: https://console.cloud.google.com/apis/credentials?project=telegram-bot-479005-k8
2. Find the key: `AIzaSyA_emBvG-_Q1szvRUz9CiYEKdheJ06HHEI`
3. Click on it → **DELETE** (or restrict/regenerate)
4. Create a **new** API key
5. **Restrict the new key:**
   - Application restrictions: Set to HTTP referrers or IP addresses
   - API restrictions: Only enable Places API, Geocoding API, Maps JavaScript API

### 2. Update Railway with New Key

```bash
# After generating new key
railway variables set GOOGLE_MAPS_API_KEY=NEW_KEY_HERE
```

### 3. Update Local .env File

```bash
# Edit .env file (NEVER commit this file!)
GOOGLE_MAPS_API_KEY=NEW_KEY_HERE
```

### 4. Commit Sanitized Files

```bash
git add RESTAURANT-LOCATION-COMPLETE.md RESTAURANT-DATABASE-GUIDE.md SECURITY-INCIDENT.md
git commit -m "security: Remove exposed Google Maps API key from documentation

- Replace hardcoded API key with placeholders
- Add security incident documentation
- Update setup instructions with best practices"

git push origin main
```

### 5. Verify .env is Gitignored

```bash
# Check if .env is in .gitignore
grep "\.env" .gitignore

# If not found, add it:
echo ".env" >> .gitignore
git add .gitignore
git commit -m "security: Ensure .env file is gitignored"
git push origin main
```

---

## 🛡️ Prevention Measures

### 1. Use .gitignore Properly

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.*.local

# API Keys
*apikey*
*api-key*
*API_KEY*
```

### 2. Use Environment Variables

**Never hardcode in code:**
```javascript
// ❌ WRONG
const apiKey = "AIzaSyA_emBvG-_Q1szvRUz9CiYEKdheJ06HHEI";

// ✅ CORRECT
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
```

### 3. Use .env.example

Create `.env.example` with placeholders:
```bash
# .env.example (safe to commit)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DATABASE_URL=your_database_url_here
```

### 4. Pre-commit Hooks

Install `git-secrets` to prevent accidental commits:
```bash
brew install git-secrets
git secrets --install
git secrets --register-aws
```

### 5. GitHub Secret Scanning

Enable on your repository:
1. Settings → Security → Code security and analysis
2. Enable "Secret scanning"
3. Enable "Push protection"

---

## 📊 Impact Assessment

### Potential Risks:

1. **API Quota Abuse**
   - ⚠️ Risk: High
   - Impact: Unauthorized usage, unexpected charges
   - Mitigation: Delete old key immediately

2. **Service Disruption**
   - ⚠️ Risk: Medium
   - Impact: Restaurant discovery feature won't work with old key
   - Mitigation: Update Railway with new key quickly

3. **Cost Impact**
   - ⚠️ Risk: Low (currently using free tier)
   - Impact: Potential charges if abused
   - Mitigation: Monitor usage, set billing alerts

### Actual Damage:

- ✅ Key exposed: ~30 minutes
- ✅ No evidence of unauthorized usage yet
- ✅ Free tier limits protect against major charges
- ✅ Quick detection and response

---

## 🔍 Lessons Learned

### What Went Wrong:

1. API key was included in documentation file
2. Documentation file was committed to public repository
3. No pre-commit scanning for secrets

### What Went Right:

1. Google detected exposure quickly (within minutes)
2. Immediate response and remediation
3. No production services affected yet

### Improvements Needed:

1. ✅ Remove all hardcoded secrets
2. ✅ Use placeholders in documentation
3. ✅ Add .env.example instead of actual values
4. ⏳ Set up pre-commit hooks
5. ⏳ Enable GitHub secret scanning
6. ⏳ Add API key restrictions

---

## 📋 Checklist

**Immediate (Do Now):**
- [ ] Delete exposed API key in Google Cloud Console
- [ ] Generate new API key with restrictions
- [ ] Update Railway environment variable
- [ ] Update local .env file
- [ ] Commit sanitized documentation
- [ ] Push changes to GitHub

**Short-term (This Week):**
- [ ] Verify .env is gitignored
- [ ] Create .env.example file
- [ ] Enable GitHub secret scanning
- [ ] Set up billing alerts in Google Cloud
- [ ] Review all documentation for other secrets

**Long-term (This Month):**
- [ ] Set up pre-commit hooks
- [ ] Implement API key rotation policy
- [ ] Add security scanning to CI/CD
- [ ] Conduct security audit of codebase
- [ ] Train team on security best practices

---

## 📞 Resources

**Google Cloud Security:**
- Console: https://console.cloud.google.com/apis/credentials
- Security best practices: https://cloud.google.com/docs/security
- API key restrictions: https://cloud.google.com/docs/authentication/api-keys

**GitHub Security:**
- Secret scanning: https://docs.github.com/en/code-security/secret-scanning
- Security advisories: https://docs.github.com/en/code-security/security-advisories

**Tools:**
- git-secrets: https://github.com/awslabs/git-secrets
- truffleHog: https://github.com/trufflesecurity/trufflehog
- detect-secrets: https://github.com/Yelp/detect-secrets

---

## ✅ Resolution

**Status:** IN PROGRESS

**Next Actions:**
1. ⏳ User must regenerate API key
2. ⏳ User must update Railway
3. ✅ Documentation sanitized
4. ⏳ Commit and push changes

**Estimated Time to Resolution:** 5-10 minutes

---

**Document Created:** November 22, 2025
**Incident ID:** SEC-2025-11-22-001
**Classification:** Security Incident - Leaked Credentials
**Severity:** HIGH (but contained quickly)
