#!/usr/bin/env node

const args = require('command-line-args');
const marked = require('marked');
const fs = require('fs');
const mustache = require('mustache');
const katex = require('katex');

const encoding = { encoding: 'utf8' };

const options = args([
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'in', type: String },
  { name: 'out', type: String }
]);

const input = fs.readFileSync(options['in'], encoding);

function parsePage(page) {
  const lines = page.split('\n').filter(row => row.length >= 1);
  const pageInfo = {};
  const isKeyStart = lines.map(line => line.match(/^[a-zA-Z_]+:/));

  if (isKeyStart[0] !== null) {
    for (let i = 0 ; i < lines.length ; ) {
      const keyLen = isKeyStart[i][0].length;
      const key = isKeyStart[i][0].substr(0, keyLen-1);
      const values = [lines[i].substr(keyLen).trim()];
      let j = i+1;
      while (j < lines.length && !isKeyStart[j]) {
        values.push(lines[j]);
        j++;
      }
      pageInfo[key] = values.join('\n').trim();
      i = j;
    }
    return pageInfo;
  } else {
    return {
      title: '',
      template: 'default',
      body: page
    }
  }
}

function makeContents(pageInfo) {
  let html = '';

  const markdownBody = pageInfo.body;
  switch (pageInfo.template) {
    case 'title':
      html = '<div class="container"><h1 id="title">' + pageInfo.title + '</h1></div>';
      break;
    case 'default':
      html = '<div class="container">' + parseKatex(marked(pageInfo.body)) + '</div>';
      break;
    case 'twopane':
      const title = '<h1>' + pageInfo.title + '</h1>'
      const left = '<div class="twopane_left">' + parseKatex(marked(pageInfo.bodyLeft)) + '</div>';
      const right = '<div class="twopane_right">' + parseKatex(marked(pageInfo.bodyRight)) + '</div>';

      html = title + '<div class="container">' + left + right + '</div>';
      break;
  }
  return html;
}

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

const pages = input.split('---').map(page => parsePage(page));
const contents = pages.map((page, index) => {
  return { id: index, contents: makeContents(page) }
});

const meta = {
  title: pages[0].title,
  background: pages[0].background
};

const htmlTemplate = fs.readFileSync('./templates/template.html', encoding);
const cssTemplate = fs.readFileSync('./templates/style.css', encoding);

const css = mustache.render(cssTemplate, { background: meta['background'] || '#fff' });
const output = mustache.render(htmlTemplate, { title: meta['title'] || 'title', contents: JSON.stringify(contents), css: css });

if (options['out']) {
  fs.writeFileSync(options['out'], output, encoding);
} else {
  process.stdout.write(output);
}
