module.exports = function(config) {
	process.env.TZ = 'Etc/UTC';
	config.set({
		frameworks: ['jasmine'],
		files: [
			'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
			'src/*.js',
			'spec/*.js'
		],
		browsers : ['Chrome'],
		singleRun: true,
		browserDisconnectTimeout: 100000,
		browserDisconnectTolerance: 1000,
		browserNoActivityTimeout: 500000,
		reporters: ['progress', 'coverage', 'junit'],
		preprocessors: {
			'src/AdManager-uncompressed.js': ['coverage']
		},
		coverageReporter: {
			dir: 'coverage',
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'cobertura', subdir: '.', file: 'cobertura.xml' }
			]
		},
		junitReporter: {
			outputDir: 'test-report',
			outputFile: 'junit.xml',
			useBrowserName: false,
		}
	});
};
