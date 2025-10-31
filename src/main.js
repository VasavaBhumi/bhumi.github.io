import { VoiceManager } from './voiceManager.js';
import { KnowledgeManager } from './knowledgeManager.js';
import { ConversationManager } from './conversationManager.js';
import { AIEngine } from './aiEngine.js';

class JARVIS {
  constructor() {
    this.voiceManager = new VoiceManager();
    this.knowledgeManager = new KnowledgeManager();
    this.conversationManager = new ConversationManager();
    this.aiEngine = new AIEngine();

    this.elements = {
      status: document.getElementById('status'),
      knowledgeCount: document.getElementById('knowledge-count'),
      conversationLog: document.getElementById('conversation-log'),
      textInput: document.getElementById('text-input'),
      sendBtn: document.getElementById('send-btn'),
      voiceBtn: document.getElementById('voice-btn'),
      listeningIndicator: document.getElementById('listening-indicator'),
      learningPanel: document.getElementById('learning-panel'),
      knowledgeBasePanel: document.getElementById('knowledge-base-panel'),
      topicInput: document.getElementById('topic-input'),
      contentInput: document.getElementById('content-input'),
      keywordsInput: document.getElementById('keywords-input'),
      saveKnowledgeBtn: document.getElementById('save-knowledge-btn'),
      cancelLearningBtn: document.getElementById('cancel-learning-btn'),
      knowledgeList: document.getElementById('knowledge-list'),
      closeKnowledgeBtn: document.getElementById('close-knowledge-btn')
    };

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.updateKnowledgeCount();
    this.updateStatus('Online and Ready');
    this.speak('JARVIS initialization complete. How may I assist you today?');
  }

  setupEventListeners() {
    this.elements.sendBtn.addEventListener('click', () => this.handleTextInput());
    this.elements.textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleTextInput();
    });

    this.elements.voiceBtn.addEventListener('click', () => this.handleVoiceInput());

    this.elements.saveKnowledgeBtn.addEventListener('click', () => this.saveKnowledge());
    this.elements.cancelLearningBtn.addEventListener('click', () => this.closeLearningPanel());
    this.elements.closeKnowledgeBtn.addEventListener('click', () => this.closeKnowledgePanel());

    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        this.handleAction(action);
      });
    });
  }

  async handleTextInput() {
    const message = this.elements.textInput.value.trim();
    if (!message) return;

    this.addMessage('user', message);
    this.elements.textInput.value = '';

    await this.processMessage(message);
  }

  handleVoiceInput() {
    if (!this.voiceManager.isAvailable()) {
      this.addMessage('system', 'Voice recognition is not supported in your browser. Please use text input.');
      return;
    }

    if (this.voiceManager.isListening) {
      this.voiceManager.stopListening();
      this.elements.voiceBtn.classList.remove('listening');
      this.elements.listeningIndicator.classList.remove('active');
      return;
    }

    this.elements.voiceBtn.classList.add('listening');
    this.elements.listeningIndicator.classList.add('active');
    this.updateStatus('Listening...');

    this.voiceManager.startListening(
      async (transcript) => {
        this.elements.voiceBtn.classList.remove('listening');
        this.elements.listeningIndicator.classList.remove('active');
        this.updateStatus('Online and Ready');

        this.addMessage('user', transcript);
        await this.processMessage(transcript);
      },
      (error) => {
        this.elements.voiceBtn.classList.remove('listening');
        this.elements.listeningIndicator.classList.remove('active');
        this.updateStatus('Online and Ready');
        this.addMessage('system', `Voice recognition error: ${error}`);
      }
    );
  }

  async processMessage(message) {
    this.updateStatus('Processing...');

    const result = await this.aiEngine.processMessage(message);

    this.addMessage('ai', result.response);
    this.speak(result.response);

    await this.conversationManager.saveConversation(message, result.response, result.intent);

    if (result.action === 'open_learning_panel') {
      this.openLearningPanel();
    }

    this.updateStatus('Online and Ready');
  }

  async handleAction(action) {
    switch (action) {
      case 'learn':
        this.openLearningPanel();
        break;

      case 'query':
        await this.showKnowledgeBase();
        break;

      case 'clear':
        await this.clearConversation();
        break;

      case 'export':
        await this.exportKnowledge();
        break;
    }
  }

  openLearningPanel() {
    this.elements.learningPanel.style.display = 'block';
    this.elements.topicInput.focus();
  }

  closeLearningPanel() {
    this.elements.learningPanel.style.display = 'none';
    this.elements.topicInput.value = '';
    this.elements.contentInput.value = '';
    this.elements.keywordsInput.value = '';
  }

  async saveKnowledge() {
    const topic = this.elements.topicInput.value.trim();
    const content = this.elements.contentInput.value.trim();
    const keywordsStr = this.elements.keywordsInput.value.trim();

    if (!topic || !content) {
      this.addMessage('system', 'Please provide both topic and content.');
      return;
    }

    const keywords = keywordsStr
      ? keywordsStr.split(',').map(k => k.trim()).filter(k => k)
      : [];

    const result = await this.knowledgeManager.saveKnowledge(topic, content, keywords);

    if (result.success) {
      this.addMessage('system', `Knowledge about "${topic}" has been saved successfully.`);
      this.speak(`Knowledge about ${topic} saved.`);
      await this.updateKnowledgeCount();
      this.closeLearningPanel();
    } else {
      this.addMessage('system', `Failed to save knowledge: ${result.error}`);
    }
  }

  async showKnowledgeBase() {
    const result = await this.knowledgeManager.getKnowledge();

    if (result.success && result.data.length > 0) {
      this.elements.knowledgeList.innerHTML = '';

      result.data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'knowledge-item';

        const title = document.createElement('h4');
        title.textContent = item.topic;

        const content = document.createElement('p');
        content.textContent = item.content;

        const keywords = document.createElement('div');
        keywords.className = 'keywords';

        if (item.keywords && item.keywords.length > 0) {
          item.keywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag';
            tag.textContent = keyword;
            keywords.appendChild(tag);
          });
        }

        div.appendChild(title);
        div.appendChild(content);
        if (item.keywords && item.keywords.length > 0) {
          div.appendChild(keywords);
        }

        this.elements.knowledgeList.appendChild(div);
      });

      this.elements.knowledgeBasePanel.style.display = 'block';
    } else {
      this.addMessage('system', 'Knowledge base is empty. Teach me something new!');
    }
  }

  closeKnowledgePanel() {
    this.elements.knowledgeBasePanel.style.display = 'none';
  }

  async clearConversation() {
    this.elements.conversationLog.innerHTML = '';
    this.addMessage('system', 'Conversation cleared. How may I assist you?');
  }

  async exportKnowledge() {
    const result = await this.knowledgeManager.exportKnowledge();

    if (result.success) {
      this.addMessage('system', 'Knowledge base exported successfully.');
      this.speak('Knowledge base exported.');
    } else {
      this.addMessage('system', `Export failed: ${result.error}`);
    }
  }

  addMessage(type, message) {
    const div = document.createElement('div');
    div.className = `${type}-message`;

    const icon = document.createElement('span');
    icon.className = 'message-icon';

    switch (type) {
      case 'system':
        icon.textContent = '⚡';
        break;
      case 'user':
        icon.textContent = '👤';
        break;
      case 'ai':
        icon.textContent = '🤖';
        break;
    }

    const text = document.createElement('span');
    text.textContent = message;

    div.appendChild(icon);
    div.appendChild(text);

    this.elements.conversationLog.appendChild(div);
    this.elements.conversationLog.scrollTop = this.elements.conversationLog.scrollHeight;
  }

  speak(text) {
    if (this.voiceManager.isAvailable()) {
      this.voiceManager.speak(text);
    }
  }

  updateStatus(status) {
    this.elements.status.textContent = status;
  }

  async updateKnowledgeCount() {
    const count = await this.knowledgeManager.getKnowledgeCount();
    this.elements.knowledgeCount.textContent = `${count} topic${count !== 1 ? 's' : ''}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new JARVIS();
});
