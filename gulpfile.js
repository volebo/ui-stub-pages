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

/**
 * @module  gulpfile
 *
 * Simply copies all tasks from assemblefile.js
 *
 */

const gulp = require('gulp');

const asm = require('./assemblefile');


for (let taskName in asm.tasks) {
	if ({}.hasOwnProperty.call(asm.tasks, taskName)) {
		gulp.task(taskName, function(cb) {
			asm.build(taskName, cb);
		});
	}
}
