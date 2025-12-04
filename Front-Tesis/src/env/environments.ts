// src/env/environment.ts
import { environment as devEnv } from './dev';
import { environment as prodEnv } from './prod';

// Detecta el entorno (puedes usar process.env.NODE_ENV o una variable personalizada)
const isProduction = window.location.hostname !== 'localhost';

export const environment = isProduction ? prodEnv : devEnv;