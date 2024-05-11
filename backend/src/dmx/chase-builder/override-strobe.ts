import { ChannelAnimation, Chase, ChaseColor } from '../lib/chase';
import { DeviceStateValues } from '../lib/device';
import { DeviceRegistry } from '../lib/device-registry';
import { OverrideProgramName } from '../lib/program';
import {
  flattenChannelStates,
  getChaseColorValues,
  mergeDevicePatterns,
} from './chase-utils';

export const createChaseStrobeInfinite = (
  devices: DeviceRegistry,
  color: ChaseColor,
): Chase => {
  const chase = new Chase(OverrideProgramName.STROBE_INFINITE, color);

  const colors = getChaseColorValues(color);

  const { bar, head, dome, spot, beamer, hex } = devices.object();

  const steps: ChannelAnimation = [];

  for (const color of [colors.a, colors.b]) {
    for (let i = 0; i < 5; i++) {
      const state = flattenChannelStates(
        ...hex.all.map((o, i2) =>
          i2 === i
            ? o.state({ master: 255, w: 255 })
            : o.state({ master: 0, w: 0 }),
        ),
        bar.state({ segments: 'all', master: 255, w: 255, strobe: 250 }),
        ...head.all.map((o) => o.state({ master: 255, ...color, strobe: 250 })),
        dome.state({ master: 255, ...color, strobe: 250 }),
        spot.state({ master: 255, ...color, strobe: 250 }),
        beamer.state({ master: 255, ...color, strobe: 120 }),
      );

      steps.push(state);
    }
  }

  const animations = devices
    .object()
    .head.all.map((o) => o.animationTop(steps.length));

  chase.addSteps(mergeDevicePatterns(steps, ...animations));

  return chase;
};

export const createChaseStrobeA = (
  devices: DeviceRegistry,
  color: ChaseColor,
): Chase => {
  const chase = new Chase(OverrideProgramName.STROBE_A, color);

  const steps: Array<number[]> = [];

  const colors = getChaseColorValues(color);

  const { neopixelA, neopixelB } = devices.object();

  const getRandomMasterValues = () =>
    Array.from({ length: 15 }, () => (Math.random() < 0.05 ? 255 : 0));

  const getRandomStrobeValues = (color: DeviceStateValues) => {
    const master = getRandomMasterValues();
    const values = [];

    for (let i = 0; i < master.length; i++) {
      values.push(
        ...Array.from({ length: 10 }, (_, i2) => ({
          index: i * 10 + i2,
          values: { ...color, master: master[i] },
        })),
      );
    }

    return values;
  };

  for (let i = 0; i < 64; i++) {
    const state = [
      ...neopixelA.setMultiple(getRandomStrobeValues(colors.a)),
      ...neopixelB.setMultiple(getRandomStrobeValues(colors.a)),
    ];
    steps.push(state, state);
  }

  chase.addSteps(new Array(steps.length / 4).fill(null).map(() => []));
  chase.addPixelSteps(steps);

  return chase;
};

export const createChaseStrobeB = (
  devices: DeviceRegistry,
  color: ChaseColor,
): Chase => {
  const chase = new Chase(OverrideProgramName.STROBE_B, color);

  const steps: ChannelAnimation = [];

  const colors = getChaseColorValues(color);

  const on = flattenChannelStates(
    ...devices
      .object()
      .head.all.map((o) => o.state({ master: 255, ...colors.a, strobe: 100 })),
  );

  for (let i = 0; i < 32; i++) {
    steps.push(on);
  }

  chase.addSteps(steps);

  return chase;
};

export const createChaseStrobeC = (
  devices: DeviceRegistry,
  color: ChaseColor,
): Chase => {
  const chase = new Chase(OverrideProgramName.STROBE_C, color);
  const colors = getChaseColorValues(color);
  const steps: ChannelAnimation = [];

  const { bar, head } = devices.object();

  for (let i = 0; i < 32; i++) {
    const state = flattenChannelStates(
      bar.state({ segments: 'all', master: 255, ...colors.a, strobe: 250 }),
      ...head.all.map((o) =>
        o.state({ master: 255, ...colors.a, strobe: 250 }),
      ),
    );
    steps.push(state);
  }

  chase.addSteps(steps);

  return chase;
};

export const createChaseStrobeD = (
  devices: DeviceRegistry,
  color: ChaseColor,
): Chase => {
  const chase = new Chase(OverrideProgramName.STROBE_D, color);

  const steps: ChannelAnimation = [];

  const { bar, head } = devices.object();

  for (let i = 0; i < 32; i++) {
    const state = flattenChannelStates(
      bar.state({ segments: 'all', master: 255, w: 255, strobe: 250 }),
      ...head.all.map((o) => o.state({ master: 255, w: 255, strobe: 250 })),
    );
    steps.push(state);
  }

  chase.addSteps(steps);

  return chase;
};

export const createChaseStrobeE = (
  devices: DeviceRegistry,
  color: ChaseColor,
): Chase => {
  const chase = new Chase(OverrideProgramName.STROBE_E, color);

  const colors = getChaseColorValues(color);

  const { neopixelA, neopixelB } = devices.object();

  const steps: Array<number[]> = [];

  for (let i = 0; i < 8; i++) {
    for (let color of [colors.a, colors.b]) {
      steps.push([
        ...neopixelA.setAll({ ...color, master: 255 }),
        ...neopixelB.setAll({ ...color, master: 255 }),
      ]);
      steps.push([
        ...neopixelA.setAll({ ...color, master: 255 }),
        ...neopixelB.setAll({ ...color, master: 255 }),
      ]);
      steps.push([...neopixelA.empty(), ...neopixelB.empty()]);
      steps.push([...neopixelA.empty(), ...neopixelB.empty()]);
      steps.push([...neopixelA.empty(), ...neopixelB.empty()]);
      steps.push([...neopixelA.empty(), ...neopixelB.empty()]);
      steps.push([...neopixelA.empty(), ...neopixelB.empty()]);
      steps.push([...neopixelA.empty(), ...neopixelB.empty()]);
    }
  }

  chase.addSteps(new Array(steps.length / 4).fill(null).map(() => []));

  chase.addPixelSteps(steps);

  return chase;
};
