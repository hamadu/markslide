#!/usr/bin/env node

const args = require('command-line-args');
const marked = require('marked');
const fs = require('fs');
const mustache = require('mustache');

const options = args([
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'in', type: String, defaultValue: './sample.md' },
  { name: 'out', type: String }
]);

const input = fs.readFileSync(options['in'], { encoding: 'utf8' });
const contents = input.split('---').map((page, index) => {
  return { id: page, contents: marked(page) }
});
const template = fs.readFileSync('./templates/template.html', { encoding: 'utf8' });

const output = mustache.render(template, { contents: JSON.stringify(contents) });
process.stdout.write(output);
