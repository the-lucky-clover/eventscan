// Background service worker for AI processing
async function processWithAI(potentialEvents, apiKey) {
  const prompt = `Extract structured events from the following text snippets. For each event, provide:
- Title
- Date (in YYYY-MM-DD format)
- Time (in HH:MM format, 24-hour)
- Location (if mentioned)
- Description

Text snippets:
${potentialEvents.join('\n')}

Return as JSON array of events. If no events found, return empty array.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('AI processing error:', error);
    return [];
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processEvents') {
    chrome.storage.sync.get(['openaiApiKey'], async (result) => {
      const apiKey = result.openaiApiKey;
      if (!apiKey) {
        sendResponse({ error: 'API key not set' });
        return;
      }

      const events = await processWithAI(request.potentialEvents, apiKey);
      sendResponse({ events });
    });
    return true; // Keep message channel open for async response
  }
});
