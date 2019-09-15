import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');
import nock = require('nock');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');
const dataDir = path.join(__dirname, 'data');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer';

const IS_WINDOWS = process.platform === 'win32';

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, 100000);

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('Acquires version of protoc if no matching version is installed', async () => {
    await installer.getProtoc('');
    const protocDir = path.join(toolDir, 'protoc', '3.9.1', os.arch());

    expect(fs.existsSync(`${protocDir}.complete`)).toBe(true);
    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(protocDir, 'bin', 'protoc.exe'))).toBe(
        true
      );
    } else {
      expect(fs.existsSync(path.join(protocDir, 'bin', 'protoc'))).toBe(true);
    }
  }, 100000);

  describe('the latest release of a protoc version', () => {
    beforeEach(() => {
      nock('https://api.github.com')
        .get('/repos/protocolbuffers/protobuf/git/refs/tags')
        .replyWithFile(200, path.join(dataDir, 'protoc-tags.json'));
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('Throws if no location contains correct protoc version', async () => {
      let thrown = false;
      try {
        await installer.getProtoc('1000.0');
      } catch {
        thrown = true;
      }
      expect(thrown).toBe(true);
    });

    it('Uses version of go installed in cache', async () => {
      const protocDir: string = path.join(
        toolDir,
        'protoc',
        '250.0.0',
        os.arch()
      );
      await io.mkdirP(protocDir);
      fs.writeFileSync(`${protocDir}.complete`, 'hello');
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await installer.getProtoc('250.0');
      return;
    });

    it('Doesnt use version of go that was only partially installed in cache', async () => {
      const protocDir: string = path.join(
        toolDir,
        'protoc',
        '251.0.0',
        os.arch()
      );
      await io.mkdirP(protocDir);
      let thrown = false;
      try {
        // This will throw if it doesn't find it in the cache (because no such version exists)
        await installer.getProtoc('251.0');
      } catch {
        thrown = true;
      }
      expect(thrown).toBe(true);
      return;
    });
  });
});
