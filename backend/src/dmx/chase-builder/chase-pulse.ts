import { ChannelAnimation, Chase, ChaseColor } from '../lib/chase';
import { DeviceRegistry } from '../lib/device-registry';
import { ActiveProgramName } from '../lib/program';
import {
  Colors,
  flattenChannelStates,
  getChaseColorValues,
  getPixelGradient,
  mergeDevicePatterns,
  mergePixelPatterns,
  repeat,
  warp,
} from './chase-utils';

export const createChasePulse = (
  devices: DeviceRegistry,
  color: ChaseColor,
): Chase => {
  const chase = new Chase(ActiveProgramName.PULSE, true, color);
  const colors = getChaseColorValues(color);

  const bar = createBarPattern(devices, colors);
  const hex = createHexPattern(devices, colors);
  const head = createHeadPattern(devices, colors);
  const beamer = createBeamerPattern(devices, colors);

  const steps = mergeDevicePatterns(bar, hex, head, beamer);

  const warped = warp(steps, 1);

  const animations = devices
    .object()
    .head.all.map((o) => repeat(o.animationEight(steps.length / 2), 2));

  chase.addSteps(mergeDevicePatterns(warped, ...animations));

  chase.addPixelSteps(createPixelPattern(devices, colors));

  return chase;
};

const createHexPattern = (
  devices: DeviceRegistry,
  colors: Colors,
): ChannelAnimation => {
  const steps: ChannelAnimation = [];

  const { a, b, c, d, e, all } = devices.object().hex;

  const off = flattenChannelStates(
    ...all.map((hex) => hex.state({ master: 0 })),
  );

  for (let i = 0; i < 4; i++) {
    for (const color of [colors.a, { w: 255 }, colors.b, { w: 255 }]) {
      for (let i2 = 0; i2 < 8; i2++) {
        steps.push(off);
      }

      steps.push(
        flattenChannelStates(
          off,
          ...all.map((hex) => hex.state({ master: 255, ...color })),
        ),
      );

      for (let i2 = 0; i2 < 7; i2++) {
        steps.push(off);
      }
    }
  }

  return steps;
};

const createBarPattern = (
  devices: DeviceRegistry,
  colors: Colors,
): ChannelAnimation => {
  const steps: ChannelAnimation = [];

  const bar = devices.object().bar;

  const fadeInSteps = 2;
  const fadeOutSteps = 14;
  const maxBrightness = 255;

  for (let color of [colors.a, colors.b]) {
    for (let _ = 0; _ < 8; _++) {
      for (let i = 0; i < fadeInSteps; i++) {
        const brightnessStep = Math.round(maxBrightness / fadeInSteps);

        const master = i * brightnessStep;

        steps.push(bar.state({ segments: 'all', master, ...color }));
      }

      for (let i = 0; i < fadeOutSteps; i++) {
        const brightnessStep = Math.round(maxBrightness / fadeOutSteps);

        const master = maxBrightness - brightnessStep * i;

        steps.push(bar.state({ segments: 'all', master, ...color }));
      }
    }
  }

  return steps;
};

const createHeadPattern = (
  devices: DeviceRegistry,
  colors: Colors,
): ChannelAnimation => {
  const steps: ChannelAnimation = [];

  const { left, right } = devices.object().head;

  const masterBrightness = 200;
  const strobeDuration = 8;
  const breakDuration = 32 - strobeDuration;

  for (const color of [colors.b, colors.a]) {
    for (let i = 0; i < strobeDuration; i++) {
      steps.push(
        flattenChannelStates(
          left.state({ master: masterBrightness, ...color }),
          right.state({ master: 0 }),
        ),
      );
    }

    for (let i = 0; i < breakDuration; i++) {
      steps.push(
        flattenChannelStates(
          left.state({ master: 0 }),
          right.state({ master: 0 }),
        ),
      );
    }

    for (let i = 0; i < strobeDuration; i++) {
      steps.push(
        flattenChannelStates(
          left.state({ master: 0 }),
          right.state({ master: masterBrightness, ...color }),
        ),
      );
    }

    for (let i = 0; i < breakDuration; i++) {
      steps.push(
        flattenChannelStates(
          left.state({ master: 0 }),
          right.state({ master: 0 }),
        ),
      );
    }
  }

  return repeat(steps, 2);
};

const createBeamerPattern = (
  devices: DeviceRegistry,
  colors: Colors,
): ChannelAnimation => {
  const steps: ChannelAnimation = [];

  const beamer = devices.object().beamer;

  const fadeInSteps = 2;
  const fadeOutSteps = 14;
  const maxBrightness = 255;

  for (let color of [colors.a, colors.b]) {
    for (let _ = 0; _ < 8; _++) {
      for (let i = 0; i < fadeInSteps; i++) {
        const brightnessStep = Math.round(maxBrightness / fadeInSteps);

        const master = i * brightnessStep;

        steps.push(beamer.state({ master, ...color }));
      }

      for (let i = 0; i < fadeOutSteps; i++) {
        const brightnessStep = Math.round(maxBrightness / fadeOutSteps);

        const master = maxBrightness - brightnessStep * i;

        steps.push(beamer.state({ master, ...color }));
      }
    }
  }

  return steps;
};

const createPixelPattern = (
  devices: DeviceRegistry,
  colors: Colors,
): Array<number[]> => {
  const { neopixelA, neopixelB } = devices.object();

  const steps: Array<number[]> = [];

  for (let i = 0; i < 4; i++) {
    for (const color of [colors.a, colors.b]) {
      const a = getPixelGradient(neopixelA, color, 8, 32);
      const b = getPixelGradient(neopixelB, color, 8, 32);
      steps.push(...mergePixelPatterns(a, b));

      for (let i2 = 0; i2 < 96; i2++) {
        steps.push([...neopixelA.setAll({}), ...neopixelB.setAll({})]);
      }
    }
  }

  return steps;
};
