import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const debugHttpInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  try {
    if (req.method === 'POST' || req.method === 'PUT') {
      const url = req.url || req.urlWithParams || '';
      if (url.includes('/api/products')) {
        console.log('📤 [HTTP Debug] ' + req.method + ' ' + url);
        console.log('📦 Payload:', JSON.stringify(req.body, null, 2));
      }
    }
  } catch (e) {
    console.error('Failed to log HTTP request body.', e);
  }
  return next(req);
};
