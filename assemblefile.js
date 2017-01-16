/*
Static caps and stubs for Volebo.net site

Copyright (C) 2016-2017 Volebo <dev@volebo.net>
Copyright (C) 2016-2017 Koryukov Maksim <maxkoryukov@gmail.com>

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

const debug        = require('debug')('volebo:ui-stub-pages');
const path         = require('path');
const _            = require('lodash');

const gulpif       = require('gulp-if');
const filesize     = require('gulp-size');
const htmlmin      = require('gulp-htmlmin');
const rename       = require('gulp-rename');
const inline       = require('gulp-inline');

const less         = require('gulp-less');
const csso         = require('gulp-csso');

// plugins
// var autoprefixer = require('gulp-autoprefixer');
// var csslint      = require('gulp-csslint');
// var csslint_rep  = require('gulp-csslint-report');

// var jslint       = require('gulp-eslint');
// var jslint_rep   = require('eslint-html-reporter');
// var uglify       = require('gulp-uglify');
// var zip          = require('gulp-zip');

const assemble     = require('assemble');

// replace with GET ENV module
const isProd = process.env['NODE_ENV'] === 'production';
debug('ENV production:', isProd, 'env-name:', process.env.NODE_ENV);

const app = assemble();


let l10nNewKeys = {};
const l10nDict = require('./translations/origin');
//const l10nDict = require('./translations/ru-RU');
//const l10nDict = require('./translations/en');
const translateHelper = function(key, val) {

	if (_.has(l10nDict, key)) { return _.get(l10nDict, key); }

	console.error(`no such key ${key}`);
	_.set(l10nNewKeys, key, val || key);
	return key;
}

let data = {
	lang: {
		code: 'en',
	},
	gakeys: (process.env['GAKEYS'] || '').split(/\s+/)
}

app.layouts('src/layouts/*.hbs');
app.partials('src/partials/*.hbs');
app.helpers({
	'__': translateHelper,
});


app.task('load-assets', function() {
	return app.src('remove-this/*')
		.pipe(app.dest('tmp/inline'));
});


app.task('less', function() {
	let cssUnnamedCounter = 0;

	return app.src('src/**/index.less')
		.pipe(filesize({title: 'less RAW:'}))
		.pipe(less({
			paths: [
				path.join(process.cwd(), 'node_modules')
			]
		}))
		.pipe(rename(function(p) {
			let cssName = path.basename(p.dirname);
			p.basename = cssName ? cssName : (cssUnnamedCounter++).toString();
		}))
		.pipe(rename({
			dirname: ''
		}))
		.pipe(filesize({title: 'css uncompressed:'}))
		.pipe(gulpif(isProd, csso()))
		.pipe(filesize({title: 'css compressed:'}))

		.pipe(app.dest('tmp/inline'));


	// return gulp.src(paths.client.style, {base: paths.client.base})

	// 	//.pipe(concat('styles.css'))
	// 	//.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
	// 	.pipe(autoprefixer('last 2 version'))

	// 	.pipe(csslint())
	// 	// DONE : remove path.join
	// 	.pipe(csslint_rep({
	// 		directory: paths.build.csslint,
	// 		filename: 'index.html',
	// 		createMissingFolders: true,
	// 	}))

	// 	.pipe(gulp.dest(paths.build.assets))
	// 	//.on('error', debug)
	// ;

});


app.task('default', ['less', 'load-assets'], function( ) {
	return app.src('src/pages/**/index.hbs', {layout: 'default'})
		.pipe(app.renderFile(data)) //<= render pages with default engine (hbs)

		.pipe(rename(function(p) {
			let cssName = path.basename(p.dirname);
			p.basename = cssName ? cssName : (cssUnnamedCounter ++ ).toString();
		}))
		.pipe(rename({
			extname: '.html',
			dirname: ''
		}))
		.pipe(inline({
			base: path.join(process.cwd(), 'tmp/inline'),
			disabledTypes: [],
		}))
		.pipe(gulpif(isProd, htmlmin({collapseWhitespace: true})))
		.pipe(app.dest('dist'))
		.pipe(filesize({title: 'html final:'}))
		.on('end', function(){
			if (l10nNewKeys.length) {
				console.error('there are several unknown i18n keys', l10nNewKeys)
			}
		})
	;
});

module.exports = app;
