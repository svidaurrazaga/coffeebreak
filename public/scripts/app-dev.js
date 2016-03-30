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



function fileExists(imageFilePath) {
    if (fs.existsSync(imageFilePath)) {
        return true;
    }
    return false;
}

//var content = tinyMCE.activeEditor.getContent();

function findTextFile() {
    var image = document.getElementById("img");
    var imagePath = image.getAttribute("src");

    var parseFormat = path.parse(imagePath);
    var imageName = parseFormat.base;
    var textPath = parseFormat.dir + seperator + parseFormat.name + ".txt";

    if (fileExists(imagePath) & !fileExists(textPath)) {
        tinymce.get("imageDescription").setContent('');
        fs.writeFile(textPath, "", function(err) {
            if(err) {
                return console.log(err);
            }
            alert('The file was saved.');
        }); 
    }
}

function displayPhotoDataArea(showDivContent) {
    if (showDivContent) {
        document.getElementById('divSaveButtons').style.display = "block";
        document.getElementById('photoContent').style.display = "block";
    }
    else {
        $("#photoPreview").html('');
        tinymce.get("imageDescription").setContent('');
        document.getElementById('divSaveButtons').style.display = "none";
        document.getElementById('photoContent').style.display = "none";
    }
}

function previewImage(imageSource) {
    if (imageSource == "") displayPhotoDataArea(false);
    $("#photoPreview").html(imageSource ? "<img id='img' src='" + imageSource + "' class='drop-shadow'>" : "");
}

function createImageFolder() {
    if (!fileExists(imageFolderPath)) {
        fs.mkdirSync(imageFolderPath);
    }
}

function openFolderDialog() {
    displayPhotoDataArea(true);
    var inputField = document.querySelector('#folderSelector');
    inputField.addEventListener('change', function() {
        var imageLocation = this.value;
        previewImage(imageLocation);
    });
    inputField.click();
}

function bindSelectFolderClick () {
    var button = document.querySelector('#btnSelectImage');
    button.addEventListener('click', function() {
        openFolderDialog();
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

function findAllFiles (folderPath, cb) {
    fs.readdir(folderPath, function (err, files) {
        if (err) { return cb(err, null); }
        cb(null, files);
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

// Runs when the browser has loaded the page
window.onload = function() {
    bindSelectFolderClick();
    
    bindUserImages();
    
    displayPhotoDataArea(false);
};

$(document).ready(function() {
    $("#lstLocalPhotos").change(function() {
        var src = $(this).val();
        previewImage(src);
        findTextFile(src);
        displayPhotoDataArea(true);
    });

    $("#btnImportImage").click(function() {
        displayPhotoDataArea(true);
        
        var image = document.getElementById("img");
        var imagePath = image.getAttribute("src");
        var parseFormat = path.parse(imagePath);

        var newImagePath = imageFolderPath + seperator + parseFormat.base;

        // Check if the photo already exists in my image folder 
        // if not then create & save text to file
        // Possibly allow user to rename image
        var source = fs.createReadStream(imagePath);
        var dest = fs.createWriteStream(newImagePath);

        source.pipe(dest);
        source.on('end', function() { alert("File Saved."); });
        source.on('error', function(err) { console.log(err); });       

        bindUserImages();        
    });

    $("#btnCancelImport").click(function() {
        displayPhotoDataArea(false);
    });    

    // save for adding text to photo    
    $("#btnPublish").click(function() {
        alert("Publish Button clicked");    
    });    
});


// Keep this just in case I use this module to upload my images
// https://github.com/expressjs/multer
// https://codeforgeek.com/2014/11/file-uploads-using-node-js/
//