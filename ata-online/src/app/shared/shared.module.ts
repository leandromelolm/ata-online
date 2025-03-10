import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './components/button/button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [ButtonComponent],
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  exports: [ButtonComponent]
})
export class SharedModule { }
