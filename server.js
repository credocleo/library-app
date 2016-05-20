var http = require('http');
var express = require('express');
var app = express();
var mysql=require('mysql');
var path= require('path');
var bodyParser= require('body-parser');
var http= require('http');
var cookieParser=require('cookie-parser');
var session = require('express-session');



var port= 1234;

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret:'12345qwerty'}));

var connection = mysql.createConnection({
	host:'localhost',
	user: 'root',
	database: 'bookkeeper'
});

connection.connect();

app.get('/', function(req,res){
	//res.render('login.jade');
	if(req.session.username != null){
			var context = req.session.errMsg;
			req.session.errMsg = null;
			/*res.render('index.jade', {
				context: context 
			}); */
			res.redirect('/home');
	}else{
		console.log('else');
		res.render('login.jade');
	} 
});

app.get('/setSession', function(req,res){
	req.session.samplesession = 'Sample Session';
	res.end('sessionSet');
});

app.get('/resultSession', function(req,res){
	res.end(req.session.samplesession);
});

app.get("/search", function(req,res){ //search by individual
	var search_data={title: '%'+req.query.book_title+'%', //req.query for get
					author: '%'+req.query.book_author+'%'
					};
	connection.query("SELECT * from book WHERE title LIKE ? AND author LIKE ? ",[search_data.title, search_data.author], function(err,rows,fields){
		if(!err){
			console.log('success search');
			var data_result= rows;
			console.log(rows);
			res.render('index.jade' , {
				books: data_result  //books should be used here since its the array u indicated in the jade for each loop
			});
		}else{
			console.log(err);
		}
	});
});

app.get('/addBook', function(req,res){
	res.render('add_book.jade');
});

app.post("/insert", function(req,res,next){ //insert an item
	var post = {title: req.body.book_title,  //req.body for post
				author: req.body.book_author 
				}; 
	console.log(post);
	var insert_query = connection.query('INSERT INTO book SET ?', post, function(err,rows,fields){
		if(!err){
			var all_data = rows;
			console.log('insert success!');
			
		}else{
			console.log(err);
		} 
	}); 
	res.redirect("/home");
});

app.get('/editBook', function(req,res){
	res.render('edit_book.jade', {
		book_id: req.query.book_id,
		title: req.query.book_title,
		author: req.query.book_author
	});

});

app.post("/update", function(req,res,next){ //should be app.post, query works
	var update_data = {
		title: req.body.book_title,
		author: req.body.book_author,
		book_id: req.body.book_id
	};
	//var update_params=[update_data.title, update_data.author];
	connection.query('UPDATE book SET title= ? , author=? WHERE book_id= ? ',[update_data.title, update_data.author,update_data.book_id],function(err,rows,fields){
		if(!err){
			console.log(update_data);
			console.log("update success!");
		}else{
			console.log(err);
		} 
	});
	console.lo
	res.redirect("/home");
});


app.post("/delete", function(req,res,next){ //should be app.delete, query works
	var delete_data = {
		book_id: req.body.book_id
	};
	connection.query('DELETE from book WHERE book_id=?',[delete_data.book_id], function(err,rows,fields){
		if(!err){
			console.log("delete success!");
		}else{
			console.log(err);
		}
	});
	res.redirect("/home");
});

app.get("/home",function(req,res){ //search all
	/*var data;
	var book_idnum;
	var book_title;
	var book_author;
	var book_published;
	*/  
	//this is not needed since in data JSON object below..you can make identifier, no need to declare
	connection.query('SELECT book_id,title,author from book', function(err,rows,fields){
		if(!err){
			var data_loop = rows;
			/*data={
				book_idnum : rows[0].book_id,
				book_title : rows[0].title,
				book_author : rows[0].author,
				book_published : rows[0].date_published,
			}; */
			//console.log(data_loop.length);
			res.render('index.jade' , {
				books: data_loop
			});
			
			//res.end(JSON.stringify(data));
		}else{
			console.log(err);
		}
	});
	
});

app.post('/login',function(req,res, next){

	var data = {
		user_name: req.body.username,
		user_password: req.body.password
	}; 
	
	connection.query('SELECT * from user WHERE username= ? AND password= ?',[data.user_name, data.user_password] ,function(err,rows,fields){
		if(err){
			console.log(err);
		}else{
			if(rows.length>0){
				req.session.username = data.user_name;
				console.log("login success!");
				res.redirect("/home");
				
			}else{
				
				req.session.errMsg = 'wrong credentials';
				console.log(req.session.errMsg);
				res.redirect('/');
				console.log('here');
				
			}
		}
	});
});

app.get('/logout', function(req,res){
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}else{
			res.redirect('/');
		}
	});
});

app.listen(port, function(){
	console.log("Go to localhoseeet:" + port);
});

