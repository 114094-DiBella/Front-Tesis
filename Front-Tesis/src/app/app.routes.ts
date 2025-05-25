import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StoreComponent } from './store/store.component';
import { RegisterComponent } from './register/register.component';
import { UsersComponent } from './components/users/users.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { Product } from './models/product.model';
import { ViewproductComponent } from './components/products/viewproduct/viewproduct.component';
import { ImageUploadComponent } from './components/images/image-upload/image-upload.component';
import { AltaproductComponent } from './components/products/altaproduct/altaproduct.component';
import { EditproductComponent } from './components/products/editproduct/editproduct.component';
import { DetailproductComponent } from './components/products/detailproduct/detailproduct.component';
import { ViewordersComponent } from './components/shoppingcart/vieworders/vieworders.component';

export const routes: Routes = [
    { path: '', redirectTo: '/store', pathMatch: 'full' }, // Cambiar de '/login' a '/store'
    { path: 'login', component: LoginComponent},
    { path: 'store', component: StoreComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'users', component: UsersComponent},
    { path: 'users/edit/:id', component: EditUserComponent },
    { path: 'products', component: ViewproductComponent},
    { path: 'images', component: ImageUploadComponent},
    { path: 'products/new', component: AltaproductComponent},
    { path: 'products/edit/:id', component: EditproductComponent },
    { path: 'products/:id', component: ViewproductComponent },
    { path: 'products/details/:id', component: DetailproductComponent },
    { path: 'orders', component: ViewordersComponent },

    { path: '**', redirectTo: '/store' }
];