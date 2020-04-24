module.exports = function(config) {
	process.env.TZ = 'Etc/UTC';
	config.set({
		frameworks: ['jasmine'],
		files: [
			'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
			'src/*.js',
			'spec/*.js'
		],
		browsers : ['Chrome_autoplay_allowed'],
		singleRun: true,
		browserDisconnectTimeout: 100000,
		browserDisconnectTolerance: 1000,
		browserNoActivityTimeout: 500000,
		customLaunchers: {
			Chrome_autoplay_allowed: {
				base: 'Chrome',
				flags: ['--autoplay-policy=no-user-gesture-required']
			}
		},
		reporters: ['progress', 'coverage', 'junit'],
		preprocessors: {
			'src/AdManager-uncompressed.js': ['coverage']
		},
		coverageReporter: {
			dir: 'coverage',
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'cobertura', subdir: '.', file: 'Chrome-cobertura.xml' }
			]
		},
		junitReporter: {
			outputDir: 'test-report',
			outputFile: 'Chrome-junit.xml',
			useBrowserName: false,
		}
	});
};
