import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StoreComponent } from './store/store.component';
import { RegisterComponent } from './register/register.component';
import { UsersComponent } from './components/users/users.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';

export const routes: Routes = [
    { path: '', redirectTo: '/store', pathMatch: 'full' }, // Cambiar de '/login' a '/store'
    { path: 'login', component: LoginComponent},
    { path: 'store', component: StoreComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'users', component: UsersComponent},
    { path: 'users/edit/:id', component: EditUserComponent }
];