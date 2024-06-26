import { TypedServer } from '../../server/events.interfaces';
import { Logger } from '../../utils/logger';
import { Chase } from './chase';
import { Clock } from './clock';
import { Config } from './config';

export enum OverrideProgramName {
  DAY = 'day',
  NIGHT = 'night',
  FADE = 'fade',
  WHITE = 'white',
  WARM = 'warm',
  BUILDUP_BRIGHT = 'buildup-bright',
  BUILDUP_FADEOUT = 'buildup-fadeout',
  BUILDUP_BEAM = 'buildup-beam',
  BUILDUP_BLINDER = 'buildup-blinder',
  BUILDUP_STREAK = 'buildup-streak',
  BUILDUP_BLINK = 'buildup-blink',
  STROBE_FLASH = 'strobe-flash',
  STROBE_SLOWMO = 'strobe-slowmo',
  STROBE_COLOR = 'strobe-color',
  STROBE_WHITE = 'strobe-white',
  STROBE_PIXELS = 'strobe-pixels',
  STROBE_DISCO = 'strobe-disco',
  STROBE_STORM = 'strobe-storm',
}

export enum ActiveProgramName {
  ON = 'on',
  PRIDE = 'pride',
  MIRROR_BALL = 'mirror-ball',
  MAGIC = 'magic',
  MOODY = 'moody',
  CLUB = 'club',
  ROUGH = 'rough',
  PULSE = 'pulse',
  DARK = 'dark',
  LATE = 'late',
  WILD = 'wild',
}

export class Program {
  private chaseIndex = 0;
  private stepIndex = 0;
  private pixelStepIndex = 0;
  private chases: Chase[] = [];
  private logger = new Logger(this.constructor.name);

  get chase(): Chase {
    return this.chases[this.chaseIndex];
  }

  constructor(
    private io: TypedServer,
    private clock: Clock,
    private config: Config,
    private isOverride: boolean,
  ) {
    this.clock.tick$.subscribe(() => this._next());
    this.clock.microtick$.subscribe(() => this._nextMicrotick());
  }

  _next() {
    try {
      if (this.chases.length === 0) {
        return;
      }

      if (this.chaseIndex >= this.chases.length) {
        this.chaseIndex = 0;
      }

      const chase = this.chases[this.chaseIndex];

      if (this.stepIndex >= chase.length - 1) {
        if (!this.chases[this.chaseIndex].loop) {
          this.config.setOverrideProgram(null);
        }

        this.chaseIndex =
          this.chases.length - 1 === this.chaseIndex ? 0 : this.chaseIndex + 1;
        this.stepIndex = -1;
      }

      this.stepIndex++;
    } catch (err) {
      this.logger.error(err.message, err);
    }
  }

  _nextMicrotick() {
    try {
      if (this.chases.length === 0) {
        return;
      }

      const chase = this.chases[this.chaseIndex];

      if (this.pixelStepIndex >= chase.lengthPixel - 1) {
        this.pixelStepIndex = 0;
      } else {
        this.pixelStepIndex++;
      }
    } catch (err) {
      this.logger.error(err.message, err);
    }
  }

  start() {
    this.stepIndex = -1;
    this.pixelStepIndex = 0;
    this.chaseIndex = 0;
  }

  reset() {
    this.stepIndex = -1;
    this.pixelStepIndex = 0;
    this.chaseIndex = 0;
  }

  setChases(chases: Chase[]) {
    this.chases = chases;
    if (this.isOverride) {
      this.start();
    }
  }

  currentChase(): Chase {
    return this.chases[this.chaseIndex];
  }

  data(): Buffer {
    const buffer = Buffer.alloc(512 + 1, 0);

    if (this.chases.length === 0) {
      return buffer;
    }

    try {
      const data = this.chase?.data(this.stepIndex);
      if (data) {
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = data[i];
        }
      }
    } catch (err) {
      this.logger.error(err.message, err);
    }

    return buffer;
  }

  pixelData(): Buffer {
    if (this.chases.length === 0) {
      return Buffer.alloc(2 * 150 * 4, 0);
    }

    const chase = this.chases[this.chaseIndex];

    if (chase.lengthPixel === 0) {
      return Buffer.alloc(2 * 150 * 4, 0);
    }

    const data = chase.pixelData(this.pixelStepIndex);

    if (data?.length) {
      return Buffer.from(data);
    } else {
      return Buffer.alloc(2 * 150 * 4, 0);
    }
  }

  progress(): { programName: string; color: string; progress: number } {
    const chase = this.chases[this.chaseIndex];

    if (!chase) {
      return { programName: '', color: '', progress: 0 };
    }

    const progress = Math.round((this.stepIndex / chase.length) * 100);

    return {
      programName: chase.programName,
      color: chase.color,
      progress,
    };
  }
}
