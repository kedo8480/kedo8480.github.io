Run JS regression on IE

1. Install babel from command line: `npm install babel-preset-env`
2. Under "regression" folder, run `sh strict_mode_conversion.sh` from command line to convert all js files to 'strict' mode
3. Under "regression" folder, run "../node_modules/karma-cli/bin/karma start IE_karma.conf.js --browsers IE" from command line to start the test