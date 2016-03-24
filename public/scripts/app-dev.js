//https://scotch.io/tutorials/creating-a-photo-discovery-app-with-nw-js-part-1
'use strict';

// Dependencies - loading nw.js file system module
var fs = require('fs');
var mime = require('mime');
var path = require('path');

var imageMimeTypes = [
    'image/gif',
    'image/jpeg',
    'image/png'
];

function findAllFiles (folderPath, cb) {
    fs.readdir(folderPath, function (err, files) {
        if (err) { return cb(err, null); }
        cb(null, files);
    });
}

function findImageFiles (files, folderPath, cb) {
    var imageFiles = [];
    files.forEach(function (file) {
        var fullFilePath = path.resolve(folderPath,file);
        var extension = mime.lookup(fullFilePath);
        if (imageMimeTypes.indexOf(extension) !== -1) {
            imageFiles.push({name: file, path: fullFilePath});
        }
        if (files.indexOf(file) === files.length-1) {
            cb(imageFiles);
        }
    });
}

// Runs when the browser has loaded the page
window.onload = function() {
    
    var path = require('path');
    var nwDir = path.dirname(process.execPath);
    console.log("This is process.execPath");
    console.log(nwDir);

    // if windows environment then they get backslashes else forward slashes
    var seperator = (process.platform == "win32") ? "\\" : "/";
    var split = nwDir.split(path.sep);
    console.log("This is an array.")
    console.log(split);

    console.log("This is the home path");    
    var homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;
    console.log(homedir);

    var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    console.log("Userprofile or Home")
    console.log(home);

    // var globalRoot = __dirname; //(you may have to do some substring processing if the first script you run is not in the project root, since __dirname refers to the directory that the file is in for which __dirname is called in.)

    // //compare the last directory in the globalRoot path to the name of the project in your package.json file
    // var folders = globalRoot.split(path.sep);
    // var packageName = folders[folders.length-1];
    // var pwd = process.env.PWD;
    // var npmPackageName = process.env.npm_package_name;

    // console.log(folders);
    // console.log(packageName);
    // console.log(pwd);
    // console.log(npmPackageName);
    // if(packageName !== npmPackageName){
    //     console.log('Failed check for runtime string equality between globalRoot-bottommost directory and npm_package_name.');
    // }
    // if(globalRoot !== pwd){
    //     console.log('Failed check for runtime string equality between globalRoot and process.env.PWD.');
    // }

    // http://stackoverflow.com/questions/10265798/determine-project-root-from-a-running-node-js-application    
    // https://github.com/inxilpro/node-app-root-path    
    var appRoot = require('app-root-path').path;
    console.log(appRoot.path);
    var splitDirPath = appRoot.split(path.sep);

    var imageFolder = path.resolve(appRoot, "../../images");
    console.log(imageFolder);

    imageFolder = path.resolve(nwDir, "../images");
    console.log(imageFolder);

    //var folderPath = "./images";    
    findAllFiles(imageFolder, function (err, files) {
        if (!err) {
            findImageFiles(files, imageFolder, function (imageFiles) {
                //console.log(imageFiles);
                $.each(imageFiles, function(i, image) {
                    $('#lstLocalPhotos').append($('<option/>', { 
                        value: image.path,
                        text : image.name 
                    }));
                });
            });
        }
    });
};

$(document).ready(function() {
    $("#lstLocalPhotos").change(function() {
        var src = $(this).val();
        $("#photoPreview").html(src ? "<img id='img' src='" + src + "'>" : "");
    });
    $("#img").rotate({
        bind: {
            click: function(){
                //$(this).rotate({ angle: 0, animateTo:45 })
                alert($(this).getRotateAngle());
            }
        }
    });
});