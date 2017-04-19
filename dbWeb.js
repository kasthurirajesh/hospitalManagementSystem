var express = require("express");
var mysql = require('mysql');
var connectionFrom = require('./dbConn');
var bodyParser = require('body-parser');
var async  = require('async');
var _ =require('underscore');
var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//appointment
app.post("/appointment",function(req,res){

    bag={};

    bag.userid = req.body.userid,
    bag.date = req.body.date,
    bag.message = req.body.message;
    bag.diseasecategory = req.body.diseasecategory;

    async.series([
        _checkAvailability.bind(null, bag),
        _reduceTheAppointmentNumber.bind(null,bag),
        _newAppointmentNumber.bind(null,bag),
         _insertIntoDatabase.bind(null,bag)
    ],function (err) {
        if(err){
            throw  "some where mistake"
        }else{
            res.end(JSON.stringify(bag));
        }
    })
})
function _checkAvailability(bag,next){
    connectionFrom.connVar.query('select * from appointment where disease ='  + connectionFrom.connVar.escape(bag.diseasecategory) +' AND noOfAppointments >= 1 AND date ='
        +connectionFrom.connVar.escape(bag.date) + ' LIMIT 1',
        function(err, rows, fields) {
            if (!err)
            {
                if(rows.length > 0) {
                    bag.result = rows;
                    bag.status = "available";
                    return next();
                }else{
                    bag.status = "unavailable";
                    return next();
                }



            }
            else{
                connectionFrom.connVar.end();
                console.log('Error while performing Query.');
                return;
            }
        });
}
function _reduceTheAppointmentNumber(bag,next){

    if(bag.status == "available") {
        var dec = bag.result[0].noOfAppointments - 1;
        newValue = {
            noOfAppointments: dec
        };

        condition = {disease: bag.diseasecategory, date: bag.date};

        connectionFrom.connVar.query('UPDATE appointment SET ? WHERE disease = ?  AND date = ?',
            [newValue, bag.diseasecategory, bag.date], function (err, result) {
                if (!err) {

                    bag.updateStatus = "success";
                    return next();
                }
                else {
                    connectionFrom.connVar.end();
                    console.log('Error while performing Query in update.');
                }
            });
    }else{
        return next();
    }
};
function _newAppointmentNumber(bag,next){

    if(bag.status == "available") {

        connectionFrom.connVar.query('    SELECT max(appointmentNo) as number FROM appointmentbooking where disease = ' + connectionFrom.connVar.escape(bag.diseasecategory)
            + ' AND  date = ' + connectionFrom.connVar.escape(bag.date) + ' LIMIT 1',
            function (err, rows, fields) {
                if (!err) {
                    console.log(rows, "rows")
                    if (rows[0].number != null) {
                        bag.number = rows[0].number + 1;
                        return next()
                    } else {
                        bag.number = 1;
                        return next()
                    }
                }
                else {
                    connectionFrom.connVar.end();
                    console.log('Error while performing Query.');
                    return;
                }
            });
    }else{
        return next();
    }
}
function _insertIntoDatabase(bag,next){

    if(bag.status == "available") {
        newValue = {
            userid: bag.userid,
            disease: bag.diseasecategory,
            message: bag.message,
            date: bag.date,
            appointmentNo: bag.number
        };

        console.log(newValue , "newValuenewValuenewValue")
        connectionFrom.connVar.query('INSERT INTO appointmentbooking SET ? ', newValue, function (err, result) {
            if (!err) {
                /*res.send(' Welcome to our website .......');*/
                console.log(' Credentials added to database');
                return next();
            }
            else {
                //res.end(JSON.stringify(result));
                connectionFrom.connVar.end();
                console.log('Error while performing Querynhhhhhhhhhhhhhhhhhhhhhhhhhhh.');
            }
        });
    }else{
        return next();
    }

};

//generate bill
app.post("/generateBill",function(req,res){

    bag={};

    bag.userid = req.body.userid
    async.series([
        _fetchTheInfo.bind(null, bag),
        _convertdateformat.bind(null,bag)

    ],function (err) {
        if(err){
            throw  "some where mistake"
        }else{
            res.end(JSON.stringify(bag));
        }
    })
})
function _fetchTheInfo(bag,next){

        connectionFrom.connVar.query('select * from allocateroom where patientId = '+ connectionFrom.connVar.escape(bag.userid),
            function (err, rows,fields) {
            if (!err) {
                /*res.send(' Welcome to our website .......');*/
                console.log(rows,"rows");
                console.log(rows[0].date, "    rows[0].date")
                    bag.date = rows[0].date;
                console.log(bag.date , "bag.date")
                return next();
            }
            else {
                //res.end(JSON.stringify(result));
                connectionFrom.connVar.end();
                console.log('Error while performing Querynhhhhhhhhhhhhhhhhhhhhhhhhhhh.');
            }
        });

};
function _convertdateformat(bag,next) {

    //') as year,month( '+ bag.date +') as month ,day(  '+ bag.date +') as day ',
    console.log(bag.date ,"bag.date")
    connectionFrom.connVar.query('SELECT YEAR(' + bag.date +') as y' ,

        function (err, rows,fields) {
            if (!err) {
                /*res.send(' Welcome to our website .......');*/
                console.log(rows,"rows");

                return next();
            }
            else {
                //res.end(JSON.stringify(result));
                connectionFrom.connVar.end();
                console.log('Error while performing fgfgfgfgfgg88888888888.');
            }
        });

}
function _dateSubtract(bag,next){
    currentDate=[ new Date().getFullYear(), '0'+(new Date().getMonth() +1), (new Date().getDate()) ].join("-");
    console.log(currentDate);
    connectionFrom.connVar.query('SELECT DATEDIFF('+ bag.date+' , '+  currentDate + ' ) AS DiffDate',  function(err,rows , fields ){
        if (!err){
            console.log(rows);
            res.end(JSON.stringify(result));
            return next();
        }
        else{
            connectionFrom.connVar.end();
            console.log('Error while performing Query.');
        }

    });

}




app.post("/getAppointmentInfo" , function (req, res) {

    connectionFrom.connVar.query('select * from appointmentbooking where userid = ' +connectionFrom.connVar.escape( req.body.userId ) ,
        function (err, rows, fields) {
            if(!err)
            {
                console.log(rows);
                res.end(JSON.stringify(rows));

            }else {
                console.log("error while executing query");
            }

        })

})

app.get("/getDoctorInfo" , function (req, res) {

    connectionFrom.connVar.query('select * from doctor',
        function (err, rows, fields) {
            if(!err)
            {
                console.log(rows);
                res.end(JSON.stringify(rows));

            }else {
                console.log("error while executing query");
            }

        })

})
//doctor
app.post('/diagnosis', function (req, res) {
    input = {
        patientId:req.body.patientId,
        testName:req.body.testName,
    };

    console.log(input);
    connectionFrom.connVar.query('INSERT INTO diagnosis SET ?', [input], function(err,result ){
        if (!err){
            console.log(' Credentials added to database');
            result.status="success"
            res.end(JSON.stringify(result));
        }
        else{
            connectionFrom.connVar.end();
            console.log('Error while performing Query.');
        }
    });
})

app.post('/checkPreviousUserId', function (req, res) {

    connectionFrom.connVar.query('select * from registration where userId = '+connectionFrom.connVar.escape(req.body.userId),
        function(err,rows, fields){
        if (!err){
            if(rows.length > 0){
                data = {"found" :"success"}
                res.end(JSON.stringify(data))
            }else{
                data = {"found" :"unSuccess"}
                res.end(JSON.stringify(data))
            }
        }
        else{
            result.status="unSuccessfull"
            res.end(JSON.stringify(result));
            connectionFrom.connVar.end();
            console.log('Error while performing Query.');
        }
    });
})


app.post('/registration', function (req, res) {
    response = {
        userId:req.body.userId,
        password:req.body.pass,
        name:req.body.name,
        mobileNo:req.body.mobileNo,
        gender:req.body.gender,
        emailAddress:req.body.emailAddress,
        address:req.body.address
    };
    
    connectionFrom.connVar.query('INSERT INTO registration SET ?', response, function(err,result){
        if (!err){
            /*res.send(' Welcome to our website .......');*/
            console.log(' Credentials added to database');
            result.status="successfull"
            result.userId=req.body.userId;
            res.end(JSON.stringify(result));
        }
        else{
            result.status="unSuccessfull"
            res.end(JSON.stringify(result));
            connectionFrom.connVar.end();
            console.log('Error while performing Query.');
        }
    });
})

app.post("/loginVerify",function(req,res){
            userId= req.body.userId,
                password=req.body.password ,
                tableName = req.body.tableName

        console.log(tableName);

        /* in where clause if u want to use and clause then it sholud be AND only other wise it wonot work*/
        connectionFrom.connVar.query('SELECT * from '+tableName +' where userId = ' + connectionFrom.connVar.escape(userId)
            + ' AND password = ' + connectionFrom.connVar.escape(password) ,
                function(err, rows, fields) {
                if (!err){

                    if(rows.length >0)
                    {
                        rows[0].authentication="success";
                        res.end(JSON.stringify(rows[0]));
                        console.log("i am insdide")
                    }else
                    {
                        var data = {"authentication":"fail"}; rows[0] = data ;
                        res.end(JSON.stringify(rows[0]));
                    }


                    for (var i = 0; i < rows.length; i++) {
                        console.log(rows[i].sid);
                    };
                }
                else{
                    connectionFrom.connVar.end();
                    console.log('Error while performing Query.');
                }
            });
    });

app.post("/userInfo",function(req,res){
        userId= req.body.userId,
        tableName = req.body.tableName
    console.log("i got request")
    connectionFrom.connVar.query('SELECT * from '+tableName +' where userId = ' + connectionFrom.connVar.escape(userId) ,
        function(err, rows, fields) {
            if (!err){
                console.log()
                    res.end(JSON.stringify(rows[0]));
            }
            else{
                connectionFrom.connVar.end();
                console.log('Error while performing Query.');
            }
        });

});

app.post('/editprofile', function (req, res) {

    /*update users set password=? , name=? , email=? , phone_no=? where sid=?*/

    console.log("i got a request")
    response = {
        name:req.body.name,
        password:req.body.password,
        emailAddress:req.body.emailAddress,
        mobileNo:req.body.mobileNo,
        address:req.body.address
    };
    condition = {userId:req.body.userId};

    console.log(response)
    console.log(condition)

    connectionFrom.connVar.query('UPDATE  registration SET ? where ?',
        [response,condition] ,function(err,result){
            if (!err){
                console.log('Changed ' + result.changedRows + ' rows');
                console.log(' Credentials updated to database');
                result.status="12";
                res.end(JSON.stringify(result.changed));
            }
            else{
                result.status="unUhanged";
                res.end(JSON.stringify(result.changed));
                connectionFrom.connVar.end();
                console.log('Error while performing Query in update.');
            }
        });



});

app.post('/addDoctor', function (req, res) {
    response = {
        userId:req.body.userId,
        password:req.body.pass,
        name:req.body.name,
        phoneNo:req.body.phoneNo,
        gender:req.body.gender,
        salary:req.body.salary,
        specialist:req.body.specialist,
        emailAddress:req.body.emailAddress,
        address:req.body.address
    };
    connectionFrom.connVar.query('INSERT INTO doctor SET ?', response, function(err,result){
        if (!err){
            /*res.send(' Welcome to our website .......');*/
            console.log(' Credentials added to database');
            result.stats="success";
            res.end(JSON.stringify(result));
        }
        else{
            connectionFrom.connVar.end();
            result.stats="unsuccess";
            res.end(JSON.stringify(result));
            console.log('Error while performing Query.');
        }
    });
    console.log(response);
    
})
app.delete('/deleteDoctor/:doctorId', function (req, res) {

    var id = req.params.doctorId;
    console.log(id)

    connectionFrom.connVar.query( 'delete from doctor where userId='+connectionFrom.connVar.escape(id),
        function (err, rows, fields) {
            if(!err)
            {
                console.log(rows);
                console.log("successfully Deleted")
                res.end(JSON.stringify(rows));

            }else {
                console.log("error while executing query");
            }

        })
})

//nurse
app.post('/addNurse', function (req, res) {
    response = {
        userId:req.body.userId,
        password:req.body.pass,
        name:req.body.name,
        phoneNo:req.body.phoneNo,
        gender:req.body.gender,
        salary:req.body.salary,
        emailAddress:req.body.emailAddress,
        address:req.body.address
    };
    connectionFrom.connVar.query('INSERT INTO nurse SET ?', response, function(err,reslut){
        if (!err){
            console.log(' Credentials added to database');
            res.end(JSON.stringify(reslut));

        }
        else{
            connectionFrom.connVar.end();
            console.log('Error while performing Query.');
        }
    });
    console.log(response);
})
app.delete('/deleteNurse/:nurseId', function (req, res) {

    var id = req.params.nurseId;
    console.log(id)

    connectionFrom.connVar.query( 'delete from nurse where userId='+connectionFrom.connVar.escape(id),
        function (err, rows, fields) {
            if(!err)
            {
                console.log(rows);
                console.log("successfully Deleted")
                res.end(JSON.stringify(rows));

            }else {
                console.log("error while executing query");
            }

        })
})

//laboratory Technician
app.post('/addLaboratoryTechnician', function (req, res) {
    response = {
        userId:req.body.userId,
        password:req.body.pass,
        name:req.body.name,
        phoneNo:req.body.phoneNo,
        gender:req.body.gender,
        salary:req.body.salary,
        emailAddress:req.body.emailAddress,
        address:req.body.address
    };
    connectionFrom.connVar.query('INSERT INTO laboratorytechnician SET ?', response, function(err,reslut){
        if (!err){
            console.log(' Credentials added to database');
            res.end(JSON.stringify(reslut));

        }
        else{
            connectionFrom.connVar.end();
            console.log('Error while performing Query.');
        }
    });
    console.log(response);
})
app.delete('/deleteLaboratoryTechnician/:doctorId', function (req, res) {

    var id = req.params.doctorId;
    console.log(id)

    connectionFrom.connVar.query( 'delete from laboratorytechnician where userId='+connectionFrom.connVar.escape(id),
        function (err, rows, fields) {
            if(!err)
            {
                console.log(rows);
                console.log("successfully Deleted")
                res.end(JSON.stringify(rows));

            }else {
                console.log("error while executing query");
            }

        })
})


//medicine
app.post('/addMedicine', function (req, res) {
    input = {
        medicineId:req.body.batchNo,
        name:req.body.name,
        itemCost:req.body.itemCost,
        quantity:req.body.quantity,
        expireDate:req.body.expireDate   //yyy-dd-mm
    };

    console.log(input);
    connectionFrom.connVar.query('INSERT INTO medical SET ?', input, function(err,result ){
        if (!err){
            console.log(' Credentials added to database');
            result.stats="success"
            res.end(JSON.stringify(result));

        }
        else{
            connectionFrom.connVar.end();
            console.log('Error while performing Query.');
        }
    });
})


app.post("/sellmedicine",function(req,res){

    bag={};

    bag.patientId = req.body.patientId,
        bag.name=req.body.name,
        bag.quantity=req.body.quantity,

        console.log(bag);
    async.series([
        _checkMedsAvailability.bind(null, bag),
        _reduceQuantity.bind(null,bag),
        _insertIntoMedsDatabase.bind(null,bag)
    ],function (err) {
        if(err){
            throw  "some where mistake"
        }else{
            res.end(JSON.stringify(bag));
        }
    })
})


function _checkMedsAvailability(bag,next){

    connectionFrom.connVar.query('select * from medical  WHERE name = ?  AND quantity >= ?',
        [bag.name, bag.quantity] ,function(err,rows, fields){
            if (!err){
                console.log(rows);
                bag.result = rows;
                if(rows.length > 0 ){
                    bag.status = "available";
                    bag.cost = bag.quantity * rows[0].itemCost;
                    return next();
                }
                else{
                    bag.status = "unavailable";
                    return next();
                }

            }
            else{
                connectionFrom.connVar.end();
                console.log('Error while performing Query in update.');
            }
        });

};

function _reduceQuantity(bag,next){

    if ( bag.status === "available") {

        newValue = {
            quantity:bag.result[0].quantity - bag.quantity
        };

        condition = {name:bag.name};

        connectionFrom.connVar.query('UPDATE medical SET ? WHERE ? ',
            [newValue, condition] ,function(err,result){
                if (!err){
                    console.log('Changed ' + result.changedRows + ' rows');
                    console.log(' Credentials updated to database');
                    return next();

                }
                else{
                    connectionFrom.connVar.end();
                    console.log('Error while performing Query in update.');
                }
            });
    }
    else{
        return next();
    }
};

function _insertIntoMedsDatabase(bag,next){
    if ( bag.status === "available") {
        //var dec = bag.result.noOfAppointments -1 ;
        newValue = {
            patientId:bag.patientId,
            medName:bag.name,
            quantity:bag.quantity,
        };

        console.log(newValue)
        connectionFrom.connVar.query('INSERT INTO sellmedicine SET ?', [newValue] , function(err,result){
            if (!err){
                /*res.send(' Welcome to our website .......');*/
                console.log(' Credentials added to database');
                return next();
            }
            else{
                //res.end(JSON.stringify(result));
                connectionFrom.connVar.end();
                console.log('Error while performing Query');
            }
        });
    }
    else{
        return next();
    }

};




//room
app.post("/allocateRoom",function(req,res){

    bag={};
    bag.patientId = req.body.patientId,
        bag.date = req.body.date;
    console.log(bag , "bag");
    async.series([
        _findEmptyRoom.bind(null, bag),
        _changeRoomStatus.bind(null,bag),
        _allocateRoom.bind(null,bag),
    ],function (err) {
        if(err){
            throw  "some where mistake"
        }else{
            res.end(JSON.stringify(bag));
        }
    })
})
function _findEmptyRoom(bag,next){
    id ="NOT ALLOCATED"
    connectionFrom.connVar.query('select * from rooms where status ='  + connectionFrom.connVar.escape(id), +'LIMIT 1' ,
        function(err, rows, fields) {
            if (!err)
            {
                console.log(rows);
                if(rows.length > 0)
                {
                    bag.roomNo = rows[0].roomNo;
                    bag.roomStatus="available"
                    return next();
                }else{
                    bag.roomStatus="unAvailable"
                    return next();
                }
            }
            else{
                connectionFrom.connVar.end();
                console.log('Error while performing Query.');
                return;
            }
        });
}
function _changeRoomStatus(bag,next) {

    if( bag.roomStatus=="available") {
        response = {
            status: "ALLOCATED"
        };

        condition = {roomNo: bag.roomNo};

        connectionFrom.connVar.query('UPDATE rooms SET ? where ?', [response, condition], function (err, result) {
            if (!err) {
                console.log(' Credentials updated to database333333333333333');
                return next();
            }
            else {
                connectionFrom.connVar.end();
                console.log('Error while performing Query in update.');
            }
        });
    }else{
        return next();
    }


}
function _allocateRoom(bag,next) {

    if( bag.roomStatus=="available") {

        inputRequirements = {
            roomNo: bag.roomNo,
            patientId: bag.patientId,
            date: bag.date
        };
        console.log(inputRequirements , "inputRequirements");
        connectionFrom.connVar.query('INSERT INTO allocateroom SET ?', inputRequirements, function (err, res) {
            if (!err) {
                console.log(' Credentials added to database111111111111111');
                return next();
            }
            else {
                connectionFrom.connVar.end();
                console.log('Error while performing Query.');
            }
        });

    }else{
        return next();
    }
}



var server = app.listen(3005, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})