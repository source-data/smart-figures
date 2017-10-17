```
This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
```

# SourceData - search interface
The search interface of SourceData needs some external modules from Bower and NPM.
After cloning the directory, update the external components:
```bash
npm install;
bower update;
```

## edit bootstrap to use css instead of less
edit the file: `bower_components/bootstrap/bower.json`.
change `"less/bootstrap.less",` to `"dist/css/bootstrap.css",`

## editing Gruntfile
The development of SourceData is managed by Grunt.
You might want to change the path to the backend:
`serverURL:`

To develop, type:
`grunt serve`

To build, type:
`grunt build`

This will package the application in the `dist` folder

