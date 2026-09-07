// ⭐ FIXED VoiceEngine - Prevents "already started" errors
export class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isRecognitionActive = false; // ⭐ NEW: Track actual recognition state
    this.transcript = '';
    this.silenceTimer = null;
    this.callbacks = {
      onResult: null,
      onSilence: null,
      onError: null
    };
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  start() {
    // ⭐ CRITICAL FIX: Check if already running
    if (this.isRecognitionActive) {
      console.warn('Speech recognition already running');
      return true;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      if (this.callbacks.onError) {
        this.callbacks.onError('Speech recognition not supported');
      }
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // ⭐ Create new recognition instance only if needed
    if (!this.recognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.isRecognitionActive = true; // ⭐ Track active state
        console.log('✅ Speech recognition started');
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text + ' ';
          } else {
            interimTranscript += text;
          }
        }
        
        this.transcript = finalTranscript || interimTranscript;
        
        if (this.callbacks.onResult) {
          this.callbacks.onResult({
            full: this.transcript,
            interim: interimTranscript,
            final: finalTranscript
          });
        }
        
        this.resetSilenceTimer();
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // ⭐ Handle specific errors
        if (event.error === 'aborted' || event.error === 'no-speech') {
          // These are recoverable errors
          this.isRecognitionActive = false;
        }
        
        if (this.callbacks.onError) {
          this.callbacks.onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isRecognitionActive = false; // ⭐ Update state when ended
        console.log('Speech recognition ended');
        
        // ⭐ Auto-restart only if still supposed to be listening
        if (this.isListening) {
          console.log('Restarting recognition...');
          setTimeout(() => {
            if (this.isListening && !this.isRecognitionActive) {
              try {
                this.recognition.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
              }
            }
          }, 100);
        }
      };
    }

    // ⭐ Start recognition with error handling
    try {
      if (!this.isRecognitionActive) {
        this.recognition.start();
        this.isListening = true;
        this.resetSilenceTimer();
        return true;
      }
      return true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      this.isRecognitionActive = false;
      
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      return false;
    }
  }

  resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }
    
    this.silenceTimer = setTimeout(() => {
      if (this.callbacks.onSilence && this.isListening) {
        this.callbacks.onSilence();
      }
    }, 30000); // 30 seconds of silence
  }

  stop() {
    console.log('Stopping speech recognition...');
    this.isListening = false;
    this.isRecognitionActive = false; // ⭐ Update state
    
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    
    const finalTranscript = this.transcript;
    this.transcript = '';
    return finalTranscript;
  }

  // ⭐ NEW: Abort method for forceful stop
  abort() {
    console.log('Aborting speech recognition...');
    this.isListening = false;
    this.isRecognitionActive = false;
    
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    
    if (this.recognition) {
      try {
        this.recognition.abort(); // Forceful stop
      } catch (e) {
        console.warn('Error aborting recognition:', e);
      }
    }
    
    const finalTranscript = this.transcript;
    this.transcript = '';
    return finalTranscript;
  }

  // ⭐ NEW: Reset method
  reset() {
    this.abort();
    this.recognition = null;
    this.transcript = '';
  }

  getTranscript() {
    return this.transcript;
  }

  // ⭐ NEW: Check if actually recording
  isActive() {
    return this.isRecognitionActive;
  }
}