import { Server } from 'socket.io';

export interface ClientToServerEvents {
  'set:bpm': (payload: { value: number }) => void;
  'set:black': (payload: { value: boolean }) => void;
  'set:master': (payload: { value: number }) => void;
}

export interface ServerToClientEvents {
  'bpm:updated': (payload: { value: number }) => void;
  'black:updated': (payload: { value: boolean }) => void;
  'master:updated': (payload: { value: number }) => void;
  'chase:updated': (payload: { value: number }) => void;
  'step:updated': (payload: { value: number }) => void;
  'dmx:write': (payload: { data: Buffer }) => void;
}

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
