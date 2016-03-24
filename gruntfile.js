module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		nwjs: {
			options: {
				version: '0.12.3',
                buildDir: './builds/',
                zip: true,
				platforms:['win', 'osx'] // 'linux', 'win', 'osx'
			},
			src: ['./public/**/**/*']
		}
    });
        
    // Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-nw-builder');

    // Default task(s).
    grunt.registerTask('default', ["nwjs"]);
};