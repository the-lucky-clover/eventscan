document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scanBtn');
  const loading = document.getElementById('loading');
  const eventsDiv = document.getElementById('events');
  const enableRemindersCheckbox = document.getElementById('enableReminders');

  // Load saved settings
  chrome.storage.sync.get(['enableReminders'], (result) => {
    enableRemindersCheckbox.checked = result.enableReminders || false;
  });

  // Save reminders setting
  enableRemindersCheckbox.addEventListener('change', () => {
    const enableReminders = enableRemindersCheckbox.checked;
    chrome.storage.sync.set({ enableReminders: enableReminders }, () => {
      console.log('Reminders setting saved');
    });
  });

  scanBtn.addEventListener('click', async () => {
    loading.classList.remove('hidden');
    eventsDiv.innerHTML = '';

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Scan page
    const scanResult = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });

    // Process with AI
    const processResult = await chrome.runtime.sendMessage({
      action: 'processEvents',
      potentialEvents: scanResult.potentialEvents
    });

    loading.classList.add('hidden');

    if (processResult.error) {
      eventsDiv.innerHTML = `<p>Error: ${processResult.error}</p>`;
      return;
    }

    const events = processResult.events;
    if (events.length === 0) {
      eventsDiv.innerHTML = '<p>No events found</p>';
      return;
    }

    // Show events summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'events-summary';
    summaryDiv.innerHTML = `
      <strong>🎉 ${events.length} event${events.length === 1 ? '' : 's'} detected!</strong><br>
      <small>Select events to add to your calendar</small>
    `;
    eventsDiv.appendChild(summaryDiv);

    // Create events list
    events.forEach((event, index) => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event';
      eventDiv.dataset.index = index;
      
      const eventMeta = [];
      if (event.date) eventMeta.push(`<span class="event-tag">📅 ${formatDisplayDate(event.date)}</span>`);
      if (event.time) eventMeta.push(`<span class="event-tag">🕐 ${event.time}</span>`);
      if (event.location) eventMeta.push(`<span class="event-tag">📍 ${event.location}</span>`);
      
      eventDiv.innerHTML = `
        <input type="checkbox" class="event-checkbox" checked data-index="${index}">
        <h4>${event.title || 'Event ' + (index + 1)}</h4>
        <div class="event-meta">${eventMeta.join('')}</div>
        <p style="font-size: 11px; line-height: 1.4;">${truncateText(event.description || '', 80)}</p>
      `;
      eventsDiv.appendChild(eventDiv);
    });

    // Add calendar selection section
    const calendarSelectionDiv = document.createElement('div');
    calendarSelectionDiv.className = 'calendar-selection';
    let calendarOptionsHtml = `
      <h4>📅 Choose Calendar Platform:</h4>
      <div class="calendar-options">
        <button class="calendar-btn google" data-type="google">Google Calendar</button>
        <button class="calendar-btn outlook" data-type="outlook">Outlook</button>
        <button class="calendar-btn apple" data-type="apple">macOS Calendar</button>
    `;
    
    if (enableRemindersCheckbox.checked) {
      calendarOptionsHtml += `<button class="calendar-btn reminders" data-type="reminders">macOS Reminders</button>`;
    }
    
    calendarOptionsHtml += `
      </div>
      <div class="action-buttons">
        <button id="addSelectedBtn" class="btn-primary">Add Selected Events</button>
        <button id="selectAllBtn" class="btn-secondary">Select All</button>
      </div>
    `;
    
    calendarSelectionDiv.innerHTML = calendarOptionsHtml;
    eventsDiv.appendChild(calendarSelectionDiv);

    // Store events globally for calendar integration
    window.currentEvents = events;
    window.selectedCalendarType = null;

    // Add event listeners for enhanced functionality
    
    // Event checkbox listeners
    document.querySelectorAll('.event-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const eventDiv = e.target.closest('.event');
        if (e.target.checked) {
          eventDiv.classList.add('selected');
        } else {
          eventDiv.classList.remove('selected');
        }
      });
    });

    // Calendar type selection
    document.querySelectorAll('.calendar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove previous selection
        document.querySelectorAll('.calendar-btn').forEach(b => b.style.opacity = '0.7');
        // Highlight selected
        e.target.style.opacity = '1';
        window.selectedCalendarType = e.target.dataset.type;
      });
    });

    // Select all button
    document.getElementById('selectAllBtn').addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.event-checkbox');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      
      checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
        const eventDiv = checkbox.closest('.event');
        if (checkbox.checked) {
          eventDiv.classList.add('selected');
        } else {
          eventDiv.classList.remove('selected');
        }
      });
      
      document.getElementById('selectAllBtn').textContent = allChecked ? 'Select All' : 'Deselect All';
    });

    // Add selected events button
    document.getElementById('addSelectedBtn').addEventListener('click', () => {
      if (!window.selectedCalendarType) {
        alert('Please select a calendar platform first.');
        return;
      }

      const selectedCheckboxes = document.querySelectorAll('.event-checkbox:checked');
      if (selectedCheckboxes.length === 0) {
        alert('Please select at least one event to add.');
        return;
      }

      const selectedEvents = Array.from(selectedCheckboxes).map(checkbox => {
        const index = parseInt(checkbox.dataset.index);
        return window.currentEvents[index];
      });

      // Add events to selected calendar
      addEventsToCalendar(selectedEvents, window.selectedCalendarType);
    });
  });

  // Helper functions
  function formatDisplayDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  function addEventsToCalendar(events, calendarType) {
    const eventCount = events.length;
    let successCount = 0;
    
    events.forEach((event, index) => {
      setTimeout(() => {
        switch (calendarType) {
          case 'google':
            addToGoogleCalendar(event);
            break;
          case 'outlook':
            addToOutlook(event);
            break;
          case 'apple':
            addToMacCalendar(event);
            break;
          case 'reminders':
            addToReminders(event);
            break;
        }
        
        successCount++;
        if (successCount === eventCount) {
          showSuccessMessage(eventCount, calendarType);
        }
      }, index * 500); // Stagger the additions to avoid overwhelming the browser
    });
  }

  function showSuccessMessage(count, type) {
    const typeNames = {
      google: 'Google Calendar',
      outlook: 'Outlook',
      apple: 'macOS Calendar',
      reminders: 'macOS Reminders'
    };
    
    alert(`✅ ${count} event${count === 1 ? '' : 's'} added to ${typeNames[type]}!`);
  }

  function addToMacCalendar(event) {
    // Generate iCal and download for macOS Calendar
    const ical = generateICal(event);
    downloadICal(ical, `${event.title}.ics`);
    alert('iCal file downloaded. Import into your macOS Calendar app.');
  }

  function addToGoogleCalendar(event) {
    // Create Google Calendar event URL
    const startDateTime = `${event.date}T${event.time}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16); // Add 1 hour
    const url = `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateTime.replace(/[:-]/g, '')}/${endDateTime.replace(/[:-]/g, '')}&location=${encodeURIComponent(event.location || '')}&description=${encodeURIComponent(event.description || '')}`;
    chrome.tabs.create({ url: url });
  }

  function addToOutlook(event) {
    // Create Outlook calendar event URL
    const startDateTime = `${event.date}T${event.time}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16); // Add 1 hour
    const url = `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(event.title)}&startdt=${startDateTime}&enddt=${endDateTime}&location=${encodeURIComponent(event.location || '')}&body=${encodeURIComponent(event.description || '')}`;
    chrome.tabs.create({ url: url });
  }

  function generateICal(event) {
    const now = new Date().toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    const start = `${event.date.replace(/-/g, '')}T${event.time.replace(':', '')}00Z`;
    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${start}
DTSTAMP:${now}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
  }

  function downloadICal(content, filename) {
    const blob = new Blob([content], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function addToReminders(event) {
    // Connect to native messaging host
    const port = chrome.runtime.connectNative('com.calendare.reminderhost');
    port.onMessage.addListener((response) => {
      if (response.success) {
        alert('Reminder created successfully!');
      } else {
        alert('Failed to create reminder.');
      }
      port.disconnect();
    });
    port.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        console.error('Native messaging error:', chrome.runtime.lastError);
        alert('Failed to connect to native host. Make sure the host is installed.');
      }
    });
    // Send the event data
    port.postMessage({ action: 'createReminder', event: event });
  }
});
