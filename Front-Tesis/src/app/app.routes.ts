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
import { NeworderComponent } from './components/shoppingcart/neworder/neworder.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { AuthGuard } from './components/guards/auth.guard';
import { TermsComponent } from './components/terms/terms.component';
import { PrivacidadComponent } from './components/privacidad/privacidad.component';
import { BrandsComponent } from './components/brands/brands.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { PaymentSuccessComponent } from './components/shoppingcart/payment-success/payment-success.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

export const routes: Routes = [
    // ✅ TIENDA PÚBLICA: Redirigir al store por defecto (acceso público)
    { path: '', redirectTo: '/store', pathMatch: 'full' },
    
    // 🌍 RUTAS PÚBLICAS (sin guard)
    { path: 'login', component: LoginComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'store', component: StoreComponent}, // Página principal pública
    { path: 'products', component: ViewproductComponent}, // Catálogo público
    
    // 🔧 RUTAS ESPECÍFICAS DE PRODUCTOS (DEBEN IR ANTES DE :id)
    { path: 'products/new', component: AltaproductComponent, canActivate: [AuthGuard] }, // ✅ MOVIDO ARRIBA
    { path: 'products/edit/:id', component: EditproductComponent, canActivate: [AuthGuard] }, // ✅ MOVIDO ARRIBA
    { path: 'products/details/:id', component: DetailproductComponent }, // Detalle público
    
    // 🌍 RUTAS CON PARÁMETROS (DEBEN IR AL FINAL)
    { path: 'products/:id', component: ViewproductComponent }, // Productos por categoría - AL FINAL
    
    // 🔒 RUTAS PROTEGIDAS (requieren login)
    { path: 'profile', redirectTo: '/login' }, // Perfil redirige a login
    { path: 'users', component: UsersComponent, canActivate: [AuthGuard] }, // Solo admin
    { path: 'users/edit/:id', component: EditUserComponent, canActivate: [AuthGuard] },
    { path: 'orders', component: ViewordersComponent, canActivate: [AuthGuard] }, // Ver pedidos
    { path: 'orders/new', component: NeworderComponent, canActivate: [AuthGuard] }, // CHECKOUT PROTEGIDO
    { path: 'reports', component: ReportesComponent, canActivate: [AuthGuard] }, // Solo admin
    
    // 🔧 OTRAS RUTAS DE ADMINISTRACIÓN
    { path: 'images', component: ImageUploadComponent, canActivate: [AuthGuard] },
    { path: 'terminos', component: TermsComponent }, // Términos y condiciones (pública)
    { path: 'marcas', component: BrandsComponent, canActivate: [AuthGuard] }, // Gestión de marcas (pública)
    { path: 'categorias', component: CategoriesComponent, canActivate: [AuthGuard] }, // Gestión de categorías (pública)
    { path: 'payment/success', component: PaymentSuccessComponent, canActivate: [AuthGuard] }, // Página de éxito de pago (protegida)
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'privacidad', component: PrivacidadComponent }, // Política de privacidad (pública)

    // Cualquier ruta no encontrada redirige al store
    { path: '**', redirectTo: '/store' }
];

// export const routes: Routes = [
//     { path: '', redirectTo: '/store', pathMatch: 'full' }, // Cambiar de '/login' a '/store'
//     { path: 'login', component: LoginComponent},
//     { path: 'store', component: StoreComponent},
//     { path: 'register', component: RegisterComponent},
//     { path: 'users', component: UsersComponent},
//     { path: 'users/edit/:id', component: EditUserComponent },
//     { path: 'products', component: ViewproductComponent},
//     { path: 'images', component: ImageUploadComponent},
//     { path: 'products/new', component: AltaproductComponent},
//     { path: 'products/edit/:id', component: EditproductComponent },
//     { path: 'products/:id', component: ViewproductComponent },
//     { path: 'products/details/:id', component: DetailproductComponent },
//     { path: 'orders', component: ViewordersComponent },
//     { path: 'orders/new', component: NeworderComponent },   
//     { path: 'reports', component: ReportesComponent },

//     { path: '**', redirectTo: '/store' }
// ];