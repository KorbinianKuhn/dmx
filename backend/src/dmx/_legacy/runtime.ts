import { SerialPort } from 'serialport';
import { Logger } from '../utils/logger';
import { wait } from '../utils/time';
import { Universe } from './universe';

export class Runtime {
  private serial!: SerialPort;

  private isWriteable = true;
  private logger = new Logger('runtime');

  constructor(private universe: Universe) {}

  async init(): Promise<void> {
    this.logger.info('init');
    return new Promise((resolve, reject) => {
      this.serial = new SerialPort(
        {
          path: '/dev/ttyAMA0',
          baudRate: 250000,
          dataBits: 8,
          stopBits: 2,
          parity: 'none',
        },
        (err) => (err ? reject(err) : resolve()),
      );

      this.serial.on('open', () => {
        this.logger.info('serial is open');
        this._loop();
      });
    });
  }

  _sendStopByte(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serial.set({ brk: true, rts: true }, (err) =>
        err ? reject(err) : resolve(),
      );
    });
  }

  _sendStartByte(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serial.set({ brk: false, rts: true }, (err) =>
        err ? reject(err) : resolve(),
      );
    });
  }

  _drain(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serial.drain((err) => (err ? reject(err) : resolve()));
    });
  }

  _write(data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serial.write(data, (err) => (err ? reject(err) : resolve()));
    });
  }

  _loop() {
    this.logger.info('start loop');
    setInterval(async () => {
      await this._sendStopByte();
      await wait(1);
      await this._sendStartByte();
      await wait(1);

      if (!this.isWriteable) {
        return;
      }
      this.isWriteable = false;

      const buffer = Buffer.from([0]);
      const state = Buffer.concat([buffer, this.universe.getState().slice(1)]);
      await this._write(state);

      await this._drain();
      this.isWriteable = true;
    }, 46);
  }
}
