// Keep this just in case I use this module to upload my images
// https://github.com/expressjs/multer
// https://codeforgeek.com/2014/11/file-uploads-using-node-js/

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

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function displayNotification(alertName, message) {
    var div = document.getElementById('notification');
    div.className = alertName;
    div.innerHTML = message;
}

function fileExists(imageFilePath) {
    try {
        fs.accessSync(imageFilePath, fs.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}

function saveTextFile(imageFileSrc) {
    var parseFormat = path.parse(imageFileSrc);
    var imageName = parseFormat.base;
    var textPath = parseFormat.dir + seperator + parseFormat.name + ".txt";
    var status = 'Success';
    var getCurrentContent = tinyMCE.activeEditor.getContent().replaceAll("<p>", "");
    var newContent = getCurrentContent.replaceAll("</p>", "\n").replaceAll("<br />", "\n");
    var result = fs.writeFile(textPath, newContent);
    return (typeof(result) == "undefined") ? status : result;
}

function getTextFile(imagePath) {
    tinyMCE.activeEditor.setContent('');

    var parseFormat = path.parse(imagePath);
    var imageName = parseFormat.base;
    var textPath = parseFormat.dir + seperator + parseFormat.name + ".txt";

    if (fileExists(textPath)) {
        fs.readFile(textPath, 'utf8', function(err, data) {
            if (err) displayNotification('alert alert-danger', err);
            var getCurrentContent = data.replaceAll("\n", "<br />");
            tinyMCE.activeEditor.setContent(getCurrentContent);
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
    if (imageSource == "") {
        displayPhotoDataArea(false);
        return;
    }
    
    $("#photoPreview").html(imageSource ? "<img id='img' src='" + imageSource + "' class='img-responsive img-rounded center-block'>" : ""); //class='drop-shadow'
}

function createImageFolder() {
    if (!fileExists(imageFolderPath)) {
        fs.mkdirSync(imageFolderPath);
    }
}

function openFolderDialog() {
    var inputField = document.querySelector('#folderSelector');
    inputField.addEventListener('change', function() {
        var imageLocation = this.value;
        previewImage(imageLocation);
        document.getElementById('btnAdd').style.display = 'inline';
        document.getElementById('btnUpdate').style.display = 'none';
        displayPhotoDataArea(true);
    });
    inputField.click();
}

function bindSelectFolderClick () {
    var button = document.querySelector('#btnSelectImage');
    button.addEventListener('click', function() {
        displayNotification('', '');
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
    // Get the root of this applications folder    
    // http://stackoverflow.com/questions/10265798/determine-project-root-from-a-running-node-js-application    
    // https://github.com/inxilpro/node-app-root-path
    var nwDir = (process.platform == "win32")
        ? require('path').dirname(process.execPath) //win
        : require('app-root-path').path; // local

    // Get the full path of the image folder outside of this application
    // this is where users will upload their images too.
    var splitDirPath = nwDir.split(path.sep);
    imageFolderPath = path.resolve(nwDir, ".." + seperator + "images");

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
        displayNotification('', '');
        previewImage(src);
        getTextFile(src);
        document.getElementById('btnAdd').style.display = 'none';
        document.getElementById('btnUpdate').style.display = 'inline';
        displayPhotoDataArea(true);
    });

    $("#btnUpdate").click(function() {
        var image = document.getElementById("img");
        var originalFileSrc = image.getAttribute("src");

        var msg = saveTextFile(originalFileSrc);
        if (msg == "Success") {
            displayPhotoDataArea(false);
            bindUserImages();
            displayNotification('alert alert-success', 'Saved successfully!');
        } else {
            displayNotification('alert alert-danger', msg);
        }
    });

    $("#btnAdd").click(function() {
        /* Test script 
        var parseFormat = path.parse('/hello/world/2016ImgName.jpg');
        var checkForSortOrder = parseFormat.name.substring(0, 3);

        var sortOrder = "";
        for (var i = 0; i < checkForSortOrder.length; i++){
            if (isNaN(checkForSortOrder.substring(i, i + 1))) {
                sortOrder += checkForSortOrder.substring(i, i + 1);
            }
        }
        return;
        */
        // get last sort order
        var sortOrder = "";
        var photoOptions = $("#lstLocalPhotos > option");
        if (photoOptions.length > 0) {
            var option = photoOptions[photoOptions.length - 1];
            var optionSortNumber = option.innerHTML.substring (0, 2);
            var newIndex = Number(optionSortNumber) + 101;
            var newIndexStr = '' + newIndex;
            sortOrder = newIndexStr.substring(1, 3); // get the last two characters
        } else {
            sortOrder = "01";
        }

        //displayPhotoDataArea(true);
        var image = document.getElementById("img");
        var originalFileSrc = image.getAttribute("src");

        if (originalFileSrc.length == 0) {
            displayNotification('alert alert-info', 'No image available. Please browse to a valid image.');
            return;
        }

        var parseFormat = path.parse(originalFileSrc);
        var newImageSrc = imageFolderPath + seperator + parseFormat.base;

        // Check if the photo already exists in my image folder 
        // if not then create & save text to file
        // Possibly allow user to rename image
        if (fileExists(newImageSrc)) {
            displayNotification('alert alert-warning', 'The image you are trying to save already exists.');
            return;
        }

        // Copy file to local application drive        
        var source = fs.createReadStream(originalFileSrc);
        var dest = fs.createWriteStream(newImageSrc);
        source.pipe(dest);

        var errorMessage = '';
        source.on('end', function() { });
        source.on('error', function(err) { errorMessage = err; });

        var isSaved = fileExists(newImageSrc);
        if (isSaved) {
            var msg = saveTextFile(newImageSrc);
            if (msg == "Success") {
                // rename file with sort order number
                var newImageWithSortNumber = imageFolderPath + seperator + sortOrder + "_" + parseFormat.base;
                fs.rename(newImageSrc, newImageWithSortNumber, function (err) {
                    if (err)
                    {
                        displayNotification('alert alert-warning', 'Could not apply default sort number.');
                        console.log(err);
                        return;
                    } else {
                        var oldTextFile = imageFolderPath + seperator + parseFormat.name + '.txt';
                        var newTextFileWithSortOrder = imageFolderPath + seperator + sortOrder + "_" + parseFormat.name + ".txt";
                        fs.rename(oldTextFile, newTextFileWithSortOrder, function(err) {
                            if (err) {
                                displayNotification('alert alert-warning', 'Could not apply default sort number.');
                                console.log(err);
                                return;
                            }
                            else {
                                //console.log('The file has been re-named to: ' + newImageWithSortNumber);
                                displayNotification('alert alert-success', 'Image saved!');
                            }
                        });
                    }
                });
                
            } else {
                // rollback and remove image
                fs.unlinkSync(newImageSrc);
                displayNotification('alert alert-danger', msg);
            }
        } else {
            displayNotification('alert alert-danger', errorMessage);
        }
        displayPhotoDataArea(false);
        bindUserImages();
    });

    $("#btnCancel").click(function() {
        displayNotification('', '');
        displayPhotoDataArea(false);
    });   
});