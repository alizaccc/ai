const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');
const modelSelect = document.getElementById('model');

const STORAGE_KEY = 'puter-chat-history';
let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function renderMessage(role, content) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = marked.parse(content);
  div.querySelectorAll('pre code').forEach(hljs.highlightElement);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

history.forEach(m => renderMessage(m.role, m.content));

send.onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  history.push({ role: 'user', content: text });
  renderMessage('user', text);
  save();

  const aiDiv = document.createElement('div');
  aiDiv.className = 'msg ai';
  chat.appendChild(aiDiv);

  const resp = await puter.ai.chat(text, {
    model: modelSelect.value,
    stream: true
  });

  let full = '';
  for await (const part of resp) {
    full += part.text || '';
    aiDiv.innerHTML = marked.parse(full);
    aiDiv.querySelectorAll('pre code').forEach(hljs.highlightElement);
    chat.scrollTop = chat.scrollHeight;
  }

  history.push({ role: 'ai', content: full });
  save();
};