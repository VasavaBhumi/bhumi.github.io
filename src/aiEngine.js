import { KnowledgeManager } from './knowledgeManager.js';

export class AIEngine {
  constructor() {
    this.knowledgeManager = new KnowledgeManager();
  }

  detectIntent(message) {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('learn') ||
      lowerMessage.includes('remember') ||
      lowerMessage.includes('save') ||
      lowerMessage.includes('teach') ||
      lowerMessage.includes('store')
    ) {
      return 'learn';
    }

    if (
      lowerMessage.includes('what is') ||
      lowerMessage.includes('tell me about') ||
      lowerMessage.includes('explain') ||
      lowerMessage.includes('do you know') ||
      lowerMessage.includes('search for')
    ) {
      return 'query';
    }

    if (
      lowerMessage.includes('time') ||
      lowerMessage.includes('date') ||
      lowerMessage.includes('weather')
    ) {
      return 'info';
    }

    return 'chat';
  }

  async processMessage(message) {
    const intent = this.detectIntent(message);

    switch (intent) {
      case 'learn':
        return this.handleLearnIntent(message);

      case 'query':
        return this.handleQueryIntent(message);

      case 'info':
        return this.handleInfoIntent(message);

      default:
        return this.handleChatIntent(message);
    }
  }

  async handleLearnIntent(message) {
    return {
      intent: 'learn',
      response: 'I am ready to learn. Please use the "Teach Me" button to provide the topic, content, and keywords you would like me to remember.',
      action: 'open_learning_panel'
    };
  }

  async handleQueryIntent(message) {
    const searchTerms = this.extractSearchTerms(message);

    if (searchTerms.length === 0) {
      return {
        intent: 'query',
        response: 'Could you please be more specific about what you would like to know?'
      };
    }

    const result = await this.knowledgeManager.getKnowledge(searchTerms[0]);

    if (result.success && result.data && result.data.length > 0) {
      const knowledge = result.data[0];
      return {
        intent: 'query',
        response: `Based on what I know about ${knowledge.topic}: ${knowledge.content}`,
        data: result.data
      };
    } else {
      return {
        intent: 'query',
        response: `I don't have any information about "${searchTerms[0]}" in my knowledge base. Would you like to teach me about it?`
      };
    }
  }

  async handleInfoIntent(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('time')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return {
        intent: 'info',
        response: `The current time is ${timeStr}.`
      };
    }

    if (lowerMessage.includes('date')) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return {
        intent: 'info',
        response: `Today is ${dateStr}.`
      };
    }

    return {
      intent: 'info',
      response: 'I can provide you with the current time and date. For other information, please teach me or ask about topics in my knowledge base.'
    };
  }

  async handleChatIntent(message) {
    const greetings = ['hello', 'hi', 'hey', 'greetings'];
    const lowerMessage = message.toLowerCase();

    if (greetings.some(g => lowerMessage.includes(g))) {
      return {
        intent: 'chat',
        response: 'Hello! I am JARVIS, your personal AI assistant. How may I assist you today?'
      };
    }

    if (lowerMessage.includes('how are you')) {
      return {
        intent: 'chat',
        response: 'All systems operational. I am functioning at optimal capacity. How may I help you?'
      };
    }

    if (lowerMessage.includes('thank')) {
      return {
        intent: 'chat',
        response: 'You are welcome. Is there anything else I can help you with?'
      };
    }

    if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
      return {
        intent: 'chat',
        response: 'I am JARVIS - Just A Rather Very Intelligent System. I am your personal AI assistant designed to learn from you and assist with various tasks.'
      };
    }

    const count = await this.knowledgeManager.getKnowledgeCount();

    return {
      intent: 'chat',
      response: `I am here to assist you. I currently have knowledge about ${count} topics. You can teach me new things, ask me questions, or request information.`
    };
  }

  extractSearchTerms(message) {
    const patterns = [
      /what is (.*?)[\?\.]/i,
      /tell me about (.*?)[\?\.]/i,
      /explain (.*?)[\?\.]/i,
      /do you know (.*?)[\?\.]/i,
      /search for (.*?)[\?\.]/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return [match[1].trim()];
      }
    }

    const words = message.toLowerCase().split(' ');
    const stopWords = ['what', 'is', 'the', 'a', 'an', 'tell', 'me', 'about', 'do', 'you', 'know'];
    return words.filter(word => !stopWords.includes(word) && word.length > 2);
  }
}
