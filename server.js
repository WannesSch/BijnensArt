const path = require('path');
const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
const passwordHash = require('password-hash');
const multer = require("multer");
const ImageCrop = require('jimp');
const nodeMailer = require('nodemailer');
const { message } = require('statuses');
const app = express();
const date = new Date();
const currTime = ("0" + date.getDate()).slice(-2) + 
                "-" + ("0" + (date.getMonth() + 1)).slice(-2) + 
                "-" + date.getFullYear() + 
                " | " + date.getHours() + 
                ":" + date.getMinutes() + 
                ":" + date.getSeconds();
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)


var Port = process.env.PORT || 443;

const options = {
    key: fs.readFileSync("SSL/private.key"),
    cert: fs.readFileSync("SSL/certificate.crt"),
    ca: fs.readFileSync("SSL/ca_bundle.crt"),
};

app.use(express.static(path.join(__dirname, "/public/")));
app.use(bodyParser.urlencoded({extended: true}));

class Accounts {
    constructor() {
        this.accountList = []
    }
    ReadJSON() {
        var _JSON = fs.readFileSync('public/Data/Accounts.json');

        var seenNames = {};
        var accountArr = JSON.parse(_JSON);
        accountArr = accountArr.filter(function(currentObject) {
            if (currentObject.userName in seenNames) {
                return false;
            } else {
                seenNames[currentObject.userName] = true;
                return true;
            }
        });
        accountArr.forEach(account => {
            var _account = new Account(account.firstName, account.lastName, account.userName, account.email, account.hashedPassword, account.isAdmin);
            this.accountList.push(_account);
        });

    }
    UpdateJSON() {
        var data = JSON.stringify(this.accountList);
        fs.writeFileSync('public/Data/Accounts.json', data);
    }
    AddAccount(account) {
        this.accountList.push(account);
        this.UpdateJSON();
        console.log(this.accountList)
    }
    FindAccountByUsername(username) {
        var account = null;
        for (let i = 0; i<this.accountList.length; i++) 
            if (this.accountList[i].userName == username) account = this.accountList[i];

        return account;
    }
}
var accounts = new Accounts();
class Controls {
    constructor() {
        this.TempFiles = [];
        this.currentTempFileId = 0;
        this.maxWidth = 1200;
        this.maxHeight = 640;
    }
    GeneratePrivateCode() {return (Math.random() + 1).toString(36).substring(2);}
    CheckLogin(username, password) {
        var account = null;
        for (let i = 0; i<accounts.accountList.length; i++) {
            if (accounts.accountList[i].userName == username) {
                if(passwordHash.verify(password, accounts.accountList[i].hashedPassword)) account = accounts.accountList[i];
                else return ["ERROR", "Ingegeven wachtwoord klopt niet."];
            }   
        }

        if (account == null) return ["ERROR", "Er werd geen account met deze gegevens gevonden."];
        account.currentPrivateCode = this.GeneratePrivateCode();
        setTimeout(() => {account.currentPrivateCode = ""}, 2 * 60 * 60 * 1000);
        return ["SUCCESS", JSON.stringify(account)];
    }
    CheckIfVisitExists(dataArr) {
        var visit = null;
        for (let i = 0; i<this.visitArr.length; i++) 
            if (this.visitArr[i].ip == dataArr[0]) visit = this.visitArr[i];
    
        if (visit == null) {
            var country;
            switch (dataArr[1]) {
                case "BE": country = "België"; break;
                case "NL": country = "Nederland"; break;
                case "FR": country = "Frankrijk"; break;
                case "DE": country = "Duitsland"; break;
                case "SE": country = "Zweden"; break;
                case "UK": country = "Engeland"; break;
                default: ""; break;
            }
            
            visit = new Visit(dataArr[0], 1, country, dataArr[2], dataArr[3], currTime.split("|")[0].replace(" ", ""));
            this.visitArr.push(visit);
            this.UpdateVisitJSON();
            return;
        }
        visit.visits++;
        visit.lastvisit = currTime.split("|")[0].replace(" ", "");
        this.UpdateVisitJSON();
    }
    GetID() {return (Math.random() + 1).toString(36).substring(7);}
    FindTempFileById(id) {
        var file = null;

        for (let i = 0; i<this.TempFiles.length; i++)
            if (this.TempFiles[i].id == id) file = this.TempFiles[i];
            

        return file;
    }
    HandleImage(filename) {
        ImageCrop.read('public/Images/TempFiles/' + filename, (err, file) => {
            if (err) throw err;

            file
            .scaleToFit(controls.maxWidth, controls.maxHeight)
            .write('public/Images/TempFiles/' + filename)

        });
    }
    EmptyTempFilesDir() {
        fs.readdir("public/Images/TempFiles/", (err, files) => {
            if (err) throw err;
            
            for (const file of files) {
                fs.unlink(path.join("public/Images/TempFiles/", file), err => {
                    if (err) throw err;
                });
            }
        });
    }
    HandleVisit(data) {
        let visits = JSON.parse(fs.readFileSync('public/Data/Visitors.json'));
        let valid = true;

        for (let visit of visits) 
            if (visit.ip == data.ip) valid = false;
        
        if (!valid) return;
        let cities = JSON.parse(fs.readFileSync('public/Data/BelgianCities.json'));

        let foundlocation;
        
        for (let location of cities)
            if (location.zip == data.postal) foundlocation = location;

        let date = (new Date().getMonth() + 1) + "-" + new Date().getFullYear();
        visits.push(new Visit(data.ip, data.country_name, foundlocation.state, foundlocation.city, date));

        fs.writeFileSync('public/Data/Visitors.json', JSON.stringify(visits));
    }
    GetVisits() { return JSON.parse(fs.readFileSync('public/Data/Visitors.json')); }
    CheckVisit(ip) {
        let visits = JSON.parse(fs.readFileSync('public/Data/Visitors.json'));
        let exists = false;
        for (let visit of visits) {
            if (visit.ip == ip) exists = true;
        }

        return exists;
    }
}
class Paintings {
    constructor() {
        this.paintingArr = [];
    }
    ReadJSON() {
        var _JSON = fs.readFileSync('public/Data/Paintings.json');
        this.paintingArr = JSON.parse(_JSON);
    }
    UpdateJSON() {
        var data = JSON.stringify(this.paintingArr);
        fs.writeFileSync('public/Data/Paintings.json', data);
        this.ReadJSON();
    }
    FindPaintingByID(id) {
        var painting = null;
        for (let i = 0; i<this.paintingArr.length; i++)
            if (this.paintingArr[i].id == id) painting = this.paintingArr[i];

        return painting;
    }
    GetID() {
        var id = 0;
        var sortedArr = this.paintingArr.sort((a, b) => a.id - b.id);
        for (let i = 0; i<sortedArr.length; i++) {
            if (sortedArr[i].id == id) id++;
        }
        return id;
    }
    AddPainting(arr) {
        var id = this.GetID();
        var painting = new Painting(id, arr[0], arr[1], arr[2], controls.TempFiles.length, arr[3], arr[4]);
        arr[0] = arr[0].replace(/ /g,'');
        var dir = "public/Images/Gallery/" + arr[0] + "-" + id;
        if (!fs.existsSync(dir)){fs.mkdirSync(dir);}

        arr[5].forEach(file => {
            fs.rename('public/Images/TempFiles/' + file.Filename, dir + "/" + file.actualID + ".jpg", function(err) {
                if ( err ) console.log('ERROR: ' + err);
                controls.TempFiles = [];
                controls.EmptyTempFilesDir();
            });
        })
        
        this.paintingArr.push(painting);
        this.UpdateJSON();
        this.ReadJSON();
    }
    RemovePainting(painting) {
        var path = "public/Images/Gallery/" + painting.title.replace(/ /g,'') + "-" + painting.id + "/"
        fs.rmSync(path, { recursive: true, force: true });

        this.paintingArr.splice(this.paintingArr.indexOf(painting), 1);
        this.UpdateJSON();
    }
}
class Painting {
    constructor(id, title, desc, type, paintingamount, price, buystate) {
        this.id = id;
        this.title = title;
        this.description = desc;
        this.type = type;
        this.paintingamount = paintingamount;
        this.price = price;
        this.buystate = buystate;
        this.views = 0;
        this.uploadDate = new Date();
        this.alt = this.type + " van BijnensArt"
    }
}
class Account {
    constructor(firstName, lastName, userName, email, hashedPassword, isAdmin) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
        this.hashedPassword = hashedPassword;
        this.isAdmin = isAdmin;
        this.currentPrivateCode = "";
    }
}
class Visit {
    constructor(_ip, _country, _state, _city, _visitDate) {
        this.ip = _ip;
        this.country = _country;
        this.state = _state;
        this.city = _city;
        this.visitDate = _visitDate;
    }
}

var paintings = new Paintings();
var controls = new Controls();
var tempFileName = "";
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/Images/TempFiles')
    },
    filename: function (req, file, cb) {
        tempFileName = uniqueSuffix + "-" + file.originalname
        cb(null, tempFileName)
    }
})
var upload = multer({ storage: storage })
paintings.ReadJSON();
accounts.ReadJSON();

app.post("/UPLOADImage", upload.array("files"), uploadFiles);

//1200x640
function uploadFiles(req, res) {
    req.files.forEach(file => {
        controls.HandleImage(tempFileName);
        controls.TempFiles.push({"Filename": tempFileName, "id": controls.GetID(), "actualID": null});
    })

    res.send(controls.TempFiles);
    res.end();
}
  
app.post("/:action", function(req, res) {switch(req.param('action')) {
    case "GETPaintings": {
        res.send(paintings.paintingArr);
        res.end();
    } break;
    case "GETVisits": {
        res.send(controls.GetVisits());
        res.end();
    } break;
    case "GETAccounts": {

    } break;
    case "EDITViews": {
        var id = req.body.id;
        var painting = paintings.FindPaintingByID(id);
        painting.views++;
        paintings.UpdateJSON();
    } break;
    case "GETPrivateCode": {
        res.send(controls.GeneratePrivateCode());
        res.end();
    } break;
    case "CheckLogin": {
        var dataArr = req.body.dataArr;
        var callback = controls.CheckLogin(dataArr[0], dataArr[1]);
        var account = accounts.FindAccountByUsername(dataArr[0]);
        res.send(callback);
        res.end();
    } break;
    case "CheckAdmin": {
        var dataArr = req.body.dataArr;
        var account = accounts.FindAccountByUsername(dataArr[0]);
        if (account == null) {res.send("ERROR"); return;}
        if (account.currentPrivateCode != dataArr[1]) {res.send("ERROR"); return;}
        res.send("SUCCESS");
        res.end();
    } break;
    case "ADDvisit": {
        var dataArr = req.body.dataArr;
        if (dataArr == undefined) return;
        controls.CheckIfVisitExists(dataArr);
    } break;
    case "GETTempFiles": {
        res.send(controls.TempFiles);
        res.end();
    } break;
    case "REMOVEImage": {
        var id = req.body.id;
        var file = controls.FindTempFileById(id);
        if (file == null) {res.send("ERROR"); return;}

        try {
            fs.unlinkSync("public/Images/TempFiles/" + file.Filename);
            controls.TempFiles.splice(controls.TempFiles.indexOf(file), 1);
            res.send('SUCCES');
        }
        catch {res.send("ERROR");}

        res.end();
    } break;
    case "ADDPainting": {
        var dataArr = req.body.dataArr;
        paintings.AddPainting(dataArr);
        res.send("SUCCES");
        res.end();
    } break;
    case "EDITPainting": {
        var editedPainting = req.body.painting;
        var painting = paintings.FindPaintingByID(editedPainting.id);
        
        var oldDir = "public/Images/Gallery/" + painting.title.replace(/ /g,'') + "-" + painting.id;
        var newDir = "public/Images/Gallery/" + editedPainting.title.replace(/ /g,'') + "-" + editedPainting.id;

        fs.rename(oldDir, newDir, (err) => {if(err) {throw err;}});

        painting.title = editedPainting.title;
        painting.description = editedPainting.description;
        painting.buystate = editedPainting.buystate;
        painting.price = editedPainting.price;
        painting.type = editedPainting.type;
        painting.uploadDate = new Date();

        for (let i = 0; i<controls.TempFiles.length; i++) {
            file = controls.TempFiles[i];
            file.actualID = painting.paintingamount;
            fs.rename('public/Images/TempFiles/' + file.Filename, newDir + "/" + file.actualID + ".jpg", function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });
            painting.paintingamount++;
        }
        controls.TempFiles = [];
        controls.EmptyTempFilesDir();
        paintings.UpdateJSON();

        res.send('SUCCESS');
        res.end();
    } break;
    case "RESET": {
        controls.TempFiles= [];
        controls.EmptyTempFilesDir();
        res.end();
    } break;
    case "REMOVEPainting": {
        var paintingId = req.body.id;
        var painting = paintings.FindPaintingByID(paintingId);
        paintings.RemovePainting(painting);

        res.send("SUCCESS");
        res.end();
    } break;
    case "REFRESHPaintings": {
        res.send(paintings.paintingArr);
        res.end();
    } break;
    case "REMOVEEditImage": {
        var painting = paintings.FindPaintingByID(req.body.painting.id)
        var imageId = req.body.imageId; 
        try {
            var dir = "public/Images/Gallery/" + painting.title.replace(/ /g,'') + "-" + painting.id + "/";
            fs.unlinkSync(dir + imageId + ".jpg");
            painting.paintingamount -= 1;
            res.send('SUCCES');
            res.end();
        }
        catch {res.send("ERROR"); res.end();}
        res.end();
    } break;
    case "SENDEmail": {
        let mailObject = req.body.mailObject;
        let transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'wannes.schillebeeckx@gmail.com',
                pass: 'bebaaxedpvuaidfi',
            },
        });

        var msgBuilder = "";
        msgBuilder += '<p style="font-weight: bold">Gegevens:<br>';
        msgBuilder += 'Naam: ' + mailObject.name + ' ' + mailObject.prename + '<br>';
        msgBuilder += 'Email: ' + mailObject.email + '<br>';
        msgBuilder += ' Gsm: ' + mailObject.phone + '<br>';
        msgBuilder += '-----------</p>';
        msgBuilder += '<article style="font-family: sans-serif">' + mailObject.message.replace(/\n/g, "<br>")+ '</article>';
        msgBuilder += '<br><br><br><img src="cid:image@bijnensart.be"/>'

        let mailOptions = {
            from: 'Info@bijnensart.be',
            to: 'anja.bijnens@outlook.com',
            cc: mailObject.email,
            subject: mailObject.subject,
            html: msgBuilder,
            attachments: [{
                filename: 'maskersHome.png',
                path: 'public/Images/Main/imageattachment.png',
                cid: 'image@bijnensart.be'
            }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.send('ERROR');
                res.end();
                console.error(error);
            } else {
                res.send('SUCCESS');
                res.end();
            }
        });
    } break;
    case "GetAllExpos": {
        let dirs = fs.readdirSync("./public/Images/Expos");

        let data = [];

        for(let dir of dirs) {
            let files = fs.readdirSync(`./public/Images/Expos/${dir}`);
            data.push({date: dir.split(" ")[0], title: dir, files: files})
        }

        res.send(data);
        res.end();
    } break;
    case "AddUniqueVisit": {
        controls.HandleVisit(req.body.data);
        res.end();
    } break;
    case "CheckIp": {
        res.send(controls.CheckVisit(req.body.ip))
        res.end();
    } break;
}});

https.createServer(options, app).listen(Port, () => {
    console.log('[' + currTime + '] Listening at http://localhost:%s', Port);
});