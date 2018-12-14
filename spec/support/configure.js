require('ts-node').register({
    project: 'tsconfig.spec.json',
});

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new SpecReporter({
    spec: {
        displayPending: true,
    },
}));

require('jsdom-global')()
