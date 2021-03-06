/**
 * This servers differs a little bit from SimpleServer:
 * - it returns data instead of putting the answer on the socket with an own message
 * - see FormHandler.js in the client to see how this effects the client code
 */

function Server() {
    var self = this;
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/simplemvc');
    var SoccerPlayer = mongoose.model('SoccerPlayer', { name: String, club: String, playerNumber: Number, isSuspended: Boolean });

    /**
     * Starts a static http connection on port 8000 and a websocket server on 1337
     */
    this.start = function () {
        // Socket.io is used for handling dynamic requests (JSON)
        var connect = require("connect"),
            io = require("socket.io").listen(1337);

        // Create a http server that serves static data from ../client
        var http = require('http'); 
        http.createServer(self.handleStaticHttpConnection).listen(8000);

        console.log('Server running at http://127.0.0.1:8000/. Open your browser with http://127.0.0.1:8000/index.html');

        io.sockets.on("connection", function (socket) {
            self.handleSocketConnection(socket);
        });
    }

    /**
     * We implement a simple protocol that listens to savePlayer request with a JSON payload
     * @param socket
     */
    this.handleSocketConnection = function (socket) {
        socket.on("saveNewPlayer", function (data, callbackfn) {
            var newPlayer = new SoccerPlayer({ name: data.name, club: data.club, playerNumber: data.playerNumber, isSuspended: false });
            newPlayer.save(function (err) {
                console.log('done');
                // This call will set the JSON representation of the saved object as a "return" value
                callbackfn(newPlayer.toJSON());
            });
        });
    }

    /**
     * We implement a simple protocol that listens to savePlayer request with a JSON payload
     * @param socket
     */
    this.handleSocketConnection = function (socket) {
        socket.on("saveNewCar", function (data) {
            var autos = new AutoBay({ merk:data.merk, type:data.type, brandstof:data.brandstof, motorinhoud:data.motorinhoud,
                vermogen:data.vermogen, bouwjaar:data.bouwjaar, kleur:data.kleur, vraagprijs:data.vraagprijs, status:data.status, url:data.url, reservations: []});
            autos.save(function (err) {
                console.log('done');
            });
        });
        socket.on("newReservation", function (reservation, callbackfn) {
            AutoBay.findOne({_id:reservation.carId}, function (err, car) {
                if (car) {
                    if (!car.reservations) car.reservations = [];
                    car.reservations.push({ name:reservation.name, telefoonnummer:reservation.telefoonnummer, bod:reservation.bod});
                    car.save(function (err) {
                        callbackfn();
                    });
                    console.log(car);
                }
            });


        });
        socket.on("getAllCars", function (data, callbackfn) {
            AutoBay.find(function (err, cars) {
                callbackfn(cars);
            });
        });
        socket.on("getAllCarsByCriteria", function (data, callbackfn) {
            AutoBay.find(data, function (err, cars) {
                callbackfn(cars);
            });
        });
        socket.on("removeCars", function (data, callbackfn) {
            AutoBay.remove(function (err, cars) {
                // if (err) return handleError(err);
                AutoBay.findById(data._id, function (err, cars) {
                    console.log(cars) // null
                });
            });
        })

    }

    this.handleStaticHttpConnection = function(req, res) {    
        var path = require('path'),
            fs = require('fs'),
            util = require('util');

        var root = "../client",
            url = "",
            contentType = "text/plain",
            filePath = "";
     
        if (req.method !== 'GET') { //If the request method doesn't equal 'GET'
            res.writeHead(405); //Write the HTTP status to the response head
            res.end('Unsupported request method', 'utf8'); //End and send the response
            return;
        }
     
        if ('.' + req.url !== './') {
            filePath = root + req.url;
            fs.exists(filePath, serveRequestedFile);      
        } else {
            res.writeHead(400);
            res.end('A file must be requested', 'utf8');
            return;
        }   
     
        function serveRequestedFile(file) {
            if (file === false) {
                res.writeHead(404); 
                res.end(); 
                return;
            }
     
            var stream = fs.createReadStream(filePath);
     
            stream.on('error', function(error) {
                res.writeHead(500);
                res.end();
                return;
            });
     
            var mimeTypes = {
                '.js' : 'text/javascript',
                '.css' : 'text/css',
                '.gif' : 'image/gif'
            };
     
            contentType = mimeTypes[path.extname(filePath)];    
     
            res.setHeader('Content-Type', contentType);
            res.writeHead(200);
     
            util.pump(stream, res, function(error) {
                //Only called when the res is closed or an error occurs
                res.end();
                return;
            });
     
        }         
    }
}

var server = new Server();
server.start();