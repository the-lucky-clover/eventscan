// Content script to scan page for events
function scanForEvents() {
  const bodyText = document.body.innerText;
  const pageTitle = document.title;
  const pageUrl = window.location.href;

  console.log('Scanning page:', pageTitle);
  console.log('Body text length:', bodyText.length);
  console.log('First 500 chars:', bodyText.substring(0, 500));

  // Simple regex for date/time patterns
  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi;
  const timeRegex = /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/gi;

  const dates = bodyText.match(dateRegex) || [];
  const times = bodyText.match(timeRegex) || [];

  console.log('Dates found:', dates);
  console.log('Times found:', times);

  // Extract potential event text around dates - use paragraph-based extraction
  const potentialEvents = [];
  
  // Split by double newlines or major breaks to get event blocks
  const blocks = bodyText.split(/\n\s*\n+/);

  console.log('Total blocks:', blocks.length);

  blocks.forEach(block => {
    // Create new regex instances for each test to avoid lastIndex issues
    const datePat = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i;
    const timePat = /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/i;
    
    // If block contains date or time, include the whole block (preserving line structure)
    if (datePat.test(block) || timePat.test(block)) {
      // Preserve newlines but clean up excessive spaces on each line
      const cleanedBlock = block.split('\n').map(line => line.trim()).join('\n').trim();
      potentialEvents.push(cleanedBlock);
    }
  });

  console.log('Potential events found:', potentialEvents.length);
  console.log('Potential events:', potentialEvents);

  return {
    title: pageTitle,
    url: pageUrl,
    dates: [...new Set(dates)],
    times: [...new Set(times)],
    potentialEvents: potentialEvents.slice(0, 10) // Limit to 10
  };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanPage') {
    console.log('Content script: Scanning page...');
    const events = scanForEvents();
    console.log('Content script: Found', events.potentialEvents.length, 'potential events');
    sendResponse(events);
    return true; // Keep the message channel open
  }
});
