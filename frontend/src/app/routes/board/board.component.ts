import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LetDirective } from '@ngrx/component';
import { map } from 'rxjs';
import { BpmComponent } from '../../components/bpm/bpm.component';
import { ChannelMixerModalComponent } from '../../components/channel-mixer-modal/channel-mixer-modal.component';
import { PadButtonComponent } from '../../components/pad-button/pad-button.component';
import { PanelGroupComponent } from '../../components/panel-group/panel-group.component';
import { ToggleButtonComponent } from '../../components/toggle-button/toggle-button.component';
import { Visualisation2Component } from '../../components/visualisation2/visualisation2.component';
import { ConfigService } from '../../services/config.service';
import {
  ActiveProgramName,
  OverrideProgramName,
} from '../../services/ws.interfaces';
import { WSService } from '../../services/ws.service';
import { ActiveProgramButtonComponent } from './components/active-program-button/active-program-button.component';
import {
  BoardColorsModalComponent,
  COLORS_FROM,
  COLORS_TO,
} from './components/board-colors-modal/board-colors-modal.component';
import { BrightnessModalComponent } from './components/brightness-modal/brightness-modal.component';
import { OverrideProgramButtonComponent } from './components/override-program-button/override-program-button.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [
    PanelGroupComponent,
    ToggleButtonComponent,
    OverrideProgramButtonComponent,
    LetDirective,
    PadButtonComponent,
    ActiveProgramButtonComponent,
    BpmComponent,
    Visualisation2Component,
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
  ],
})
export class BoardComponent implements OnInit {
  public activeProgram = ActiveProgramName;
  public overrideProgram = OverrideProgramName;

  public visualisation$ = this.configService.visualisation$;
  public video$ = this.configService.video$;
  public black$ = this.wsService.black$;

  public currentColor$ = this.wsService.currentActiveProgram$.pipe(
    map(({ color, progress }) => {
      const [a, b] = color.split('-');
      return {
        color,
        gradient: `bg-gradient-to-br ${COLORS_FROM[a]} from-30% ${COLORS_TO[b]} to-70%`,
        a,
        b,
        progress,
      };
    })
  );

  constructor(
    private dialog: MatDialog,
    private configService: ConfigService,
    private wsService: WSService
  ) {}

  ngOnInit(): void {}

  onOpenChannelMixerModal() {
    this.dialog.open(ChannelMixerModalComponent, {
      width: '90vw',
      height: '90vh',
    });
  }

  onRefreshClick() {
    location.reload();
  }

  onOpenBrightnessModal() {
    this.dialog.open(BrightnessModalComponent, {
      width: '90vw',
    });
  }

  onVisualisationToggle() {
    this.configService.toggleVisualisation();
  }

  onVideoToggle() {
    this.configService.toggleVideo();
  }

  onClickOpenColorsModal() {
    this.dialog.open(BoardColorsModalComponent);
  }

  onClickBlack() {
    const value = this.black$.getValue();
    this.wsService.setBlack(!value);
  }
}
