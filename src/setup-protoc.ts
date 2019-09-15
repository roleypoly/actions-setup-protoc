import * as core from '@actions/core';
import * as installer from './installer';
import * as path from 'path';

async function run() {
  try {
    //
    // Version is optional.  If supplied, install / use from the tool cache
    //
    const version = core.getInput('protoc-version', {required: true});

    if (version) {
      await installer.getProtoc(version);
    }

    // const matchersPath = path.join(__dirname, '..', '.github');
    // console.log(`##[add-matcher]${path.join(matchersPath, 'go.json')}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
