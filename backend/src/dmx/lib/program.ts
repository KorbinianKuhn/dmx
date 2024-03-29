import { TypedServer } from '../../server/events.interfaces';
import { Logger } from '../../utils/logger';
import { Chase } from './chase';
import { Clock } from './clock';
import { Config } from './config';

export enum OverrideProgramName {
  BUILDUP_INFINITE = 'buildup-inifite',
  BUILDUP_4 = 'buildup-4',
  BUILDUP_8 = 'buildup-8',
  BUILDUP_16 = 'buildup-16',
  SHORT_STROBE = 'short-strobe',
  FADE = 'fade',
  STROBE = 'strobe',
  DISCO = 'disco',
}

export enum ActiveProgramName {
  ON = 'on',
  MIRROR_BALL = 'mirror-ball',
  MOODY = 'moody',
  CLUB = 'club',
  WILD = 'wild',
}

export class Program {
  private chaseIndex = 0;
  private stepIndex = 0;
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

  start() {
    this.stepIndex = -1;
    this.chaseIndex = 0;
  }

  reset() {
    this.stepIndex = -1;
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
