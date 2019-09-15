"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || '';
const tc = __importStar(require("@actions/tool-cache"));
const core = __importStar(require("@actions/core"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
if (!tempDirectory) {
    let baseLocation;
    if (process.platform === 'win32') {
        // On windows use the USERPROFILE env variable
        baseLocation = process.env['USERPROFILE'] || 'C:\\';
    }
    else {
        if (process.platform === 'darwin') {
            baseLocation = '/Users';
        }
        else {
            baseLocation = '/home';
        }
    }
    tempDirectory = path.join(baseLocation, 'actions', 'temp');
}
const osPlatform = os.platform();
const osArch = os.arch();
const getUrl = (version) => {
    const arch = osPlatform == 'win32'
        ? 'win'
        : osPlatform == 'darwin'
            ? 'osx-x86_'
            : 'linux-x86_';
    const bitness = osArch == 'x64' ? '64' : '32';
    const platform = `${arch}${bitness}`;
    const url = `https://github.com/protocolbuffers/protobuf/releases/download/v${version}/protoc-${version}-${platform}.zip`;
    return url;
};
const fetchProtoc = (version) => __awaiter(void 0, void 0, void 0, function* () {
    const url = getUrl(version);
    core.debug(`fetching protoc@${version}: ${url}`);
    const protocZip = yield tc.downloadTool(url);
    const protocUnzipped = yield tc.extractZip(protocZip);
    const toolDir = yield tc.cacheDir(protocUnzipped, 'protoc', version);
    return toolDir;
});
exports.getProtoc = (version) => __awaiter(void 0, void 0, void 0, function* () {
    let toolPath = tc.find('protoc', version);
    if (!toolPath) {
        core.debug('not cached, fetching.');
        toolPath = yield fetchProtoc(version);
    }
    else {
        core.debug('cached!');
    }
    // set env vars?
    toolPath = path.join(toolPath, 'bin');
    core.addPath(toolPath);
});
