// // cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var fs    = require("fs");

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

function extractManifest(appName, callback) {
  var yaml  = require("js-yaml");
  var manifest;

  if (fs.existsSync("manifest.yml")) {
    var yString = fs.readFileSync("manifest.yml", "utf8");
    manifest = yaml.safeLoad(yString, {
      filename: "manifest.yml"
    });

    for(var i in manifest.applications)  {
      if (appName === manifest.applications[i].name) {
        return callback(null, manifest.applications[i]);
      }
    }

    return callback(new Error("There is no application with the name `" + appName + "` in `manifest.yml`!"));
  } else {
    var err = new Error("No `manifest.yml` file!");
    callback(err);
  }
};

function uploadEnvVariables(appManifest, cb) {
  if (!appManifest) {
    return cb(new Error('Invalid `appManifest` or empty!'));
  }

  for (var key in appManifest) {
    if (appManifest.hasOwnProperty(key)) {
      process.env[key] = appManifest[key];
    }
  }

  cb(null, {status: 'success'});
}

/**
 * Function to read app environment from Cloud Foundry
 *
 * @returns {nm$_config.appEnv} app environment from Cloud Foundry
 */
function getAppEnv() {
  return appEnv;
}

function printActiveEnvInformation() {
  console.log('--------------------------------------------------------------');
  console.log('Your app is bound to `%s:%s` server.', appEnv.bind, process.env.PORT);
  console.log('Your app is running in `%s` environment.', process.env.NODE_ENV);
  console.log('--------------------------------------------------------------');
}

module.exports = {
  extractManifest: extractManifest,
  getAppEnv: getAppEnv,
  printActiveEnvInformation: printActiveEnvInformation,
  uploadEnvVariables: uploadEnvVariables
};