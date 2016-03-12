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
    var folderPath = "./images/";
    findAllFiles(folderPath, function (err, files) {
        if (!err) {
            findImageFiles(files, folderPath, function (imageFiles) {
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

        $("#photoPreview").html(src ? "<img src='" + src + "'>" : "");
    });
});