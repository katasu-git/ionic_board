import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot,
  RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  //重要 TFで遷移可能かを返す
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.afAuth.authState.pipe(
      //ログイン状態を取得
      take(1),
      map(user => {
        if(user !== null) {
          //ログインしていたらuserにユーザ情報が入る
          return true;
        } else {
          //ログインしていない場合は/loginに移動
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
