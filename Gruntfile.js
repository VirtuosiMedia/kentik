module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-webfont');

	grunt.initConfig({
		'pkg': grunt.file.readJSON('package.json'),

        'imagemin': {                          
          'svg': {                                                  
            'files': [{
              'expand': true,                  
              'cwd': 'source/assets/images/font/',
              'src': ['*.svg'],
              'dest': 'source/assets/images/font/min/'
            }]
          }
        },

        'webfont': {
            'icons': {
                'src': 'source/assets/images/font/min/*.svg',
                'dest': 'source/assets/fonts/icons/',
                'destCss': 'source/assets/css/',
                'options': {
                  'engine': 'node',
                  'syntax': 'bem',
                  'types': 'eot,woff,ttf,svg',
                  'order': 'woff,ttf',
                  'templateOptions': {
                    'baseClass': 'icon',
                    'classPrefix': 'icon-',
                    'embed': 'ttf'
                  }
                }
            }
        }, 
	});

	grunt.registerTask('build',	[
	  'imagemin',
	  'webfont'
	]);
};