import { Component } from '@angular/core';
import { ToastMessageService } from '../../services/toast-message.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {

  constructor(public messageService: ToastMessageService) {}

}
