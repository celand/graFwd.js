# graFwd.js
Simple Graphana-style Flow metrics forwarder for nProbe/nTopng

###Setup:

npm install --save node-netcat

###Usage:

nodejs graFwd.js 
TCP server listening for JSON on port 7000 at localhost.
Shipping to client 127.0.0.1:2003

graFwd extracts selective metrics from an nProbe/ntopng JSON flow and couples them with a root parameter from the same report in plaintext protocol for Graphite.

###Example 
Pairing IN/OUT Bytes and Packets by L7 Protocol (use your imagination):

####Input:
```
{"IPV4_SRC_ADDR":"127.0.0.1","IPV4_DST_ADDR":"127.0.0.1","IN_PKTS":4,"IN_BYTES":752,"OUT_PKTS":0,"OUT_BYTES":0,"L4_SRC_PORT":58815,"L4_DST_PORT":2055,"TCP_FLAGS":0,"PROTOCOL":17,"L7_PROTO_NAME":"NetFlow"}
```

####Output:
```
NetFlow.IN.PKTS 4 1431621985
NetFlow.IN.BYTES 752 1431621985
NetFlow.OUT.PKTS 0 1431621985
NetFlow.OUT.BYTES 0 1431621985
```
