const express = require("express")
const path = require("path")
const multer = require("multer")
const SharpMulter  =  require("sharp-multer");
const app = express()

const newFilenameFunction = (og_filename, options) => {
const newname =
    og_filename.split(" ").join("_") +
    `${options.useTimestamp ? "-" + Date.now() : ""}` +
    "." +
    options.fileFormat;
return newname;
};

const  storage  =  SharpMulter({
destination:  (req,  file,  callback)  =>  callback(null,  "images"),

imageOptions:  {
    fileFormat:  "webp",
    quality:  80,
    resize:  { width:  500, height:  500, resizeMode:  "contain"  },
    },

filename:newFilenameFunction, 
});

module.exports = multer({storage: storage}).single('image');

