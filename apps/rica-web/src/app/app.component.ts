import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'ricaweb-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'rica-web';
}
