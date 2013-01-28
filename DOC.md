Ethersheet Client
=================

## Bootstrapping
Starts by booting ethersheet.js and making a new ethersheet object called es
es gets data.selection (selection_collection) and data.sheet
es also gets socket which gets data and channel
renders ethersheet into the passed in selector.
Socket binds to data and listens for send events from data

## Sending Messages
A model (e.g. sheet) has a send enabled parameter which is set to true.
calls its send method (defined in ESModel) send is passed an object called 'msg' like so:
{ id (instance_id), type (object_name), action (method), params (args for method) }
Socket listens for send and calls the built in send method on LibSocket after 
calling Command.serialize on the msg. which converts the message to JSON and sends it along to the server.

## Receiving messages
upon receiving a message the socket library (lib/socket) creates a new command object passing in the data string (which sanitizes the string and creats an object out of it).  It then gets the model based on the data type and the data id, temporarily turns of the send event, and calls command.execute passing in the model.
Command.execute then calls the method on the model.

Ethersheet Server
=================

## Bootstrapping
Ethersheet servers starts via app.js which bootstraps the config file and calls create server on lib/server and passes in the config file. 
Ethersheet Server create_server() is the main server function that gets called, it does the work of bootstraping all the views and routes using express.  
The server also creates a pubsub server which is a Transactor object.  It then registers onTransaction which is passed the createTransactionHandler method from lib/transaction_handler.js.  The server then creates a web socket listener and attaches it to the pubsub server. the socket listens for data and on  the 'data' event calls the transaction handler padding in the channel, the data and a callback broadcasting the returned data to the appropriate channel.

## transaction_handler
the transactionHandler method gets a channel, a command string and a callback
it starts by instantiating a new command object, the new command object sanitizes the command string and creats an object out of the json string it recieved.  It then calls the getModel method from Ethersheet_Service and passes the dtaa type and the data ID.  Then it calls Command.execute passing in the model and calling the callback.  Command Execute then calls the method from the command string on the server side model, passing in the arguments. 
transactor then broadcasts the data it received back to the channel.
