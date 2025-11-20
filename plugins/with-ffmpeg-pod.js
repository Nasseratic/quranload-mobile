const { withPlugins, createRunOncePlugin, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function addPodDependency(podfilePath) {
  const podInstallLine = `pod 'shaquillehinds-ffmpeg-kit-ios', :podspec => 'https://raw.githubusercontent.com/shaquillehinds/ffmpeg/master/shaquillehinds-ffmpeg-kit-ios.podspec'`;

  let contents = fs.readFileSync(podfilePath, "utf8");

  // Check if the lines are already present
  if (!contents.includes(podInstallLine)) {
    // Find the target line and insert before it
    const targetLine = "target 'quranload' do";
    const targetIndex = contents.indexOf(targetLine);

    if (targetIndex !== -1) {
      // Find the end of the target line
      const lineEnd = contents.indexOf("\n", targetIndex) + 1;

      // Insert the pod dependencies after the target line
      contents =
        contents.substring(0, lineEnd) + `  ${podInstallLine}\n\n` + contents.substring(lineEnd);

      fs.writeFileSync(podfilePath, contents, "utf8");
    }
  }
}

function withMyFFmpegPod(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, "Podfile");

      if (fs.existsSync(podfilePath)) {
        addPodDependency(podfilePath);
      }

      return cfg;
    },
  ]);
}

const withFFmpegPod = (config) => {
  return withPlugins(config, [withMyFFmpegPod]);
};

module.exports = createRunOncePlugin(withFFmpegPod, "with-ffmpeg-pod", "1.0.0");
