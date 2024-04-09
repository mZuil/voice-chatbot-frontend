import { Injectable } from '@angular/core';

interface IWindow extends Window {
  SpeechSynthesisUtterance: any;
  SpeechSynthesis: any;
}

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  firstTime: boolean = true;
  utter: SpeechSynthesisUtterance;

  constructor() { 
    this.utter = new SpeechSynthesisUtterance();
    this.utter.lang = 'es-ES';
    this.utter.voice = window.speechSynthesis.getVoices()[1];
    this.utter.rate = 1.7;
    window.speechSynthesis.cancel();
  }

  speakMessage(text: string): void {    
    this.utter.text = text;
    window.speechSynthesis.speak(this.utter);
  }
}
