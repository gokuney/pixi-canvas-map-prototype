$(function(){
    var APP = new map('#stage');
    
    APP.readyAssets().then(function(){


        // APP.addBgImage( './323822.jpg' );
        var data = window.localStorage.getItem('data');
        data = false;
        if(data){
            APP.buildFromJSON( JSON.parse(data) , 'canvas');
        }else{
            APP.addBgImage( './323822.jpg' );
        }
        console.log(`Stage is ready`);

    }).catch( function(err){
        throw new Error(`Error in creating stage, ${err}`);
    });
});