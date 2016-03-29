'use strict';

// Dependencies
var fs = require('fs');
var mime = require('mime');
var path = require('path');

var seperator = (process.platform == "win32") ? "\\" : "/";
var imageFolderPath = "";
var imageMimeTypes = [
    'image/gif',
    'image/jpeg',
    'image/png'
];

function previewImage(imageSource) {
    $("#photoPreview").html(imageSource ? "<img id='img' src='" + imageSource + "'>" : "");
}

function findTextFile() {
    var image = document.getElementById("img");
    var imagePath = image.getAttribute("src");

    var parseFormat = path.parse(imagePath);
    var imageName = parseFormat.base;

    if (fs.existsSync(imagePath)) {
        tinymce.get("imageDescription").setContent('');
    }   
}

function createImageFolder() {
    if (!fs.existsSync(imageFolderPath)) {
        // create folder
        fs.mkdirSync(imageFolderPath);
    }
}

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

function bindUserImages() {
// if windows environment then they get backslashes else forward slashes
    
    // Works on windows - keep for later    
    // var path = require('path');
    // var nwDir = path.dirname(process.execPath);
    // console.log("This is process.execPath");
    // console.log(nwDir);

    // Get the root of this applications folder    
    // http://stackoverflow.com/questions/10265798/determine-project-root-from-a-running-node-js-application    
    // https://github.com/inxilpro/node-app-root-path    
    var appRoot = require('app-root-path').path;
    var splitDirPath = appRoot.split(path.sep);

    // Get the full path of the image folder outside of this application
    // this is where users will upload their images too.
    imageFolderPath = path.resolve(appRoot, "../../images");

    createImageFolder();

    findAllFiles(imageFolderPath, function (err, files) {
        if (!err) {
            $('#lstLocalPhotos').empty();
            findImageFiles(files, imageFolderPath, function (imageFiles) {
                $.each(imageFiles, function(i, image) {
                    $('#lstLocalPhotos').append($('<option/>', { 
                        value: image.path,
                        text : image.name 
                    }));
                });
            });
        }
    });
}

function openFolderDialog () {
    var inputField = document.querySelector('#folderSelector');
    inputField.addEventListener('change', function () {
        var imageLocation = this.value;
        previewImage(imageLocation);
    }, false);
    inputField.click();
}

function bindSelectFolderClick () {
    var button = document.querySelector('#btnSelectImage');
    button.addEventListener('click', function() {
        openFolderDialog();
    });
}

// Runs when the browser has loaded the page
window.onload = function() {
    bindUserImages();
    bindSelectFolderClick();
};

$(document).ready(function() {
    $("#lstLocalPhotos").change(function() {
        var src = $(this).val();
        previewImage(src);
        findTextFile(src);
    });

    $("#btnImportImage").click(function() {
        var image = document.getElementById("img");
        var imagePath = image.getAttribute("src");
        var parseFormat = path.parse(imagePath);

        var newImagePath = imageFolderPath + seperator + parseFormat.base;

        var source = fs.createReadStream(imagePath);
        var dest = fs.createWriteStream(newImagePath);

        source.pipe(dest);
        source.on('end', function() { alert("File Saved."); });
        source.on('error', function(err) { console.log(err); });

        bindUserImages();        
    });

    // save for adding text to photo    
    // $("#btnPublish").click(function() {
    //     // Get the HTML contents of the currently active editor
    //     var active = tinyMCE.activeEditor.getContent();     
    // });    
});