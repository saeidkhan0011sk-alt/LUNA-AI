let apiKey = localStorage.getItem('luna_api_key') || '';
let selectedVoice = localStorage.getItem('luna_voice') || 'voice1';

document.addEventListener('DOMContentLoaded', () => {
  if (apiKey) document.getElementById('api-key-input').value = apiKey;
  if (selectedVoice) document.getElementById('voice-select').value = selectedVoice;
});

function openPanel(type) {
  if (type === 'settings' || type === 'chat' || type === 'memory' || type === 'soul' || type === 'tasks' || type === 'headlines') {
    document.getElementById('settings-modal').classList.remove('hidden');
  }
}

function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

function saveSettings() {
  apiKey = document.getElementById('api-key-input').value.trim();
  selectedVoice = document.getElementById('voice-select').value;

  if (apiKey) localStorage.setItem('luna_api_key', apiKey);
  localStorage.setItem('luna_voice', selectedVoice);

  alert('লুনার সেটিংস সফলভাবে সেভ হয়েছে!');
  closeSettings();
}

function toggleMic() {
  alert('ভয়েস কমান্ড মোড সক্রিয় হয়েছে।');
}

function handleKeyPress(event) {
  if (event.key === 'Enter') sendMessage();
}

async function sendMessage() {
  const inputEl = document.getElementById('user-input');
  const userText = inputEl.value.trim();
  const statusText = document.getElementById('status-text');
  const faceImg = document.getElementById('luna-face');

  if (!userText) return;
  if (!apiKey) {
    alert('প্রথমে সেটিংস থেকে আপনার Google Gemini API Key দিন!');
    openPanel('settings');
    return;
  }

  inputEl.value = '';
  statusText.innerText = "Luna is thinking...";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: userText }] }] })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      statusText.innerText = "Ready to Listen...";
      
      // কথা বলার সময় অ্যানিমেশন ও ভয়েস আউটপুট
      faceImg.classList.add('speaking');
      speakText(aiReply, () => {
        faceImg.classList.remove('speaking');
      });
    } else {
      statusText.innerText = "Ready to Listen...";
    }
  } catch (error) {
    statusText.innerText = "Ready to Listen...";
    alert('ত্রুটি ঘটেছে!');
  }
}

function speakText(text, callback) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    utterance.pitch = selectedVoice === 'voice1' ? 1.4 : (selectedVoice === 'voice2' ? 1.2 : 1.0);
    utterance.rate = 1.0;
    
    utterance.onend = () => { if (callback) callback(); };
    window.speechSynthesis.speak(utterance);
  } else {
    if (callback) callback();
  }
}
