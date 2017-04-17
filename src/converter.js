#!/usr/bin/env node

const args = require('command-line-args');
const marked = require('marked');
const fs = require('fs');
const mustache = require('mustache');
const katex = require('katex');

const encoding = { encoding: 'utf8' };

const options = args([
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'in', type: String, defaultValue: './sample.md' },
  { name: 'out', type: String }
]);

const input = fs.readFileSync(options['in'], encoding);
const pages = input.split('---');

const meta = {};
pages[0].split('\n').forEach(row => {
  const kv = row.split(':');
  if (kv.length >= 2) {
    meta[kv[0].trim()] = kv[1].trim();
  }
});

function parseKatex(page) {
  let pageWithMath = page;
  const regex = /\$\$(.*?)\$\$/g;
  let matchResult = null;
  while ((matchResult = regex.exec(page)) !== null) {
    const math = katex.renderToString(matchResult[1]);
    pageWithMath = pageWithMath.replace(/\$\$(.*?)\$\$/, math);
  }
  return pageWithMath;
}

const contents = pages.slice(1).map((page, index) => {
  return { id: page, contents: parseKatex(marked(page)) }
});

const htmlTemplate = fs.readFileSync('./templates/template.html', encoding);
const cssTemplate = fs.readFileSync('./templates/style.css', encoding);

const css = mustache.render(cssTemplate, { background: meta['background'] || '#fff' });
const output = mustache.render(htmlTemplate, { title: meta['title'] || 'title', contents: JSON.stringify(contents), css: css });

process.stdout.write(output);
