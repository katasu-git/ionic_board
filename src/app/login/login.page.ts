import { Component, OnInit } from '@angular/core';
//ユーザーのアクションに対する通知
import { ToastController } from '@ionic/angular';
//画面遷移に利用
import { Router } from '@angular/router';

//firebase
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  login: {
    email: string;
    password: string;
  } = {
    email: '',
    password: ''
  };

  //利用するために注入する
  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit() {}

  //signInWithEmailAndPasswordはPromise()を返す
  //処理に成功→then() 失敗→catch() を実行する
  //失敗したら引数errorで受け取ってtoString()で表示
  userLogin(){
    this.afAuth.auth
      .signInWithEmailAndPassword(this.login.email, this.login.password)
      .then(async user => {
        const toast = await this.toastCtrl.create({
          message: `${user.user.displayName}さんこんにちは！`,
          duration: 3000
        });
        await toast.present();

        //ログインできたらメッセージへ移動
        this.router.navigate(['/home']);
      })
      .catch(async error => {
        const toast = await this.toastCtrl.create({
          message: error.toString(),
          duration: 3000
        });
        await toast.present();
      });
  }


  gotoSignup() {
    this.router.navigateByUrl('/signup');
  }
}
