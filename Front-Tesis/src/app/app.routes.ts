import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StoreComponent } from './store/store.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent},
    { path: 'store', component: StoreComponent},
    { path: 'register', component: RegisterComponent},

];
