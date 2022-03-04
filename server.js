
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const ssql= require("mssql");
const fs= require("fs")
const mime = require("mime")
//const sql = require('./sql');
const session = require('./session');
const bodyParser = require('body-parser');
const path = require('path');
const { parseName } = require('mssql/lib/table');

var db = {
   user: 'shuveen',
    password: '12345678',
    server: 'DESKTOP-QGTSTF2', 
    
    database: 't1',
    dialect: "mssql",
    port :54329,
    trustServerCertificate: true,
    dialectOptions: {
        instanceName:"SQLEXPRESS"
    },
    
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

var pool = new ssql.ConnectionPool(db)
pool.connect(err => {
    if(err) console.log("Error while connecting database :- " + err);
    else
    console.log("Connected to database");
   
});
  

var executeQuery =  (res, query) =>{

    var request = new ssql.Request(pool);
 
    request.query(query, function (err, result) {
        if (err) {
            console.log("Error while querying database :- " + err);
            res.send(err);
        }
         else {
             res.send(result.recordsets);

         }
    });
}
var executeNonQuery =  (res, query) => {

    var request = new ssql.Request(pool);
   
    request.query(query, function (err, result) {
        if (err) {
            console.log("Error while querying database :- " + err);
            res.send(err);
        }
        else {
            res.send('Rows Affected: ' + result.rowsAffected);
        }
    });
}

const app = express();

/* USES */
//app.use(bodyParser.urlencoded({limit:"100mb"}));
app.use(bodyparser.json());
app.use(cors());

app.use(session.passport.initialize());

/* ROUTES */
app.get('/', function(req, res) {
	res.send('Welcome to the API/Back-end!');
});

app.post("/api/signup",(req,res)=>{
    var query = `INSERT INTO [users] (firstname,lastname,username,email,password) VALUES  ('${req.body.firstname}','${req.body.lastname}','${req.body.username}', ' ${req.body.email}','${req.body.password}')`;
      
    executeNonQuery(res, query);
  });


app.post('/login', session.passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
	
	req.token = session.generateToken(req.user);
	res.json({
		token: req.token,
		user: req.user
	});
	// var query=`update users set token='${req.body.token}' where username=@username`;
	// executeQuery(res,query)


});




// For post 
app.post("/api/:userid/post",(req,res)=>{
//    const post_image=(req,res)=>{
    //    let filePath=`/${req.body.post_image}/${Date.now()}_${req.body.name}`;
    //    let buffer =Buffer.from(req.body.post_image,"base64");
    //    fs.writeFileSync(path.join(__dirname,filePath),buffer)
  //  res.write(response.statusCode.toString());

    // const post_image=async(req,res,next)=>{
    //     let matches=req.body.post_image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    //    let response={};
    //     if(matches.length!==5){
    //         return new Error('Invalid input string');
    //      }
    //         res.type=matches[1];
    //        res.data=new Buffer(matches[2],'base64');
    //        let decodeImg=response;
    //        let imageBuffer= decodeImg.data
    //        let type= decodeImg.data;
    //        let extension = mime.extension(type);
    //        let filename  = "image."+ extension;
    //         try{
    //             fs.writeFileSync("./images/"+ filename,imageBuffer,'utf8')
    //             return 
    //         } catch(e){next(e)}
    
    //  }
  
  var query= `insert into [post] (userid, post_title, post_description, post_image) values('${req.params.userid}','${req.body.post_title}','${req.body.post_description}', '${req.body.post_image}')`
  
  executeNonQuery(res, query);

 
    
});
app.post("/api/base64",(req,res)=>{
     let filePath=`/files/${Date.now()}_${req.body.name}`
        let buffer =Buffer.from(req.body.base64.split(',')[1],"base64");
      fs.writeFileSync(path.join(__dirname,filePath),buffer);
      res.send(filePath)
     // var query= `insert into [test] (base64) values ('${buffer}')`
      //executeNonQuery(res,query);
});

  const uploadImage = async (req, res, next) => {
    // to declare some path to store your converted image
    var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
     let  response = {};
     
    if (matches.length !== 3) {
    return new Error('Invalid input string');
    }
     
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    let fileName = "image." + extension;
    try {
    fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
    return res.send({"status":"success"});
    } catch (e) {
    next(e);
    }
    }



app.post("/api/base64image",uploadImage)


app.get("/api/post/all",(req,res)=>{
    var query = "select * from [post]"
    executeQuery(res,query);
});

app.get("/api/post/:userid",(req,res)=>{
    var query=`select * from [post] where userid='${req.params.userid}'`
    executeQuery(res,query)
});

app.put("/api/post/:id",(req,res)=>{
    var query=`update [post] set post_title='${req.body.post_title}',post_description='${req.body.post_description}',post_image='${req.body.post_image}',updated_at='' where post.id='${req.params.id}'  `
        executeQuery(res,query)
       
});

app.delete("/api/post/:id",(req,res)=>{
    var query=`delete from [post] where id='${req.params.id}'`
    executeQuery(res,query);
});


//likes
app.post("/api/post/:username/likes/:post_id",(req,res)=>{
    let username=req.users.username
    var query=`INSERT INTO likes (username, post_id) VALUES('${username}','${req.params.post_id}')`
     
      executeNonQuery(res,query);

});
app.get("/api/post/likes",(req,res)=>{
    var query= "select id from  [likes] "
    executeQuery(res,query)
});
app.get("/api/post/:username/likes/:post_id",(req,res)=>{
    let post_id= parseInt(req.params.post_id)
    var query= `select * from  [likes] where post_id='${post_id}'`
    
    executeQuery(res,query)
})

// app.get("/api/post/likes/:id",(req,res)=>{
//     var query= `select * from  [likes] where id='${req.params.id}'`
//     executeQuery(res,query)
// });

app.delete("/api/:username/likes/:id",(req,res)=>{
    var query=`delete from [likes] where id='${req.params.id}'`
    executeQuery(res,query);
});

// comments

app.post("/api/:username/comments/:post_id",(req,res)=>{
    let username=req.params.username;
    var query= `insert into comments (commenter_name,photo_id,  comments)values('${username}','${req.params.post_id}','${req.body.comments}')`
    executeNonQuery(res,query);

});

app.get("/api/post/comments/:post_id",(req,res)=>{
    let post_id= parseInt(req.params.post_id)

    var query=`select * from [comments] where post_id='${post_id}'`
    executeQuery(res,query)
});

app.put("/api/:username/comments/:id",(req,res)=>{
    var query = `update [comments] set comments='${req.body.comments}' where comments.id='${req.params.id}'`

    executeQuery(res,query);

});

app.delete("/api/:username/comments/:id",(req,res)=>{
    var query=`delete from [comments] where id='${req.params.id}'`
    executeQuery(res,query);
    
});

//following
app.get("/api/:username/following",(req,res)=>{
    var query= 'select * from [follows]'
    executeQuery(res,query);
});
app.post("/api/:username/addfollowing",(req,res)=>{
    var query= `insert into [follows] ()values`;
    executeNonQuery(res,query)
});
app.delete("/api/:username/unfollow/:id",(req,res)=>{
    var query= `delete from [follows] where id='${req.params.id}'`
    executeQuery(res,query);
});

//fallowers
app.get("/api/:username/followers",(req,res)=>{
    var query= "select * from []";
    executeQuery(res,query)
});
app.post("/api/:username/followers",(req,res)=>{
    var query=`insert into []()values`;
    executeNonQuery(res,query);
});

app.delete("/api/:username/followers/:id",(req,res)=>{
    var query=`delete from [] where id = '${req.params.id}'`
    executeQuery(res,query)
});


/* START SERVER */


const PORT =3636;

app.listen(PORT,()=>{
	console.log(`server is connected... ${PORT}`)
});