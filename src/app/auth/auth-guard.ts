import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[] | undefined;
    const user = this.auth.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRoles && !expectedRoles.includes(user.role)) {
      // Optionally redirect to a "not allowed" page
      this.router.navigate(['/forbidden']);
      return false;
    }

    return true;
  }
}
