import {Routes} from '@angular/router';
import {SidebarPageComponent} from 'sidebarcrudstone';

export const routes: Routes = [
  {path: '', redirectTo: 'main', pathMatch: 'full'},
  {path: ':name', component: SidebarPageComponent},
];
