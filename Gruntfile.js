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

  grunt.registerTask("build", function() {
    // remove old package
    shell.rm("-rf", "dist");
    shell.mkdir("dist");

    // copy app source into a vanilla Atom Shell
    shell.exec("cp -R binaries/Atom.app/ " + grunt.config.get("distAppName"));
    shell.exec("cp -R app " + grunt.config.get("distAppName") + "/Contents/Resources");
  });

};