import { exec } from 'child_process';
import { stylesEntryPoint } from './utils.mjs';

const liveServer = exec('live-server src');
const sass = exec(
  `sass ${stylesEntryPoint.src} ${stylesEntryPoint.dest} --watch --no-source-map`
);

liveServer.stdout.on('data', console.log);
sass.stdout.on('data', console.log);

function exitHandler() {
  for (const task of [liveServer, sass]) {
    try {
      task.kill();

      if (!task.killed) {
        console.log('Failed to kill process', task.pid);
      }
    } catch (_) {
      //
    }
  }
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
