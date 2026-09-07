// ⭐ REPLACE ENTIRE FILE WITH THIS:
export class SpeechSynthesisEngine {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voice = null;
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  async initialize() {
    if (!this.synthesis) return false;

    return new Promise((resolve) => {
      const loadVoices = () => {
        const voices = this.synthesis.getVoices();
        
        // ⭐ BEST QUALITY VOICES
        this.voice = 
          voices.find(v => v.name.includes('Google UK English Female')) ||
          voices.find(v => v.name.includes('Google US English')) ||
          voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
          voices.find(v => v.name.includes('Microsoft') && v.name.includes('Natural') && v.lang.startsWith('en')) ||
          voices.find(v => v.lang === 'en-US' && v.localService === false) ||
          voices.find(v => v.lang.startsWith('en-') && !v.localService) ||
          voices.find(v => v.lang.startsWith('en')) ||
          voices[0];

        console.log('🔊 Selected voice:', this.voice?.name);
        resolve(true);
      };

      if (this.synthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        this.synthesis.onvoiceschanged = loadVoices;
      }
    });
  }

  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        return reject(new Error('Speech Synthesis not supported'));
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.voice;
      
      // ⭐ OPTIMIZED FOR CLARITY AND LOUDNESS
      utterance.rate = options.rate || 0.95;
      utterance.pitch = options.pitch || 1.1;
      utterance.volume = options.volume || 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.currentUtterance = utterance;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (error) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onError) options.onError(error);
        
        // Retry on interruption
        if (error.error === 'interrupted' || error.error === 'canceled') {
          setTimeout(() => this.synthesis.speak(utterance), 100);
        } else {
          reject(error);
        }
      };

      setTimeout(() => {
        try {
          this.synthesis.speak(utterance);
        } catch (e) {
          reject(e);
        }
      }, 50);
    });
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  pause() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.pause();
    }
  }

  resume() {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  isSupported() {
    return !!window.speechSynthesis;
  }

  getSpeaking() {
    return this.isSpeaking;
  }
}