let intervalId = null;

document.getElementById('start').addEventListener('click', () => {
  const message = document.getElementById('message').value;
  const intervalSeconds = parseInt(document.getElementById('interval').value) * 1000;
  
  if (!message || isNaN(intervalSeconds) || intervalSeconds < 5000) {
    alert('Please enter a valid message and interval (minimum 5 seconds)');
    return;
  }
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0].url.includes('facebook.com') || tabs[0].url.includes('messenger.com')) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: startSendingMessages,
        args: [message, intervalSeconds]
      });
      
      document.getElementById('start').disabled = true;
      document.getElementById('stop').disabled = false;
    } else {
      alert('Please open Facebook Messenger in this tab first');
    }
  });
});

document.getElementById('stop').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      func: stopSendingMessages
    });
  });
  
  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;
});

function startSendingMessages(message, interval) {
  window.autoMessageInterval = setInterval(() => {
    // Find the message input box
    const input = document.querySelector('[aria-label="Message"]') || 
                  document.querySelector('[contenteditable="true"]');
    
    if (input) {
      // Focus on the input
      input.focus();
      
      // Set the message content
      if (input.getAttribute('aria-label') === 'Message') {
        // For regular input
        input.value = message;
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      } else {
        // For contenteditable div
        input.textContent = message;
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
      
      // Find and click the send button
      const sendButton = document.querySelector('[aria-label="Press Enter to send"]') || 
                        document.querySelector('[aria-label="Send"]') ||
                        document.querySelector('div[aria-label="Send"][role="button"]');
      
      if (sendButton) {
        sendButton.click();
      }
    }
  }, interval);
}

function stopSendingMessages() {
  clearInterval(window.autoMessageInterval);
}
