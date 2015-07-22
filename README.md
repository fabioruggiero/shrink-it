Shrink it!
==========

An usefull web tool to shorten or encode your URLS


How to use
---
In order to use Shrink it you need to have [Vertx.io](http://vertx.io/vertx2/) (not higher then 2.1.4) 
installed and an instance of mongoDB running on the port 27017.


#####1. Install Vert.x

Download [vertx/2.1.4](https://bintray.com/vertx/downloads/distribution/2.1.4), unzip into a new folder 
and set the bin folder in the path environment.
You can see if Vert.x is working running from command line 

```
vertx version
```


#####2. MongoDB 

If you are using Docker you can pull the image of mongoDB typing into the docker prompt:

```
docker pull mongo
```

Once downloaded, run it by: 

```
docker run -d -t 27017:27017 --name mongo mongod
```

Now your istance of mongoDB is running. This application communicates with default Docker host 192.168.99.100, 
but you can change it as your needs into the app.js file. 



#####3. Run Shrink it 

Once all is up clone this repository running: 

```
git clone https://github.com/fabioruggiero/shrink-it.git
```

move to the local shrink-it directory and run from the command line: 

```
vertx run app.js
```

Then point your browser at 

```
http://localhost:8080
```
