import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() textButton: string;
  @Input() size: string = 'auto';
  @Input() display: string = '';
  @Input() textButtonLoading: string = '';
  @Input() btnHeight: string = 'auto';
  @Input() btnWidth: string = 'auto';
  @Input() disabled: boolean = false;
  @Input() btnColor: string = 'btn__primary'; // btn__primary, btn__grey
  @Input() icon: string = '';
  @Input() loading: boolean = false;
  @Input() colorSpinner: string = 'accent'; // primary, accent, warn

}