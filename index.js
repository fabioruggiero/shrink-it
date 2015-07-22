var eb = vertx.eventBus;

var pa = 'vertx.mongopersistor';

eb.send(pa, {
    action: 'command',
    command: JSON.stringify({
        createIndexes: 'urls',
        indexes: {key: {shortUrl: 1}},
        name: "short_index",
        unique: true
    })
});

