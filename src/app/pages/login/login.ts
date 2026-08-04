import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon/icon';
import { LoadingComponent } from '../../shared/loading/loading';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, LoadingComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly error = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(false);

    const { username, password } = this.form.getRawValue();

    // pequena espera artificial só para dar feedback visual de carregamento
    setTimeout(() => {
      const ok = this.auth.login(username, password);
      this.submitting.set(false);

      if (ok) {
        this.router.navigateByUrl('/');
      } else {
        this.error.set(true);
      }
    }, 400);
  }

  preencherDemo(username: string, password: string): void {
    this.form.setValue({ username, password });
  }
}
