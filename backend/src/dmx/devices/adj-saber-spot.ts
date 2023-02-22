import {
  ChannelState,
  ChannelType,
  Device,
  DeviceStateValues,
} from '../lib/device';

const CHANNEL_ORDER: ChannelType[] = [
  ChannelType.STROBE,
  ChannelType.RED,
  ChannelType.GREEN,
  ChannelType.BLUE,
  ChannelType.WHITE,
  ChannelType.MASTER,
];

export class AdjSaberSpot extends Device {
  public strobeMin = 64;
  public strobeMax = 95;

  constructor(address: number, id: string) {
    super(address, id, CHANNEL_ORDER);
  }

  state(values: DeviceStateValues): ChannelState[] {
    const channels = this._cloneState();

    Object.keys(values).map((key) => {
      const value = values[key];
      switch (key) {
        case 'r':
          channels[1].value = value;
          break;
        case 'g':
          channels[2].value = value;
          break;
        case 'b':
          channels[3].value = value;
          break;
        case 'w':
          channels[4].value = value;
          break;
        case 'a':
          channels[1].value = Math.round(value / 2);
          channels[2].value = Math.round(value / 5);
          break;
        case 'uv':
          channels[1].value = Math.round(value / 5);
          channels[3].value = Math.round(value / 2);
          break;
        case 'master':
          channels[5].value = value;
          break;
        case 'strobe':
          channels[0].value = this._normalizeStrobeValue(value);
          break;
      }
    });

    return channels;
  }
}
