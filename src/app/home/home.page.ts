//機能の実装
import { Component, OnInit } from '@angular/core';
//プロンプトを出すためにインポート
import { AlertController, ToastController,
  ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as moment from 'moment';

//FireBaseの対応
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth'
import * as firebase from 'firebase';

//インポートしたインターフェースを定義
import { Post } from '../models/post';

//コメントページへのインポート
import { CommentsPage } from '../comments/comments.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  message: string; //入力されるメッセージ
  post: Post; //Postと同じデータ構造のプロパティを指定可能
  posts: Post[]; //Post型の配列という指定もできる

  //firebaseのコレクションを扱うプロパティ
  postsCollection: AngularFirestoreCollection<Post>;

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private afStore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    //firestoreのネットワーク有効化（ログアウトすると無効化されるので）
    this.afStore.firestore.enableNetwork();
    //コンポーネントの初期化時に、投稿を読み込むgetPosts()を実行
    this.getPosts();
  }

  addPost() {
    //postプロパティに値をセットする
    //コンポーネントクラスのプロパティにクラス内関数からアクセスするときはthisを付ける
    //とりあえずidは空にしておく（addすると割り当てられるので更新）
    this.post = {
      id: '',
      userName: this.afAuth.auth.currentUser.displayName,
      message: this.message,
      created: firebase.firestore.FieldValue.serverTimestamp()
    };

    //ここでFirestoreにデータを追加する
    //firestoreのcollection(posts)にpostを追加する
    // (引数1, 引数2) => { 関数の中身 }
    // 引数 => 関数の中身 ※も可能
    // add()でデータ追加するとランダムなidが割り当てられる
    this.afStore
      .collection('posts')
      .add(this.post)
      //成功したらここ
      //ドキュメントへの参照をdocRefという名前で受け取る
      .then(docRef => {
        //一度投稿を追加したあとに、idを更新
        //コレクションのドキュメント()
        this.postsCollection.doc(docRef.id).update({
          id: docRef.id
        });
        //追加できたら入力フィールドを空にする
        this.message = '';
      })
      .catch(async error => {
        //エラーをToastControllerで表示
        const toast = await this.toastCtrl.create({
          message: error.toString(),
          duration: 3000
        });
        await toast.present();
      });
  }

  //Firestoreから投稿データを読み込む
  getPosts() {
    //コレクションの参照をここで取得
    //ref(参照)
    this.postsCollection = this.afStore.collection(
      'posts', ref => ref.orderBy('created', 'desc'));

      //valueChanges()で監視
      //データに変更があったらsubscribe()で受け取ってpostsに入れる
      //subxcribeはRxJSライブラリの機能
      this.postsCollection.valueChanges().subscribe(data => {
        this.posts = data;
      });
  }

  async presentPrompt(post: Post) {
    const alert = await this.alertCtrl.create({
      header: 'メッセージ編集',
      inputs: [
        {
          name: 'message',
          type: 'text',
          placeholder: 'メッセージ'
        }
      ],
      buttons: [
        {
          text: 'キャンセル',
          role: 'cancel',
          handler: () => {
            console.log('キャンセルが選択されました');
          }
        },
        {
          text: '更新',
          handler: data => {
            //投稿を更新するメソッドを実行
            //htmlから受け取ったpost(投稿データ)とプロンプト内で入力されたデータを渡す
            this.updatePost(post, data.message);
          }
        }
      ]
    });
    await alert.present();
  }

  //メッセージをアップデートする
  //更新されると投稿とメッセージを受け取る
  updatePost(post: Post, message: string) {
    //入力されたメッセージで投稿を更新
    this.postsCollection
    .doc(post.id)
    .update({
      message: message
    })
    .then(async () => {
      const toast = await this.toastCtrl.create({
        message: '投稿が更新されました',
        duration: 3000
      });
      await toast.present();
    })
    .catch(async error => {
      const toast = await this.toastCtrl.create({
        message: error.toString(),
        duration: 3000
      });
      await toast.present();
    });
  }

  //投稿を削除する
  deletePost(post: Post) {
    //受け取った投稿のidを参照して削除
    this.postsCollection
    .doc(post.id)
    .delete()
    .then(async () => {
      const toast = await this.toastCtrl.create({
        message: '投稿が削除されました',
        duration: 3000
      });
      await toast.present();
    })
    .catch(async error => {
      const toast = await this.toastCtrl.create({
        message: error.toString(),
        duration: 3000
      });
      await toast.present();
    });
  }

  //Date型で投稿日時を受け取る
  //moment.jsのfromNow()で現在との差を文字列で返す
  differenceTime(time: Date): string {
    moment.locale('ja');
    return moment(time).fromNow();
  }

  logout() {
    //firestoreのネットワークを無効化する
    this.afStore.firestore.disableNetwork();
    //サインアウトの処理
    this.afAuth.auth
        .signOut()
        .then(async () => {
          const toast = await this.toastCtrl.create({
            message: 'ログアウトしました',
            duration: 3000
          });
          await toast.present();
          this.router.navigateByUrl('/login');
        })
        .catch(async error => {
          const toast = await this.toastCtrl.create({
            message: error.toString(),
            duration: 3000
          });
          await toast.present();
        });
  }

  //コメントページへ現在の投稿を受け渡しつつ移動
  async showComment(post: Post) {
    //sourcePostというキーでpostを渡す 型はPOST（インターフェースで規定）
    const modal = await this.modalCtrl.create({
      component: CommentsPage,
      componentProps: {
        sourcePost: post
      }
    });
    return await modal.present();
  }


  /*  //ここからプロパティを追加
    post: {
        userName: string,
        message: string,
        createDate: any
    } = {
      userName: 'Ryota Nishimura',
      message: 'これはテストメッセージです',
      createDate: '10分前'
    };

    //入力されたメッセージを受け取る(submitしなくても即時変更)
    message: string;

    posts: { userName: string, message: string, createDate: any }[]
        = [
        {
          userName: 'Ryota Nishimura',
          message: 'これはテストメッセージです',
          createDate: '10分前'
        },
        {
          userName: 'Takeshi Washizaki',
          message: '2hぱっぷ～',
          createDate: '5分前'
        }
    ];

    //初期化メソッドの追加 alertCtrlを渡す(型は AlertController)
    //インポートしたオブジェクトの機能を利用できるようにする
    constructor(private alertCtrl: AlertController) {}

    addPost() {
      //postプロパティに値をセットする
      //コンポーネントクラスのプロパティにクラス内関数からアクセスするときはthisを付ける
      this.post = {
        userName: 'Ryota Nishimura',
        message: this.message,
        createDate: '数分前'
      };
      //配列postsにpostを追加
      this.posts.push(this.post);
      //入力フィールドを空に
      this.message = '';
    }

    //async 修飾子を使用して定義され、通常 1 つ以上の await 式を含むメソッド) が、
    //"非同期メソッド" と呼ばれます。
    //postのindex番号を引数にする
    async presentPrompt(index: number) {
      //awaitキーワードを利用してcreate()メソッドを実行
      const alert = await this.alertCtrl.create({
        header: 'メッセージ編集',
        inputs: [
          {
            name: 'message',
            type: 'text',
            placeholder: 'メッセージ'
          }
        ],
        buttons: [
          {
            text: 'キャンセル',
            role: 'cancel',
            //ボタンが押された時の処理
            handler: () => {
              console.log('キャンセルが選択されました');
            }
          },
          {
            text: '更新',
            //ボタンが押された時の処理
            // (引数1, 引数2) => { 関数の中身 }
            // 引数 => 関数の中身 ※も可能
            handler: data => {
              console.log(data);
              //dataには入力情報が 64行目 inputsのnameで指定したmessageというキーで含まれる
              this.posts[index].message = data.message;
            }
          }
        ]
      });
      //alertはcreate()しただけでは動作しないのでpresent()で表示する
      //create()が完了するまで実行されない
      await alert.present();
    }

    deletePost(index: number){
      //splice(番号、個数) を削除
      this.posts.splice(index, 1);
    }
    */
}
