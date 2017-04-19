/**
 * Created by RAJesh1 on 6/22/2016.
 */

// OR commonjs style
//var angularMaterialize = require('angular-materialize');

angular.module('myModule', ['ui.router','720kb.datepicker'])

    .config(function($stateProvider,  $urlRouterProvider) {
            var source="";
        $stateProvider
            .state('homePage', {
                url: '/homePage',
                templateUrl: source + '/templates/home.html',
                controller: 'homePageCtrl'
            })
            .state('registration', {
                url: '/registration',
                templateUrl: source + '/templates/registration.html',
                controller: 'registrationCtrl'
            })

            .state('login', {
                url: '/login/:type',
                templateUrl: source + '/templates/login.html',
                controller: 'logInCtrl'
            })

            .state('userDashBoard', {
                url: '/userDashBoard/:userId',
                templateUrl: source + '/templates/userprofile.html',
                controller: 'userDashBoardCtrl'
            })

            .state('doctorDashBoard', {
                url: '/doctorDashBoard',
                templateUrl: source + '/templates/docDashboard.html',
                controller: 'doctorDashBoardCtrl'
            })

            .state('adminDashBoard', {
                url: '/adminDashBoard',
                templateUrl: source + '/templates/adminDashBoard.html',
                controller: 'adminDashBoardCtrl'
            })

            .state('editProfile', {
                url: '/editProfile/:userId',
                templateUrl: source + '/templates/editProfile.html',
                controller: 'editProfileCtrl'
            })
            .state('showProfile', {
                url: '/showProfile/:userId',
                templateUrl: source + '/templates/showProfile.html',
                controller: 'showProfileCtrl'
            })
            .state('appointment', {
                url: '/appointment/:type',
                templateUrl: source + '/templates/appoint.html',
                controller: 'appointmentCtrl'
            })
            .state('addDoctor', {
                url: '/addDoctor',
                templateUrl: source + '/templates/addDoc.html',
                controller: 'addDoctorCtrl'
            })
            .state('addNurse', {
                url: '/addNurse',
                templateUrl: source + '/templates/addNurse.html',
                controller: 'addNurseCtrl'
            })

            .state('addMedicine', {
                url: '/addMedicine',
                templateUrl: source + '/templates/addMedicine.html',
                controller: 'addMedicineCtrl'
            })

            .state('deleteDoctor', {
                url: '/deleteDoctor',
                templateUrl: source + '/templates/delDoc.html',
                controller: 'deleteDoctorCtrl'
            })

            .state('showAppointments', {
                url: '/showAppointments',
                templateUrl: source + '/templates/showAppointments.html',
                controller: 'showAppointmentsCtrl'
            })

            .state('receptionist', {
                url: '/receptionist',
                templateUrl: source + '/templates/receptionist.html',
                controller: 'receptionistCtrl'
            })



            .state('offlinebookAppointment', {
                url: '/offlinebookAppointment',
                templateUrl: source + '/templates/receptionistAppointment.html',
                controller: 'offlinebookAppointmentCtrl'
            })
        $urlRouterProvider.otherwise('/homePage')
    })



    .controller('homePageCtrl', function ($scope ,$state, $http) {
        $scope.name = 'ramesh';
        console.log('yasjdbjh')
        $scope.type;

        $scope.admin=function() {
            $scope.type="admin";
            console.log($scope.type + "$scope.type");
            $state.go('login', {"type": $scope.type});
        }
        $scope.doctor=function() {
            $scope.type="doctor";
            console.log($scope.type + "$scope.type");
            $state.go('login', {"type": $scope.type});
        }
        $scope.nurse=function() {
            $scope.type="nurse";
            console.log($scope.type + "$scope.type");
            $state.go('login', {"type": $scope.type});
        }
        $scope.receptionist=function() {
            $scope.type="receptionist";
            console.log($scope.type + "$scope.type");
            $state.go('login', {"type": $scope.type});
        }
        $scope.patient=function() {
            $scope.type="patient";
            console.log($scope.type + "$scope.type");
            $state.go('login', {"type": $scope.type});
        }
        $scope.registration=function() {
            $scope.type="registration";
            $state.go('registration');
        }

        $scope.medical=function() {
            $scope.type="medicalpeople";
            console.log($scope.type + "$scope.type");
            $state.go('login', {"type": $scope.type});
        }

    })
    .controller('registrationCtrl', function ($scope ,$http){
        $scope.form={};
        $scope.submit=function () {
            console.log($scope.form)
                $http.post('/registration', $scope.form).success(function(response) {
                    console.log(response);
                    if(response.status == "successfull"){
                        alert('Successfully Registered');
                    }
                    else{
                        alert('Same user id exists try with another user id');
                    }
             });


        }
        
    })

    .controller('logInCtrl', function ($scope ,$state, $http , $stateParams) {

        console.log("$stateParams.type = " , $stateParams.type , "aaaaaaaa")

        $scope.form={};

        console.log($stateParams.type , '$stateParams.type')

        $scope.pos;
        $scope.position = function (no) {
            console.log(no , "jhvgvvhgc " , "ccc");
            
        }
        $scope.arr = ['Orthopaedics' ,'Cardiology'];


        $scope.submit = function () {
                console.log($scope.form);

                $scope.form.tableName=$stateParams.type;

            if( $stateParams.type == "patient") {
                $scope.form.tableName = 'registration';
            }
            $http.post('/loginVerify', $scope.form).success(function(response) {

                    console.log(response);
                      $scope.arr = ['Orthopaedics' ,'Cardiology'];
                    if(response.authentication == "success"){

                        console.log('authentication successful ' , response.userId)
                        localStorage.setItem('id', response.userId);


                        if($stateParams.type == "medicalpeople")
                        {  $state.go('addMedicine', {"userId": response.userId}); }

                        if($stateParams.type == "patient")
                        {  $state.go('userDashBoard', {"userId": response.userId}); }

                        if($stateParams.type == "admin")
                        {  $state.go('adminDashBoard', {"userId": response.userId}); }

                        if($stateParams.type == "doctor")
                        {  $state.go('doctorDashBoard')   }
                        if($stateParams.type == "receptionist")
                        {  $state.go('receptionist')   }

                    }
                    else
                    {
                        alert('authentication fails try again')

                    }
            });

        }

        


    })

    .controller('userDashBoardCtrl', function ($scope,$state, $http, $stateParams) {
        console.log('userDashBoard')
        console.log("$stateParams.type = " , $stateParams.userId)

        $scope.category;
        $scope.orthopedic = function () {
            $scope.category ="orthopedic"
            $state.go('appointment', {"type" : $scope.category});
        }
        $scope.cardiology= function () {
            $scope.category ="cardiology"
            $state.go('appointment', {"type" : $scope.category});
        }
        $scope.neurology= function () {
            $scope.category ="neurology"
            $state.go('appointment', {"type" : $scope.category});
        }
        $scope.dental= function () {
            $scope.category ="dental"
            $state.go('appointment', {"type" : $scope.category});
        }
        $scope.haematology= function () {
            $scope.category ="haematology"
            $state.go('appointment', {"type" : $scope.category});
        }
        $scope.cancer= function () {
            $scope.category ="cancer"
            $state.go('appointment', {"type" : $scope.category});
        }
        $scope.editProfile=function () {
            $state.go('editProfile', {"userId" : $stateParams.userId});
        }
        $scope.showProfile=function () {
            $state.go('showProfile', {"userId" : $stateParams.userId});
        }


        $scope.showAppointments=function () {
            
            $state.go('showAppointments');
        }

    })
    .controller('editProfileCtrl', function ($scope,$state, $http, $stateParams) {
        $scope.form={}
        $scope.form.userId =$stateParams.userId;
        var input ={"userId" : $stateParams.userId , "tableName":"registration" };
       
        $http.post('/userInfo', input ).success(function(response) {
            console.log(response ,"response");
            console.log("i am insode")
            $scope.form.name=response.name;
            $scope.form.password=response.password
            $scope.form.emailAddress=response.emailAddress
            $scope.form.mobileNo=response.mobileNo
            $scope.form.address=response.address
          });
        
        $scope.submit=function () {

            console.log($scope.form , "$scope.form");
            $http.post('/editprofile', $scope.form ).success(function(response) {

                console.log("response" , response , "response");
                if(response.status ===  "changed")
                { console.log('successfully changed');
                    alert('successfully changed');
                    $state.go('userDashBoard', {"userId" :$scope.form.userId})
                }
                else
                {$state.go('userDashBoard', {"userId" :$scope.form.userId})}
            })
        }

    })
    .controller('showProfileCtrl', function ($scope,$state, $http, $stateParams) {
        $scope.form={}
        $scope.form.userId =$stateParams.userId;
        var input ={"userId" : $stateParams.userId , "tableName":"registration" };

        $http.post('/userInfo', input ).success(function(response) {
            console.log(response ,"response");
            console.log("i am insode")
            $scope.form.name=response.name;
            $scope.form.password=response.password
            $scope.form.emailAddress=response.emailAddress
            $scope.form.mobileNo=response.mobileNo
            $scope.form.address=response.address
        });



    })
    .controller('appointmentCtrl', function ($scope,$state, $http, $stateParams) {


        $scope.form={}
        $scope.form.diseasecategory = $stateParams.type;

        $scope.submit =function () {

            console.log($scope.form ,"$scope.form")

            var mnths = {
                    Jan:"01", Feb:"02", Mar:"03", Apr:"04", May:"05", Jun:"06",
                    Jul:"07", Aug:"08", Sep:"09", Oct:"10", Nov:"11", Dec:"12"
                },
                date = $scope.form.date.split(" ");
            xx=  [ date[3], mnths[date[1]], date[2] ].join("-");
                 $scope.form.date=xx ;

            $scope.form.userid = localStorage.getItem('id');;
            console.log($scope.form, "$Scope.form");

            //post req
            
            $http.post('/appointment', $scope.form).success(function(response) {
                $scope.flag;
                console.log(response);
                if(response.status == "available"){
                   console.log(response , "response")
                    $scope.flag =1;
                    $scope.appointmnetNo = response.number;
                    console.log("appointment number " , response.number);
                }
                else {
                    $scope.flag =2;
                    console.log('no appointment avilable' );
                }
            });



        }






    })
    .controller('adminDashBoardCtrl', function ($scope,$state, $http, $stateParams) {
      console.log("i am inside adminDashBoard");
        $scope.addDoctor= function () {
            console.log("add Doctor function");
            $state.go('addDoctor');
        }


        $scope.flag = 1;
        $scope.toggle = function ( id ) {
            console.log(id , "id")
            $scope.flag =id;
        }

        $scope.addNurse= function () {
            console.log("add Doctor function");
            $state.go('addNurse');
        }
        
        $scope.deleteDoctor= function () {
            $state.go('deleteDoctor');
            
        }
        
    })
    .controller('addDoctorCtrl', function ($scope,$state, $http, $stateParams) {
        console.log("i am inside adminDashBoard");
        $scope.form={};

        $scope.submit = function () {
            console.log($scope.form);

            $http.post('/addDoctor', $scope.form).success(function(response) {
                console.log(response);
                if(response.stats == "success"){
                    alert('Successfully Added');
                    $state.go('adminDashBoard');

                }
            });
        }

    })
    .controller('deleteDoctorCtrl', function ($scope,$state, $http, $stateParams) {
        console.log("i am inside adelete admin doctor ctrl");

        $http.get('/getDoctorInfo', $scope.form).success(function(response) {
            console.log(response , "response from server");
            $scope.contactlist = response;
        });

        $scope.remove=function (id) {
            console.log(id);
            $http.delete('/deleteDoctor/'+ id).success(function(response) {
                console.log(response , "response from server");

                //update the view
                $http.get('/getDoctorInfo', $scope.form).success(function(response) {
                    console.log(response , "response from server");
                    $scope.contactlist = response;
                });


            });

        }
        
    })
    .controller('addNurseCtrl', function ($scope,$state, $http, $stateParams) {
        console.log("i am inside adminDashBoard");
        $scope.form={};

        $scope.submit = function () {
            console.log($scope.form);

            $http.post('/addDoctor', $scope.form).success(function(response) {
                console.log(response);
                if(response.stats == "success"){
                    alert('Successfully Added');
                    $state.go('adminDashBoard');

                }
            });
        }

    })
    .controller('addMedicineCtrl', function ($scope,$state, $http, $stateParams) {
        console.log("i am inside addNurseCtrl");
        $scope.meds={}
        $scope.flag =1;


        $scope.addmeds = function () {
            console.log($scope.meds);
            $http.post('/addMedicine', $scope.meds).success(function(response) {
                console.log(response);
                if(response.stats == "success"){
                      alert('Successfully Added');
                    $scope.meds="";
                }

            });
        }

        $scope.medical={};
        $scope.medslist = [];
        $scope.totalPrice = 0;
        $scope.sellMedicine = function () {

            $http.post('/sellmedicine', $scope.medical).success(function(response) {
                if(response.status == "available"){
                    $scope.medslist.push($scope.medical);
                    $scope.medical={};
                    $scope.totalPrice = $scope.totalPrice + response.cost;
                    console.log($scope.totalPrice , "$scope.totalPrice")
                }else{
                    alert('Not Available');
                    $scope.medical={};
                }
            });



        }





})


    .controller('showAppointmentsCtrl', function ($scope,$state, $http, $stateParams) {
        console.log("i am inside addNurseCtrl");

        var userId = localStorage.getItem('id');
        data = {"userId" : userId};
        console.log(data,"data ");
        $http.post('/getAppointmentInfo', data).success(function(response) {
                console.log(response ,"response ");
            $scope.contactlist = response;
        });

    })

    .controller('doctorDashBoardCtrl', function ($scope,$state, $http, $stateParams) {
        console.log('i am inside admin dashboard')

        $scope.flag =1 ;
        $scope.diagonsis = function () {
            $scope.flag =2;
            console.log('i am inside    ')
        }

        $scope.form={};
        $scope.medslist=[];
        $scope.add = function () {

            console.log($scope.form , "$scope.form ")
            $http.post('/diagnosis', $scope.form).success(function(response) {
                console.log(response ,"response ");

            });

            $scope.medslist.push($scope.form);
            $scope.form={}

        }
        
    })



    .controller('receptionistCtrl', function ($scope,$state, $http, $stateParams) {
        console.log('i am inside receptionistCtrl')

        $scope.bookAppointment = function () {
            console.log('i am inside book appointment');
            $state.go('offlinebookAppointment');

        }
    })

    .controller('offlinebookAppointmentCtrl', function ($scope,$state, $http, $stateParams) {

        console.log('i am inside offlinebookappointment');
        $scope.form = {};
        $scope.arr = ['Orthopaedics' ,'cardiology' , 'Neurology' , 'Dental' , 'Cancer'];
        $scope.submit =function () {

            console.log($scope.form ,"$scope.form")

            var mnths = {
                    Jan:"01", Feb:"02", Mar:"03", Apr:"04", May:"05", Jun:"06",
                    Jul:"07", Aug:"08", Sep:"09", Oct:"10", Nov:"11", Dec:"12"
                },
                date = $scope.form.date.split(" ");
            xx=  [ date[3], mnths[date[1]], date[2] ].join("-");
            $scope.form.date=xx ;

            console.log($scope.form.disease[0] , "$scope.form.disease[0]")

            var xx = $scope.form.disease[0];
            console.log(xx  , "xxxxxxx");

            $scope.form.diseasecategory=xx;

            console.log($scope.form, "$Scope.form");

            //post req

            $http.post('/appointment', $scope.form).success(function(response) {
                $scope.flag;
                console.log(response);
                if(response.status == "available"){
                    console.log(response , "response")
                    $scope.flag =1;
                    $scope.appointmnetNo = response.number;
                    console.log("appointment number " , response.number);
                }
                else {
                    $scope.flag =2;
                    console.log('no appointment avilable' );
                }
                $scope.flag={};
            });



        }



    })