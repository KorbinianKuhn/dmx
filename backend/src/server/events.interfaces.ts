import { Server } from 'socket.io';
import { ChaseColor } from '../dmx/lib/chase';
import { DeviceConfig, Visuals } from '../dmx/lib/config';
import { ActiveProgramName, OverrideProgramName } from '../dmx/lib/program';

export interface ClientToServerEvents {
  'set:bpm': (payload: { value: number }) => void;
  'set:start': () => void;
  'set:black': (payload: { value: boolean }) => void;
  'set:master': (payload: { value: number }) => void;
  'set:ambient-uv': (payload: { value: number }) => void;
  'set:override-program': (payload: {
    value: OverrideProgramName | null;
  }) => void;
  'set:active-program': (payload: { value: ActiveProgramName }) => void;
  'set:active-colors': (payload: { colors: ChaseColor[] }) => void;
  'set:settings-mode': (payload: { value: boolean }) => void;
  'set:settings-channel': (payload: { address: number; value: number }) => void;
  'set:device-config': (payload: { id: string; config: DeviceConfig }) => void;
  'set:visuals-source': (payload: { id: number }) => void;
  'set:visuals-settings': (payload: {
    color: 'chase' | 'original';
    opacity: 'chase' | 'off';
    text: boolean;
    left: number;
    right: number;
    top: number;
    bottom: number;
  }) => void;
}

export interface ServerToClientEvents {
  'black:updated': (payload: { value: boolean }) => void;
  'bpm:updated': (payload: { value: number }) => void;
  'tick:updated': (payload: { value: number }) => void;
  'master:updated': (payload: { value: number }) => void;
  'ambient-uv:updated': (payload: { value: number }) => void;
  'override-program:updated': (payload: { value: OverrideProgramName }) => void;
  'override-program:progress': (payload: {
    programName: string;
    color: string;
    progress: number;
  }) => void;
  'active-program:updated': (payload: { value: ActiveProgramName }) => void;
  'active-program:progress': (payload: {
    programName: string;
    color: string;
    progress: number;
  }) => void;
  'active-colors:updated': (payload: { colors: ChaseColor[] }) => void;
  // 'chase:updated': (payload: { value: number }) => void;
  // 'step:updated': (payload: { value: number }) => void;
  'settings-mode:updated': (payload: { value: boolean }) => void;
  'settings-data:updated': (payload: { buffer: number[] }) => void;
  'device-config:updated': (payload: {
    id: string;
    config: DeviceConfig;
  }) => void;
  'visuals:source-updated': (payload: number) => void;
  'visuals:settings-updated': (payload: Visuals) => void;
}

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
