const express=require('express');
const app=express();
// const cors=require('./utils/middlewares/cors');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg= require('fluent-ffmpeg');
const multer= require('multer');
const bodyParser= require('body-parser');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// const cors = require('cors');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    console.log('setting destination');
    cb(null, './public')
  },
  filename: function (req, file, cb) {
      console.log('recieved file',file);
    cb(null, file.originalname )
  }
});
var upload = multer({ storage }).single('file');
app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());
app.use(bodyParser.json());

// app.use(cors({
//    origin: 'http://localhost:3000',
//     credentials: true

// }));

app.use(function(req, res, next) {
    console.log('inside the cors middleware');
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials','true');
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Cache-Control", "no-cache");
    next();
});

// app.post('/crop', upload.single('file'), function(req , res){
// if(req.file){
//     res.status(200).json({
//             message: 'file uploaded successfully..'
//     })
// } else {
//     res.status(500).json({
//         message: 'some error occured'
//     })
// }
// });
//app.use('/',videoCropRoute);
app.post("/crop",function(req, res) {
  let fileName;
    upload(req, res, err => {
       console.log("Request ---", req.body);
       console.log("Request file ---", req.file);//Here you get file.
       /*Now do where ever you want to do*/
       fileName = req.file.originalname;
       if(!req.file){
         return res.json({status: 500, message: 'ssome error occured'})
       }
       console.log('start', req.body.start);
       console.log('end', req.body.end);
       if(!err){
         const ffmpeg= require('fluent-ffmpeg');
        ffmpeg('public/'+fileName)
        .addOption('-f', null)
        .setStartTime(req.body.start)
        .setDuration(req.body.end-req.body.start).toFormat('mp4')
        .output('./public/videos/output'+Date.now()+'.mp4')
        .on('end', function(err) {   
              if(!err) return res.json({message: 'file converted successfully', status: 200})
        })
        .on('error', function(err){
            console.log('error: ', err);
            res.json({message: 'some error occured', status: 500})
        }).run();
       }
          // return res.json({message: "gg"});
          else 
          return res.json({error: 'could not upload  the file', status: 500})
    })
 });
var port =process.env.PORT || 1234;
app.listen(port,()=>{
    process.stdout.write('server started on port '+port);
});
