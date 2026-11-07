let apiKey = localStorage.getItem('luna_api_key') || '';
let selectedVoice = localStorage.getItem('luna_voice') || 'voice1';

document.addEventListener('DOMContentLoaded', () => {
  if (apiKey) {
    document.getElementById('api-key-input').value = apiKey;
  }
  if (selectedVoice) {
    document.getElementById('voice-select').value = selectedVoice;
  }
});

function openSection(type) {
  if (type === 'settings' || type === 'chat' || type === 'memory' || type === 'soul' || type === 'tasks' || type === 'headlines') {
    toggleSettings();
  }
}

function toggleSettings() {
  const modal = document.getElementById('settings-modal');
  modal.classList.toggle('hidden');
}

function saveSettings() {
  const keyInput = document.getElementById('api-key-input').value.trim();
  const voiceInput = document.getElementById('voice-select').value;

  if (keyInput) {
    apiKey = keyInput;
    localStorage.setItem('luna_api_key', apiKey);
  }
  
  selectedVoice = voiceInput;
  localStorage.setItem('luna_voice', selectedVoice);

  alert('লুনার সেটিংস সফলভাবে সেভ হয়েছে!');
  toggleSettings();
}

function toggleMic() {
  const statusText = document.getElementById('status-text');
  statusText.innerText = "Listening...";
  setTimeout(() => {
    statusText.innerText = "Ready to Listen";
    alert('ভয়েস কমান্ড মোড সক্রিয় আছে। আপনি টেক্সট করেও কথা বলতে পারেন।');
  }, 2000);
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

async function sendMessage() {
  const inputEl = document.getElementById('user-input');
  const userText = inputEl.value.trim();
  const statusText = document.getElementById('status-text');

  if (!userText) return;

  if (!apiKey) {
    alert('প্রথমে SETTINGS-এ গিয়ে আপনার Google Gemini API Key টি দিন!');
    toggleSettings();
    return;
  }

  inputEl.value = '';
  statusText.innerText = "Luna is thinking...";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userText }] }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      statusText.innerText = "Ready to Listen";
      
      // ব্রাউজার ভয়েস দিয়ে উত্তর বলানো (মেয়ের কণ্ঠের মতো শোনানোর চেষ্টা)
      speakText(aiReply);
    } else {
      statusText.innerText = "Ready to Listen";
      alert('দুঃখিত, কোনো উত্তর পাওয়া যায়নি। API Key পরীক্ষা করুন।');
    }
  } catch (error) {
    console.error(error);
    statusText.innerText = "Ready to Listen";
    alert('সংযোগ বা API Key এ ত্রুটি ঘটেছে!');
  }
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD'; // বাংলা ভাষা
    // কণ্ঠের সুর বা পিচ সেট করা
    utterance.pitch = 1.3; // একটু উচুতুর বা মেয়েদের কণ্ঠের মতো সুরের জন্য
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}
