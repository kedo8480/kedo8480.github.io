module.exports = function(config) {
	process.env.TZ = 'Etc/UTC';
	config.set({
		frameworks: ['jasmine'],
		files: [
			'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
			'src/*.js',
			'spec/*.js'
		],
		exclude: [
			'spec/FWCase406AdInstanceBuffering.js',
			'spec/FWCase051OverlayPlayback.js'
		],
		browsers : ['FirefoxAutoplayAllowed'],
		singleRun: true,
		browserDisconnectTimeout: 100000,
		browserDisconnectTolerance: 1000,
		browserNoActivityTimeout: 500000,
		customLaunchers: {
			FirefoxAutoplayAllowed: {
				base: 'Firefox',
				prefs: {
					'media.autoplay.default': 0
				}
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
				{ type: 'cobertura', subdir: '.', file: 'Firefox-cobertura.xml' }
			]
		},
		junitReporter: {
			outputDir: 'test-report',
			outputFile: 'Firefox-junit.xml',
			useBrowserName: false,
		}
	});
};
