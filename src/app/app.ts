import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Job Search App');
    ngOnInit(): void {
    // DEV ONLY: pre-login as James
    localStorage.setItem(
      'currentJobSeeker',
      JSON.stringify({
        _id: '68f3cdb3fb94b479f9616724',
        name: 'James Murphy',
        email: 'James.murphy@example.com'
      })
    );
  }
}
