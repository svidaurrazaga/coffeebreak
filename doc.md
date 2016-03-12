## How I got it to work
Created working folder: sign-app

Using terminal, I changed the directory to the folder: cd Documents/_Projects/sign-app

Next I installed NW locally using NPM (Node package manager)
    npm install nw

The previous command downloads the source files from github into it's own folder 'node_modules/nw/..'

The next command I have to tell terminal to open the nw and tell it to open my app
    node_modules/.bin/nw ./
    node_modules/.bin/nw ./public/


## How I run builds
gruntjs.com - http://gruntjs.com/getting-started
The grunt config files is called grunt.js. It contains available tasks to run via grunt. First you have to install grunt globally. Then create the config file called grunt.js You can install other grunt tasks and use the '--save-dev' to add the depencies to the config file.

Command:
    Install grunt globally
        npm install -g grunt-cli

    Run grunt tasks
        grunt --tasks nwjs



