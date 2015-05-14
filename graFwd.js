/*
 *  graFwd 1.0 - Graphana-style Flow metrics forwarder for nProbe/nTopng
 *
 * (C) 2014-15 - QXIP BV, C. Mangani, L. Mangani
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 */

var net = require('net');
var netcat = require('node-netcat');
var counter = 0;

/* SETTINGS */

	// SERVER SETTINGS: JSON Listening Socket
	var shost = '127.0.0.1';
	var sport = 7000;

	// INGRESS SETTINGS: Metric Root and Metric Values
	var groot = 'L7_PROTO_NAME';
	var gvars = ['OUT_BYTES', 'IN_BYTES','IN_PKTS','OUT_PKTS'];

	// EGRESS SETTINGS: Graphite / Carbon Server
	var ghost = '127.0.0.1';
	var gport = 2003;

	// READ USER SETTINGS
	if(process.argv.indexOf("-s") != -1){ 
	    ghost = process.argv[process.argv.indexOf("-c") + 1]; 
	}
	if(process.argv.indexOf("-p") != -1){ 
	    gport = process.argv[process.argv.indexOf("-p") + 1]; 
	}


/* APP */ 

// Create JSON Server
var server = net.createServer(function (socket) {
  // console.log("Connection from " + socket.remoteAddress);
	socket.on('data', function(o) {
			try {
			    data = JSON.parse(o);
			      		// console.log('Received msg: ' + JSON.stringify(data) );
					var ts = ""+Math.round(+new Date()/1000);
					var metrics = new Array();
					for (var key in data) {
					  if (data.hasOwnProperty(key)) {
					      if(key == groot) {
						var gkey = data[key];
					      } else if( gvars.indexOf(key) > -1 ) {
							var xstr = key.replace("_", ".");
							metrics.push(""+xstr+" "+data[key])
					      }
					  }
					}

					// SHIP METRICS
					for (var xvar in metrics) {
						// console.log(gkey+"."+metrics[xvar]+" "+ts);
						client.send(gkey+"."+metrics[xvar]+" "+ts+"\n", false);
						counter++;
					}
			} catch (e) {
			    console.log("ERROR: not JSON!");
			}
	});
});

// Create Graphite Client
var client = netcat.client(gport, ghost);
	client.on('open', function () {
	  console.log('Shipping to client '+ghost+":"+gport);
	});
	
	client.on('data', function (data) {
	  console.log('CLIENT RESPONSE:',data.toString('ascii'));
	  // client.send('Goodbye!!!', true);
	});
	
	client.on('error', function (err) {
	  console.log('ERROR: Cannot connect to client! Exiting...');
	  // console.log(err);
	  process.exit(1);
	});
	
	client.on('close', function () {
	  console.log('close');
	});

	client.start();


	// Error Handling
	process.on('uncaughtException', function(err) {
	    console.log('Caught exception: ' + err);
	    console.log(err.stack);
	    process.exit(1);
	});


/* STARTUP */

// Fire up the server bound to port 7000 on localhost
server.listen(sport, shost);
console.log("TCP server listening for JSON on port 7000 at localhost.");


/* EXIT */

process.on('SIGINT', function() {
    console.log("Caught interrupt signal! Exiting...");
    console.log("Sent Metrics: "+counter);
    console.log();
        process.exit();
});
