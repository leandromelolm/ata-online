import { Component } from '@angular/core';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {

  lat: number = 0;
  long: number = 0;
  btnClickLocation: string = "Localizar"

  ngOnInit() {}

  public clickLocation(): void {
    this.getCurrentLocation();
  }

  getCurrentLocation() {        
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.long = position.coords.longitude;      
      });
    }
    else {
      alert("Geolocation is not supported by this browser.");
    }
  }
}
