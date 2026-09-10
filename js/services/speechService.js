/**
 * MediAssist AI — Voice Interface & Speech Engine
 * Provides Speech-to-Text (STT) and Text-to-Speech (TTS) via Web Speech API.
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.ttsEnabled = true;
    this.currentLang = 'en-US';

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  setLanguage(langCode) {
    if (langCode === 'hi') {
      this.currentLang = 'hi-IN';
    } else if (langCode === 'te') {
      this.currentLang = 'te-IN';
    } else {
      this.currentLang = 'en-US';
    }

    if (this.recognition) {
      this.recognition.lang = this.currentLang;
    }
  }

  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      if (onError) onError("Speech Recognition not supported in this browser. Please use keyboard input.");
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    this.recognition.lang = this.currentLang;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Speech recognition start failed:", e);
      if (onError) onError(e.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  speak(text) {
    if (!this.ttsEnabled || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // Stop ongoing utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.currentLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS speak failed:", e);
    }
  }

  toggleTTS(enabled) {
    this.ttsEnabled = enabled;
    if (!enabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
