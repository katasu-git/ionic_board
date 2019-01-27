import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from './login.guard';
import { LoggedinGuard } from './loggedin.guard';

//canActivateで未ログイン時は/loginに飛ぶようにする
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule',
    canActivate: [LoginGuard]
   },
  //自動で追加される http://localhost:8100/loginにアクセスされたら表示する
  {
    path: 'login',
    loadChildren: './login/login.module#LoginPageModule',
    canActivate: [LoggedinGuard]
  },
  {
    path: 'signup',
    loadChildren: './signup/signup.module#SignupPageModule',
    canActivate: [LoggedinGuard]
  }
  //homeにモーダルで表示するので自動追加のルーティングを消しておく
  //{ path: 'comments', loadChildren: './comments/comments.module#CommentsPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
