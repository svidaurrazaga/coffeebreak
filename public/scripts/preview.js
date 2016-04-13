'use strict';

// Dependencies
var fs = require('fs');
var mime = require('mime');
var path = require('path');

var userImages = new Array()
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
    if (fs.existsSync(imageFilePath)) {
        return true;
    }
    return false;
}

function getTextFile(imagePath) {
    var parseFormat = path.parse(imagePath);
    var imageName = parseFormat.base;
    var textPath = parseFormat.dir + seperator + parseFormat.name + ".txt";

    var fileContent = "";    
    if (fileExists(textPath)) {
        var content = fs.readFileSync(textPath, 'utf8');
        fileContent = content;
    }
    return fileContent;
}

function findImageFiles (files, folderPath) {
    var imageFiles = [];
    files.forEach(function (file) {
        var fullFilePath = path.resolve(folderPath,file);
        var extension = mime.lookup(fullFilePath);
        if (imageMimeTypes.indexOf(extension) !== -1) {
            imageFiles.push({name: file, path: fullFilePath});
        }
    });
    return imageFiles;
}

function findAllFiles (folderPath) {
    return fs.readdirSync(folderPath);
}

function getUserImages() {
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

    var files = findAllFiles(imageFolderPath);
    if (files.length > 0) {
        var imageFiles = findImageFiles(files, imageFolderPath);
        if (imageFiles.length > 0) {
            $.each(imageFiles, function(i, image) {
                var description = getTextFile(image.path);
                userImages[i] = new Array((i + 1), description, image.path);
            });
        }
    }
}

function bindUserImages() {
    var table = document.getElementById('grid');
    var body = document.createElement('tbody');
    for (var i = 0; i < userImages.length; i++) {
        var tr = document.createElement('tr');
        tr.setAttribute('id', i);
        var td = document.createElement('td');
        for (var j = -1; j < userImages[i].length; j++) {
            td = document.createElement('td');
            if (j == -1) {
                var blank = document.createElement('br');
                var upLink = "<a href='#' class='move up'><span class='glyphicon glyphicon-menu-up'></span></a>";
                var downLink = "<a href='#' class='move down'><span class='glyphicon glyphicon-menu-down'></span></a>";

                var upArrow = document.createElement('span');
                upArrow.innerHTML = upLink;
                var downArrow = document.createElement('span');
                downArrow.innerHTML = downLink;
                
                var div = document.createElement('div');
                div.setAttribute('class', 'text-center');
                div.appendChild(upArrow);
                div.appendChild(blank);
                div.appendChild(downArrow);
                td.appendChild(div);
            }
            if (j == 0 || j == 1) { // add sort # & description
                td.appendChild(document.createTextNode(userImages[i][j]));
            }
            if (j == 2) { // add image
                var img = document.createElement('img');
                img.src = userImages[i][j];
                img.setAttribute('class', 'img-thumbnail');

                var div = document.createElement('div');
                div.appendChild(img);
                
                var element = div.firstChild;
                td.appendChild(element);
            }
            tr.appendChild(td)
        }
        body.appendChild(tr);
    }
    table.appendChild(body);
}

// // Runs when the browser has loaded the page
// window.onload = function() {
    
// };

$(window).load(function() {
    $('#loading').show();

    getUserImages();
    bindUserImages();

    $('#loading').hide();
    // Initialise the second table specifying a dragClass and an onDrop function that will display an alert

    $("#grid").tableDnD({
        // onDrop: function(table, row) {
        //     var rows = table.tBodies[0].rows;
        //     for (var i = 0; i < rows.length; i++) {
        //         var newId = Number(rows[i].rowIndex);
        //         rows[i].id = newId;
        //         rows[i].cells[1].innerHTML = newId;
        //     }
	    // }
    });

    $('#grid a.move').click(function() {
        //$(this).closest("tr").next().after($(this).closest("tr"));

        var row = $(this).closest('tr');
        if ($(this).hasClass('up'))
            row.prev().before(row);
        else
            row.next().after(row);

        // var table = $('#grid');        
        // var rows = table.tBodies[0].rows;
        // for (var i = 0; i < rows.length; i++) {
        //     var newId = Number(rows[i].rowIndex);
        //     rows[i].id = newId;
        //     rows[i].cells[1].innerHTML = newId;
        // }
    });    
});

$(document).ready(function() {
    $('#btnPublish').click(function() {
        alert('Button click');
    });
});