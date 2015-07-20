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

eb.send(pa, {
    action: 'command',
    command: JSON.stringify({
        createIndexes: 'visits',
        indexes: {key: {id_url: 1}},
        name: "idUrl_index"
    })
});
