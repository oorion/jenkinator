module.exports = function(grunt) {

  var shell = require("shelljs");

  grunt.loadNpmTasks("grunt-download-atom-shell");

  grunt.initConfig({

    pkg : grunt.file.readJSON("package.json"),

    distAppName : "dist/<%= pkg.name %>.app",

    "download-atom-shell": {
      version: "0.18.2",
      outputDir: "binaries"
    }
  });

  grunt.registerTask("apm-install", function() {
    shell.cd("app");
    shell.exec("apm install .")
  });

  grunt.registerTask("clean", function() {
    // remove old package
    shell.rm("-rf", "dist");
    shell.mkdir("dist");
  });

  grunt.registerTask("copy", function() {
    // copy app source into a vanilla Atom Shell
    shell.exec("cp -R binaries/Atom.app/ " + grunt.config.get("distAppName"));
    shell.exec("cp -R app " + grunt.config.get("distAppName") + "/Contents/Resources");
  });

  grunt.registerTask("bootstrap", ["download-atom-shell", "apm-install"]);
  grunt.registerTask("build", ["clean", "copy"]);

};