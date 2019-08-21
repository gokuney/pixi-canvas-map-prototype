var map = function(canvasEle){

    console.log(`Map inited`);
    var canvas = $(canvasEle)[0];
    // $(canvasEle).hide();
    this.canvasElement = canvasEle;
    console.log(canvasEle)

    this.app = new PIXI.Application({width: 1024, height: 786, view: canvas});
    this.app.renderer.backgroundColor = 0x061639;
    window.test = this.app;
    this.config = {markers: {}, bg: '323822.jpg', geoLocation: {lat: -25.363, lng: 131.044}};
    this.markerObjs = {};
    this.mapMarkerObjs = {};
    window.__config = this.config;
    this.controlsBinder();
    this.currentType = 'canvas';
    this.defaultLatLng = {lat: -25.363, lng: 131.044};
}

map.prototype.imageInjector = function(imgData){
    var self = this;
    return new Promise(function(resolve,reject){
        console.log(`Adding resource with id ${imgData.id} and src ${imgData.src}`)
        self.app.loader.add(imgData.id, imgData.src).load(function(loader, resource){
            resolve('done');
        });
    });
};

map.prototype.readyAssets = function(){
    var self = this;
    //Note: Good for performance 
    var assets = [{
        id: 'marker',
        src: './marker.png'
    },
    {
        id: 'bg',
        src: './323822.jpg'
    }];

    return new Promise(function(resolve, reject){
        var loader = self.app.loader;
        assets.forEach(function(item){
            loader.add(item.id, item.src);
        });

        loader.load(function(){
            resolve(true);
        })

    });

};

map.prototype.controlsBinder = function(){
    var self = this;
    $(document).on('click' , '#add-marker', function(){
        //Adds a marker with image on the canvas
        self.addMarker({
            id: '_' + Math.random().toString(36).substr(2, 9),
            position: [100,100]
        });
    });

    $(document).on('click', '#generate-json-data', function(){
            $('#json-data').val(JSON.stringify(self.config));
            window.localStorage.setItem('data', JSON.stringify(self.config));
            alert("JSON generated, copy it from the input field")
    });

    $(document).on('change', '.type-switcher', function(){
        var type = $(this).val();
        
    });

};


map.prototype.addMarker = function(markerData, markerIcon){

    var self = this;

    var marker = new PIXI.Sprite(self.app.loader.resources.marker.texture);
    self.app.stage.addChild(marker);
    marker.x = markerData.position[0];
    marker.y = markerData.position[1];
    marker.id = markerData.id;
    self.config["markers"][markerData.id] = {data: markerData};
    self.markerObjs[markerData.id] = marker;
    self.interactMarker(marker);
};

map.prototype.testPolygon = function(){
    var self = this;
    var stage = self.app.stage;
    let graphic = new PIXI.Graphics();
    stage.addChild(graphic);
    graphic.x = 200;
    graphic.y = 200;
    graphic.lineStyle(5, 0x00ff00);
    graphic.beginFill(0xff0000);
    graphic.drawPolygon([
        new PIXI.Point(100, 100), 
        new PIXI.Point(100, 200), 
        new PIXI.Point(200, 200)
    ]);
    graphic.interactiveChildren = true;
    graphic.interactive = true;
    graphic.closePath();
    graphic.endFill();

    window.tester = graphic;

};

map.prototype.canvasBuild = function(json){
    var self = this;
    $(self.canvasElement).show();

     //render 
     self.addBgImage( json.bg );
     //render markers
     Object.keys(json.markers).forEach(function(idx){
         self.addMarker(json.markers[idx].data);
     });

    //-- stress test
    // for( var i = 0 ; i < 20000; i++ ){
    //     self.addMarker({
    //         id: '_' + Math.random().toString(36).substr(2, 9),
    //         position: [ Math.floor(Math.random() * 1024) + 0  , Math.floor(Math.random() * 786) + 0   ]
    //     });
    // }
};

map.prototype.initMap = function(mapId, json){

        var self = this;
        
        var myLatLng = json.geoLocation || self.defaultLatLng;

        var map = new google.maps.Map(document.getElementById(mapId), {
          zoom: 4,
          center: myLatLng
        });
      

        //render markers
     Object.keys(json.markers).forEach(function(idx){
        //Draw markers
        var iMarker = json.markers[idx].data;
        
        var mar  =  new google.maps.Marker({
            position: iMarker.geoLocation || myLatLng, //if nothing is there
            map: map,
            draggable:true,
            id: iMarker.id,
            icon: './marker.png',
            title: `MARKER ID: ${iMarker.id}`
          });

          mar.addListener('dragend', function(_event){
            var latlng = { lat: _event.latLng.lat(), lng: _event.latLng.lng() };
            self.config.markers[this.id].data.geoLocation = latlng;
          });

          self.markerObjs[iMarker.id] = mar;
        
    });

};

map.prototype.mapBuild = function(json){
    var self = this;
    //show map
    $('#map').css({display: 'inline-block'});

    self.initMap('map', json);

};

map.prototype.buildFromJSON = function(json, type){ //type = map/canvas
    var self = this;

    self.currentType = type || 'canvas';
    self.config = json;
    if(type == 'map'){
        self.mapBuild(json);
    }else{
        self.canvasBuild(json);
    }

};


map.prototype.interactMarker = function(marker){
var self = this;
    //make it interactable 
    marker.interactive = true;
    marker.buttonMode = true;

     // setup events
     marker
     // events for drag start
     .on('mousedown', onDragStart)
     .on('touchstart', onDragStart)
     // events for drag end
     .on('mouseup', onDragEnd)
     .on('mouseupoutside', onDragEnd)
     .on('touchend', onDragEnd)
     .on('touchendoutside', onDragEnd)
     // events for drag move
     .on('mousemove', onDragMove)
     .on('touchmove', onDragMove);

 // move the sprite to its designated position
//  marker.position.x = x;
//  marker.position.y = y;

 // add it to the stage
 self.app.stage.addChild(marker);

 requestAnimationFrame( animate );

function animate() {

 requestAnimationFrame(animate);

 // render the stage
 self.app.render(stage);
}

function onDragStart(event)
{
 this.data = event.data;
 this.alpha = 0.5;
 this.dragging = true;
}

function onDragEnd()
{
var e = this;
 self.config.markers[marker.id]["data"].position = [ e.data.getLocalPosition(this.parent).x, e.data.getLocalPosition(e.parent).y ];

 this.alpha = 1;

 this.dragging = false;

 this.data = null;
}

function onDragMove()
{
 if (this.dragging)
 {
     var newPosition = this.data.getLocalPosition(this.parent);
     this.position.x = newPosition.x;
     this.position.y = newPosition.y;
 }
}

};

map.prototype.addBgImage = function(imgSrc){
    console.log(`Rendering image : ${imgSrc}`);
    var self = this;
    return new Promise(function(resolve,reject){
            const bg = new PIXI.Sprite(self.app.loader.resources.bg.texture);
            self.app.stage.addChild(bg);
            self.testPolygon();
    });

};
