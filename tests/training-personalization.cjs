// Exercise the real account UI through the controlled transport; no real emails are sent.
process.env.GO_TEST_TRAINING='1';
require('./accounts-browser.cjs');
