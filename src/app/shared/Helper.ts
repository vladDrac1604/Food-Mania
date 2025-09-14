import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class Helper {

  getUnsplashKey() {
    return "M0IBer-h3noOVG3lX2vZRBerGBGWCfCLCHshPvz4X9M";
  }

  errorPopup(heading, message) {
    Swal.fire({
      title: heading,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
   });
  }

  successPopup(heading, message) {
    Swal.fire({
      title: heading,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK'
   });
  }

  getRandomPageNum() {
    const minCeiled = Math.ceil(20);
    const maxFloored = Math.floor(1);
    return (Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)).toString();
  }

}
