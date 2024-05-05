import { Component, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { SpeechRecognitionService } from 'src/app/services/speech-recognition.service';
import { TextToSpeechService } from 'src/app/services/text-to-speech.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent {

  inputMessage: string = "";
  concatFinalTranscript:string = '';
  today:Date = new Date();
  listening:boolean = false;
  audio:boolean = true;
  private resultsSubscription: Subscription;

  messages: {message: string, from: 'user' | 'bot' }[] = [];

  constructor(private chatService: ChatService, private speechRecognitionService: SpeechRecognitionService, private textToSpeechService: TextToSpeechService) { 
    this.resultsSubscription = this.speechRecognitionService.onResult.subscribe((results: any) => {

        if(!this.concatFinalTranscript.endsWith(results.finalTranscript)){
          this.concatFinalTranscript += results.finalTranscript;
        }

        this.inputMessage = this.concatFinalTranscript + results.interimTranscript;
      }
    );
  }

  sendMessage(messageSent: string): void {
    //Hide introduction text if it being shown
    const introductionText = document.getElementById("introduction-text");
    if(!introductionText?.classList.contains("hidden")){
      introductionText?.classList.add("hidden");
    }

    //Sending the message of the user and receiving the response from the chatbot
    this.messages.push({ message: messageSent, from: 'user' });
    this.chatService.sendMessage(messageSent).subscribe(response => {
      if(this.audio){
        this.textToSpeechService.speakMessage(response.choices[0].message.content);
      }
      this.messages.push({ message: response.choices[0].message.content, from: 'bot' });
      this.inputMessage=""; 
      this.concatFinalTranscript="";
    });
  }

  triggerRecording(): void {
    if (!this.listening && !this.speechRecognitionService.isPaused) {
      this.speechRecognitionService.record();
      this.listening = true;
    } else if(!this.listening && this.speechRecognitionService.isPaused){
      this.speechRecognitionService.resume();
      this.listening = true;
    } else {
      this.pauseRecording(); // Pause recording instead of stopping
    }
  }
  
  pauseRecording(): void {
    this.speechRecognitionService.pause();
    this.listening = false;
  }
  
  resumeRecording(): void {
    this.speechRecognitionService.resume();
  }
  
  ngOnDestroy(): void {
    this.resultsSubscription.unsubscribe();
    this.speechRecognitionService.stop();
  }

  onInputChange(event: any) {
    if (event.target.value === '') {
      this.concatFinalTranscript = "";
      this.inputMessage = "";
    }
  }

  changeAudio(): void {
    this.audio = !this.audio;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'm') {
      this.ejecutarAccion();
    }
  }

  ejecutarAccion() {
    this.triggerRecording();
  }
}
