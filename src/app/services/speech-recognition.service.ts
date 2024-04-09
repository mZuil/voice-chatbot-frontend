import { Injectable, NgZone, EventEmitter } from '@angular/core';

interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

@Injectable({
  providedIn: 'root'
})

export class SpeechRecognitionService {
  private speechRecognition: any;
  isPaused: boolean = false;
  public onResult: EventEmitter<any> = new EventEmitter();

  constructor(private zone: NgZone) {}

  record(): void {
    const { webkitSpeechRecognition }: IWindow = window as unknown as IWindow;
    this.speechRecognition = new webkitSpeechRecognition();
    this.speechRecognition.continuous = true;
    this.speechRecognition.interimResults = true;
    this.speechRecognition.lang = 'es-ES';

    this.speechRecognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      this.zone.run(() => {
        this.onResult.emit({ interimTranscript, finalTranscript });
      });
    };

    this.speechRecognition.onerror = (error: any) => {
      this.zone.run(() => {
        this.onResult.error(error);
      });
    };

    this.speechRecognition.onend = () => {
      if (!this.isPaused) {
        this.record(); // Resume recognition if not paused
      }
    };

    this.speechRecognition.start();
  }

  pause() {
    if (this.speechRecognition) {
      this.isPaused = true;
      this.speechRecognition.stop();
    }
  }

  resume() {
    if (this.speechRecognition && this.isPaused) {
      this.isPaused = false;
      this.record();
    }
  }

  stop() {
    if (this.speechRecognition) {
      this.isPaused = false; // Reset pause state
      this.speechRecognition.stop();
    }
  }
}