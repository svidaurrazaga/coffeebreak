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
     // if windows environment then they get backslashes else forward slashes
    var seperator = (process.platform == "win32") ? "\\" : "/";

    // Works on windows - keep for later    
    // var path = require('path');
    // var nwDir = path.dirname(process.execPath);
    // console.log("This is process.execPath");
    // console.log(nwDir);

    // Get the root of this applications folder    
    // http://stackoverflow.com/questions/10265798/determine-project-root-from-a-running-node-js-application    
    // https://github.com/inxilpro/node-app-root-path    
    var appRoot = require('app-root-path').path;
    console.log(appRoot.path);
    var splitDirPath = appRoot.split(path.sep);

    // Get the full path of the image folder outside of this application
    // this is where users will upload their images too.
    var imageFolder = path.resolve(appRoot, "../../images");
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