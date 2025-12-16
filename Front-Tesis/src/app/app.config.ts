// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { debugHttpInterceptor } from './interceptors/debug-http.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(withInterceptors([debugHttpInterceptor])),
    provideAnimations(), // ← NUEVO: Necesario para las animaciones
    provideToastr({       // ← NUEVO: Configuración de toastr
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
      tapToDismiss: true,
      newestOnTop: true,
      maxOpened: 5,
      autoDismiss: true
    })
  ]
};