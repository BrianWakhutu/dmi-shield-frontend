import {Component, ElementRef, inject, OnInit, Renderer2, ViewChild} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {config} from "../../../config/config";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit{

  @ViewChild('myIframe') myIframe!: ElementRef;


  private sanitizer = inject(DomSanitizer);

  SariIframe: any;
  IfbsIframe: any;
  MortalityIframe: any;
  constructor(private renderer: Renderer2) {
    this.SariIframe = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://app.powerbi.com/view?r=eyJrIjoiMTBkZjU0NjYtZTRkZS00ZmUxLWIyYzItMjdjNmFiODliNWY5IiwidCI6ImE4MmQ5Y2U3LTcwZDQtNGMzOS1iMmUyLTU5ZmQwODA0NjQ1YiIsImMiOjh9'
    );

    this.IfbsIframe = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://app.powerbi.com/view?r=eyJrIjoiNDlkNTU4MDItMjFkNy00MjUzLTk4NzMtYmVmNjA3YTA0YzBiIiwidCI6ImE4MmQ5Y2U3LTcwZDQtNGMzOS1iMmUyLTU5ZmQwODA0NjQ1YiIsImMiOjh9'
    )

    this.MortalityIframe = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://app.powerbi.com/view?r=eyJrIjoiY2JlOTUxYzItZjUwMy00OTczLWExNmYtZmI2NzhkNjY5YzY2IiwidCI6ImE4MmQ5Y2U3LTcwZDQtNGMzOS1iMmUyLTU5ZmQwODA0NjQ1YiIsImMiOjh9'
    )
  }


  ngOnInit() {
  }

  openSariIframe(): void {
    window.open(config.IFBS_IFRAME_SOURCES.SARI, '_blank');
  }

  openIfbsframe(): void {
    window.open(config.IFBS_IFRAME_SOURCES.IFBS, '_blank');
  }

  openMortalityIframe(): void {
    window.open(config.IFBS_IFRAME_SOURCES.MORTAlITY, '_blank');
  }


}
