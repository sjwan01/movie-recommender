import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MovieCardComponent } from './movie-card.component';

@NgModule({
  declarations: [AppComponent, MovieCardComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent, MovieCardComponent],
})
export class AppModule {}
