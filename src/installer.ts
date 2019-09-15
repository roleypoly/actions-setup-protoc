let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || '';
import * as tc from '@actions/tool-cache';
import * as core from '@actions/core';
import * as os from 'os';
import * as path from 'path';

if (!tempDirectory) {
  let baseLocation;
  if (process.platform === 'win32') {
    // On windows use the USERPROFILE env variable
    baseLocation = process.env['USERPROFILE'] || 'C:\\';
  } else {
    if (process.platform === 'darwin') {
      baseLocation = '/Users';
    } else {
      baseLocation = '/home';
    }
  }
  tempDirectory = path.join(baseLocation, 'actions', 'temp');
}

const osPlatform = os.platform();
const osArch = os.arch();

const getUrl = (version: string) => {
  const arch =
    osPlatform == 'win32'
      ? 'win'
      : osPlatform == 'darwin'
      ? 'osx-x86_'
      : 'linux-x86_';
  const bitness = osArch == 'x64' ? '64' : '32';
  const platform = `${arch}${bitness}`;
  const url = `https://github.com/protocolbuffers/protobuf/releases/download/v${version}/protoc-${version}-${platform}.zip`;
  return url;
};

const fetchProtoc = async (version: string) => {
  const url = getUrl(version);
  core.debug(`fetching protoc@${version}: ${url}`);
  const protocZip = await tc.downloadTool(url);
  const protocUnzipped = await tc.extractZip(protocZip);
  const toolDir = await tc.cacheDir(protocUnzipped, 'protoc', version);
  return toolDir;
};

export const getProtoc = async (version: string) => {
  let toolPath = tc.find('protoc', version);

  if (!toolPath) {
    toolPath = await fetchProtoc(version);
  }

  // set env vars?

  toolPath = path.join(toolPath, 'bin');
  core.addPath(toolPath);
};
