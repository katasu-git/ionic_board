import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { CommentsPage } from '../comments/comments.page';

//コメントページはモーダルでHomePageに読みこむので前処理を追加
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  entryComponents: [CommentsPage],
  declarations: [HomePage, CommentsPage]
})
export class HomePageModule {}
