/*
Static caps and stubs for Volebo.net site

Copyright (C) 2016  Volebo <volebo.net@gmail.com>
Copyright (C) 2016  Koryukov Maksim <maxkoryukov@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

require('dotenv').config({ silent: true });
const isDev = true;

const path         = require('path');
const _            = require('lodash');

const htmlmin      = require('gulp-htmlmin');
const rename       = require('gulp-rename');
const less         = require('gulp-less');
const inline       = require('gulp-inline');

const assemble = require('assemble');

const app = assemble();


let l10nNewKeys = {};
const l10nDict = require('./translations/en');
const translateHelper = function(key, val) {

	if (_.has(l10nDict, key)) { return _.get(l10nDict, key); }

	console.error(`no such key ${key}`);
	_.set(l10nNewKeys, key, val || key);
	return key;
}

let data = {
	gakeys: (process.env['GAKEYS'] || '').split(/\s+/)
}

app.layouts('src/layouts/*.hbs');
app.partials('src/partials/*.hbs');
app.helpers({
	'__': translateHelper,
});

//app.option('layout', 'default');

app.task('load-assets', function() {
	return app.src('remove-this/*')
		.pipe(app.dest('tmp/inline'));
});


app.task('less', function() {
	let cssUnnamedCounter = 0;

	return app.src('src/**/index.less')
		.pipe(less({
			paths: [
				path.join(process.cwd(), 'node_modules')
			]
		}))
		.pipe(rename(function(p) {
			let cssName = path.basename(p.dirname);
			p.basename = cssName ? cssName : (cssUnnamedCounter ++ ).toString();
		}))
		.pipe(rename({
			dirname: ''
		}))
		.pipe(app.dest('tmp/inline'));
});


app.task('default', ['less', 'load-assets'], function( ) {
	return app.src('src/**/index.hbs', {layout: 'default'})
		.pipe(app.renderFile(data)) //<= render pages with default engine (hbs)

		.pipe(rename({
			extname: '.html'
		}))
		.pipe(inline({
			base: path.join(process.cwd(), 'tmp/inline'),
			disabledTypes: [],
		}))
		.pipe(htmlmin({collapseWhitespace: !isDev}))
		.pipe(app.dest('dist'))
		.on('end', function(){
			if (l10nNewKeys.length) {
				console.error('there are several unknown keys', l10nNewKeys)
			}
		})
	;
});

// expose your instance of assemble to assemble's CLI
module.exports = app;
