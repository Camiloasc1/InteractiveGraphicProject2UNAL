var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

var player;
var bus;
var currentStation;
var goalStation;
var goalSprite;
var stationsPool;
var textStyle = {font: 'bold 20px Arial', fill: '#000000', backgroundColor: '#f0f0f0'};
var text;

function preload() {
    game.load.image('map', 'assets/Map.jpg');
    game.load.image('player', 'assets/Player.png');
    game.load.image('bus', 'assets/Bus.png');
    game.load.image('flag', 'assets/Flag.png');
    game.load.image('marker', 'assets/Marker.png');
    game.load.image('reward', 'assets/Winner.jpg');
}

function create() {
    //Set world size
    var image = game.cache.getImage('map');
    game.world.setBounds(0, 0, image.width, image.height);

    //Background map
    game.add.image(0, 0, 'map');
    //Goal Sprite
    goalSprite = game.add.image(0, 0, 'flag');
    goalSprite.anchor.set(0.2, 1.0);
    goalSprite.height = 32;
    goalSprite.width = 32;
    //Movement Markers
    stationsPool = game.add.group();

    //Player sprite
    player = game.add.sprite(0, 0, 'player');
    player.anchor.set(0.5, 0.5);
    player.height = 32;
    player.width = 32;
    game.camera.follow(player);

    bus = game.add.sprite(0, 0, 'bus');
    bus.anchor.set(0.5, 0.5);
    bus.scale.setTo(0.05, 0.05);
    bus.kill();

    //Buttons for each station
    var button;
    for (var i = 0; i < stations.length; i++) {
        button = game.add.button(stations[i].x - 12, stations[i].y - 12, 'marker', onButtonPressed, this);
        button.height = 24;
        button.width = 24;
        button.station = stations[i];

        // Doesn't work
        // button.onInputOver.add(function () {
        //     game.stage.canvas.style.cursor = "pointer";
        // }); // Doesn't work
        // button.onInputOut.add(function () {
        //     game.stage.canvas.style.cursor = "default";
        // });

        // Doesn't work
        // button.inputEnabled = true;
        // button.input.useHandCursor = true;

        stations[i].button = button;
        stationsPool.add(button);
    }

    //Start at random station
    currentStation = stations[game.rnd.integerInRange(0, stations.length - 1)];
    player.x = currentStation.x;
    player.y = currentStation.y;
    //And try to get to some other
    goalStation = stations[game.rnd.integerInRange(0, stations.length - 1)];
    goalSprite.x = goalStation.x;
    goalSprite.y = goalStation.y;


    text = game.add.text(25, 25, "", textStyle);
    text.fixedToCamera = true;

    updateText();
    updateStations();
}

function update() {
    var hover = false;
    stationsPool.forEachAlive(
        function (s) {
            var rectangle = new Phaser.Rectangle(s.left, s.top, s.width, s.height);
            if (Phaser.Rectangle.contains(rectangle, game.input.x + game.camera.x, game.input.y + game.camera.y)) {
                hover = true;
            }
        });
    if (hover) {
        game.canvas.style.cursor = "pointer";
    } else {
        game.canvas.style.cursor = "default";
    }
}

function render() {

}
function onButtonPressed(button) {
    var targetStation = button.station;
    bus.revive();
    bus.position = player.position;
    game.camera.follow(bus);
    player.kill();

    //Move to target if is connected
    if (areConnected(currentStation, targetStation)) {
        currentStation = targetStation;
        clearMarkers();
        updateText();

        this.game.add.tween(bus)
            .to(
                {x: targetStation.x, y: targetStation.y},
                Phaser.Timer.SECOND,
                Phaser.Easing.Sinusoidal.InOut,
                true
            );

        game.time.events.add(Phaser.Timer.SECOND, function () {
            player.revive();
            player.position = bus.position;
            game.camera.follow(player);
            bus.kill();

            updateStations();
        });
    }
}

function areConnected(station1, station2) {
    return station1.connected.indexOf(station2.name) != -1 && station2.connected.indexOf(station1.name) != -1
}

function updateText() {
    text.setText("Estacion Actual: " + currentStation.name + "\nObjetivo:             " + goalStation.name);
}

function updateStations() {
    for (var i = 0; i < stations.length; i++) {
        if (areConnected(currentStation, stations[i])) {
            stations[i].button.revive();
        } else {
            stations[i].button.kill();
        }
    }
}

function clearMarkers() {
    stationsPool.forEachAlive(
        function (s) {
            s.kill();
        });
}
