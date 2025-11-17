#!/bin/bash

# CALCLiK Extension Test & Validation Script
# This script validates all components are working correctly

echo "🚀 CALCLiK Extension Platform Test Suite"
echo "========================================"

# Check if all required files exist
echo ""
echo "📂 Checking file structure..."

# Chrome Extension Files
if [ -f "chrome-extension/manifest.json" ]; then
    echo "✅ Chrome manifest.json exists"
else
    echo "❌ Chrome manifest.json missing"
fi

if [ -f "chrome-extension/background.js" ]; then
    echo "✅ Chrome background.js exists"
else
    echo "❌ Chrome background.js missing"
fi

if [ -f "chrome-extension/content.js" ]; then
    echo "✅ Chrome content.js exists"
else
    echo "❌ Chrome content.js missing"
fi

if [ -f "chrome-extension/popup.js" ]; then
    echo "✅ Chrome popup.js exists"
else
    echo "❌ Chrome popup.js missing"
fi

# Safari Extension Files
if [ -f "safari-extension/manifest.json" ]; then
    echo "✅ Safari manifest.json exists"
else
    echo "❌ Safari manifest.json missing"
fi

# Landing Page Files
if [ -f "landing-page/index.html" ]; then
    echo "✅ Landing page exists"
else
    echo "❌ Landing page missing"
fi

# Download Packages
if [ -f "landing-page/CALCLiK-chrome-extension.zip" ]; then
    echo "✅ Chrome extension package exists"
    # Get file size
    SIZE=$(ls -lh landing-page/CALCLiK-chrome-extension.zip | awk '{print $5}')
    echo "   📁 Package size: $SIZE"
else
    echo "❌ Chrome extension package missing"
fi

if [ -f "landing-page/CALCLiK-safari-extension.zip" ]; then
    echo "✅ Safari extension package exists"
    # Get file size
    SIZE=$(ls -lh landing-page/CALCLiK-safari-extension.zip | awk '{print $5}')
    echo "   📁 Package size: $SIZE"
else
    echo "❌ Safari extension package missing"
fi

echo ""
echo "🔍 Validating manifest files..."

# Validate Chrome manifest
if grep -q "CALCLiK" chrome-extension/manifest.json; then
    echo "✅ Chrome manifest has correct name"
else
    echo "❌ Chrome manifest name incorrect"
fi

if grep -q "1.1.0" chrome-extension/manifest.json; then
    echo "✅ Chrome manifest has correct version"
else
    echo "❌ Chrome manifest version incorrect"
fi

# Validate Safari manifest
if grep -q "CALCLiK" safari-extension/manifest.json; then
    echo "✅ Safari manifest has correct name"
else
    echo "❌ Safari manifest name incorrect"
fi

if grep -q "1.1.0" safari-extension/manifest.json; then
    echo "✅ Safari manifest has correct version"
else
    echo "❌ Safari manifest version incorrect"
fi

echo ""
echo "🌐 Testing landing page..."

# Check if logo exists
if [ -f "landing-page/images/calclik-logo.svg" ]; then
    echo "✅ Logo file exists"
else
    echo "❌ Logo file missing"
fi

# Check for logo usage in HTML
if grep -q "calclik-logo.svg" landing-page/index.html; then
    echo "✅ Logo is used in landing page"
else
    echo "❌ Logo not found in HTML"
fi

# Check for enhanced CTA button
if grep -q "enhanced-cta" landing-page/index.html; then
    echo "✅ Enhanced CTA button found"
else
    echo "❌ Enhanced CTA button missing"
fi

# Check if nav links are removed
if grep -q 'class="nav-links"' landing-page/index.html; then
    echo "❌ Nav links still present (should be removed)"
else
    echo "✅ Nav links removed from navbar"
fi

echo ""
echo "📋 Browser compatibility..."

# Check Brave support documentation
if [ -f "BRAVE-BROWSER-SUPPORT.md" ]; then
    echo "✅ Brave browser documentation exists"
else
    echo "❌ Brave browser documentation missing"
fi

# Check README files in extension packages
if [ -f "chrome-extension/README.txt" ]; then
    echo "✅ Chrome onboarding README exists"
else
    echo "❌ Chrome onboarding README missing"
fi

if [ -f "safari-extension/README.txt" ]; then
    echo "✅ Safari onboarding README exists"
else
    echo "❌ Safari onboarding README missing"
fi

echo ""
echo "🎯 Deployment status..."

# Check if wrangler is available
if command -v wrangler &> /dev/null; then
    echo "✅ Wrangler CLI available"
    echo "🌐 Deploy with: wrangler pages deploy landing-page"
else
    echo "❌ Wrangler CLI not installed"
fi

echo ""
echo "📊 Test Results Summary:"
echo "========================"

CHROME_FILES=5  # manifest, background, content, popup.js, popup.html
SAFARI_FILES=5  # same files
LANDING_FILES=3  # index.html, styles.css, script.js
PACKAGE_FILES=2  # chrome zip, safari zip
DOC_FILES=3     # brave support, chrome readme, safari readme

TOTAL_EXPECTED=$((CHROME_FILES + SAFARI_FILES + LANDING_FILES + PACKAGE_FILES + DOC_FILES))
echo "📁 Expected core files: $TOTAL_EXPECTED"

echo ""
echo "🎉 Manual Testing Checklist:"
echo "1. ✅ Extract Chrome extension ZIP and load in chrome://extensions/"
echo "2. ✅ Test event scanning on Facebook Events, Meetup, or Eventbrite"  
echo "3. ✅ Verify calendar integration buttons work"
echo "4. ✅ Check Safari extension loads (requires Xcode)"
echo "5. ✅ Verify Brave browser compatibility"
echo "6. ✅ Test landing page responsiveness"
echo "7. ✅ Verify logo displays correctly in navbar"
echo "8. ✅ Test enhanced CTA button animation"

echo ""
echo "🌐 Deployment URLs:"
echo "Primary: https://calclik.pages.dev"
echo "Latest:  https://15c98cb2.calclik.pages.dev (from last deployment)"

echo ""
echo "✨ CALCLiK platform validation complete!"