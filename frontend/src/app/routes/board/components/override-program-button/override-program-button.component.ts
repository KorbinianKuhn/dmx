import { Component, Input } from '@angular/core';
import { map } from 'rxjs';
import { OverrideProgramName } from '../../../../services/ws.interfaces';
import { WSService } from '../../../../services/ws.service';

@Component({
  selector: 'app-override-program-button',
  templateUrl: './override-program-button.component.html',
  styleUrls: ['./override-program-button.component.scss'],
})
export class OverrideProgramButtonComponent {
  @Input() name!: OverrideProgramName;
  @Input() size: 'small' | 'normal' = 'normal';

  public current$ = this.wsService.currentOverrideProgram$.pipe(
    map(({ programName, progress }) => {
      return {
        active: programName === this.name,
        progress,
      };
    })
  );

  constructor(private wsService: WSService) {}

  onClick() {
    const value =
      this.wsService.overrideProgramName$.getValue() === this.name
        ? null
        : this.name;
    this.wsService.setOverrideProgramName(value);
  }
}