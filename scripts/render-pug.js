'use strict';
const fs = require('fs');
const upath = require('upath');
const pug = require('pug');
const sh = require('shelljs');
const prettier = require('prettier');

function getReignDays(won, lost) {
    if (!won) {
        return '—';
    }

    const start = new Date(won);
    if (Number.isNaN(start.getTime())) {
        return '—';
    }

    const isPresent = !lost || String(lost).toLowerCase() === 'present';
    const end = isPresent ? new Date() : new Date(lost);
    if (Number.isNaN(end.getTime())) {
        return '—';
    }

    const msInDay = 1000 * 60 * 60 * 24;
    const diff = end - start;
    if (diff < 0) {
        return '—';
    }

    return Math.floor(diff / msInDay) + 1;
}

module.exports = function renderPug(filePath) {
    const destPath = filePath.replace(/src\/pug\//, 'dist/').replace(/\.pug$/, '.html');
    const srcPath = upath.resolve(upath.dirname(__filename), '../src');
    const siteDataPath = upath.resolve(srcPath, 'data/site-data.json');
    const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf8'));

    console.log(`### INFO: Rendering ${filePath} to ${destPath}`);
    const html = pug.renderFile(filePath, {
        doctype: 'html',
        filename: filePath,
        basedir: srcPath,
        siteData,
        getReignDays
    });

    const destPathDirname = upath.dirname(destPath);
    if (!sh.test('-e', destPathDirname)) {
        sh.mkdir('-p', destPathDirname);
    }

    const prettified = prettier.format(html, {
        printWidth: 1000,
        tabWidth: 4,
        singleQuote: true,
        proseWrap: 'preserve',
        endOfLine: 'lf',
        parser: 'html',
        htmlWhitespaceSensitivity: 'ignore'
    });

    fs.writeFileSync(destPath, prettified);
};
