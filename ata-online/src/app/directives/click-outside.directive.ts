import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {

  @Output() cliqueFora = new EventEmitter<void>();
  private isListening = false;
  

  constructor(private el: ElementRef) {
    setTimeout(() => (this.isListening = true), 0);
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: HTMLElement) {
    if (!this.isListening) return;
    const clickedInside = this.el.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.cliqueFora.emit();
    }
  }

}
