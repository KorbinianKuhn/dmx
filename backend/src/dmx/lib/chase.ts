import { ChannelState } from './device';
import { ActiveProgramName, OverrideProgramName } from './program';

export enum ChaseColor {
  UV_PINK = 'uv-pink',
  BLUE_CYAN = 'blue-cyan',
  RED_AMBER = 'red-amber',
  TEAL_RED = 'teal-red',
  GREEN_CYAN = 'green-cyan',
  PINK_TEAL = 'pink-teal',
  RED_WHITE = 'red-white',
  BLUE_WHITE = 'blue-white',
  TEAL_WHITE = 'teal-white',
  PINK_WHITE = 'pink-white',
  UV_WHITE = 'uv-white',
}

export type ChannelAnimation = Array<ChannelState[]>;

export class Chase {
  private steps: Array<Buffer> = [];

  get length(): number {
    return this.steps.length;
  }

  get name(): string {
    return `${this.programName}-${this.color}`;
  }

  public loop = true;

  constructor(
    public programName: ActiveProgramName | OverrideProgramName,
    public color: ChaseColor,
  ) {
    if (
      [
        OverrideProgramName.BUILDUP_4,
        OverrideProgramName.BUILDUP_8,
        OverrideProgramName.BUILDUP_16,
        OverrideProgramName.SHORT_STROBE,
      ].includes(programName as any)
    ) {
      this.loop = false;
    }
  }

  addStep(channels: ChannelState[]) {
    const data = Buffer.alloc(512 + 1, 0);
    for (const channel of channels) {
      data[channel.address] = Math.round(channel.value);
    }
    this.steps.push(data);
  }

  addSteps(steps: ChannelAnimation) {
    for (const step of steps) {
      this.addStep(step);
    }
  }

  data(stepIndex: number): Buffer {
    return this.steps[stepIndex];
  }
}
