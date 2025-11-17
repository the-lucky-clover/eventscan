# 🌐 CALCLiK Custom Domain Setup Guide

## 📋 Overview
This guide will help you connect a custom domain (like `calclik.com` or `CALCLiK.com`) to your Cloudflare Pages deployment.

---

## 🚀 Method 1: Cloudflare Pages Dashboard (Recommended)

### Step 1: Access Cloudflare Dashboard
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Pages** → **calclik** (your project)
3. Click on the **"Custom domains"** tab

### Step 2: Add Custom Domain
1. Click **"Set up a custom domain"**
2. Enter your domain name:
   - `calclik.com` (recommended for simplicity)
   - `CALCLiK.com` (matches branding but harder to type)
   - `www.calclik.com` (if you prefer www)
3. Click **"Continue"**

### Step 3: Configure DNS
Cloudflare will provide you with DNS records to add:

**For Root Domain (calclik.com):**
```
Type: CNAME
Name: @
Target: calclik.pages.dev
```

**For WWW Subdomain:**
```
Type: CNAME  
Name: www
Target: calclik.pages.dev
```

---

## 🛠️ Method 2: If You Own the Domain Already

### If Domain is on Cloudflare:
1. Go to **DNS** → **Records**
2. Add CNAME record:
   - **Type**: CNAME
   - **Name**: @ (for root) or www
   - **Target**: calclik.pages.dev
   - **TTL**: Auto

### If Domain is External (GoDaddy, Namecheap, etc.):
1. Log into your domain registrar
2. Find DNS settings/management
3. Add CNAME record pointing to `calclik.pages.dev`
4. **OR** Change nameservers to Cloudflare for better performance

---

## 🎯 Method 3: Buy New Domain Through Cloudflare

### Step 1: Register Domain
1. In Cloudflare Dashboard → **Domain Registration**
2. Search for available domains:
   - `calclik.com`
   - `getcalclik.com` 
   - `calclik.app`
   - `calclik.io`

### Step 2: Auto-Configuration
- Cloudflare automatically configures DNS for domains purchased through them
- Your Pages project will be immediately accessible via the new domain

---

## ⚡ Quick Setup Commands

If you need to check your current Pages setup:

```bash
# List your Pages projects
wrangler pages project list

# Check current deployments
wrangler pages deployment list --project-name calclik

# Deploy latest changes
wrangler pages deploy landing-page
```

---

## 🔧 Domain Recommendations

### Best Options for CALCLiK:

1. **calclik.com** ⭐ (Recommended)
   - Easy to type and remember
   - Professional appearance
   - SEO friendly

2. **calclik.app** 
   - Modern, tech-focused TLD
   - Perfect for web applications
   - Trendy and memorable

3. **getcalclik.com**
   - Clear call-to-action in URL
   - Good for marketing campaigns
   - Descriptive and actionable

4. **calclik.io**
   - Developer/tech focused
   - Short and clean
   - Popular in tech community

---

## 📊 SSL & Security

Cloudflare automatically provides:
- ✅ Free SSL certificate
- ✅ DDoS protection  
- ✅ CDN acceleration
- ✅ Analytics and performance metrics

---

## 🎯 Next Steps After Domain Setup

1. **Update Marketing Materials:**
   - Update README.md with new domain
   - Update extension popup links
   - Update social media profiles

2. **Set up Redirects:**
   - Redirect `calclik.pages.dev` to custom domain
   - Set up www → non-www redirect (or vice versa)

3. **Analytics:**
   - Add Google Analytics with new domain
   - Update any tracking pixels or marketing tools

---

## 🆘 Troubleshooting

### Domain Not Working?
- Wait 24-48 hours for DNS propagation
- Check DNS records with `dig calclik.com`
- Verify CNAME points to `calclik.pages.dev`

### SSL Certificate Issues?
- Cloudflare usually auto-provisions SSL within 15 minutes
- Try "Force HTTPS" in Pages settings
- Check certificate status in Cloudflare Dashboard

### Need Help?
- Cloudflare Support: [support.cloudflare.com](https://support.cloudflare.com)
- Check status: [cloudflarestatus.com](https://cloudflarestatus.com)

---

**🎉 Once configured, your CALCLiK landing page will be accessible at your custom domain with full SSL, CDN, and DDoS protection!**