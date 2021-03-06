if (Meteor.isClient) {

  var weather = {};
  var redirect = false;

  // A version of Session that also store the key/value pair to local storage
  // using Amplify
  var AmplifiedSession = _.extend({}, Session, {
    keys: _.object(_.map(amplify.store(), function (value, key) {
      return [key, JSON.stringify(value)];
    })),
    set: function (key, value) {
      Session.set.apply(this, arguments);
      amplify.store(key, value);
    }
  });

  // map openweathermap icon names returned from json to icomoon names
  function getWeatherGlyphColor(icon) {
    weatherGlyph = {
      "01d": { "glyph": "sun", "sound": "spring", "color": "#FF834B" },
      "01n": { "glyph": "moon", "sound": "owl", "color": "#3D62FF" },
      "02d": { "glyph": "cloudy", "sound": "spring", "color": "#B7D6FF" },
      "02n": { "glyph": "cloud", "sound": "night", "color": "#9FBADE" },
      "03d": { "glyph": "cloud2", "sound": "spring", "color": "#7CC1FF" },
      "03n": { "glyph": "cloud2", "sound": "night", "color": "#639ACC" },
      "04d": { "glyph": "cloudy2", "sound": "spring","color": "#5AB4FF" },
      "04n": { "glyph": "cloudy2", "sound": "night", "color": "#4385BD" },
      "09d": { "glyph": "rainy", "sound": "rain", "color": "#4095FF" },
      "09n": { "glyph": "rainy", "sound": "rain", "color": "#2C67B0" },
      "10d": { "glyph": "rainy2", "sound": "rain", "color": "#3676FF" },
      "10n": { "glyph": "rainy2", "sound": "rain", "color": "#244FAB" },
      "11d": { "glyph": "lightning3", "sound": "thunder", "color": "#6E7081" },
      "11n": { "glyph": "lightning3", "sound": "thunder", "color": "#50525E" },
      "13d": { "glyph": "snowy3", "sound": "snow", "color": "#A2E0FF" },
      "13n": { "glyph": "snowy3", "sound": "snow","color": "#82B3CC" },
      "50d": { "glyph": "lines", "sound": "spring", "color": "#7FD9C6" },
      "50n": { "glyph": "lines", "sound": "spring", "color": "#518A7E" },
    };
    return weatherGlyph[icon];
  }

  function populateWeatherObj(location) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&units=imperial';
    var weatherData = $.getJSON(url, function( data ){
      if (data.cod === 200){
        var gylphColor = getWeatherGlyphColor(data.weather[0].icon);
        weather['icon'] = "icon-" + gylphColor['glyph'];
        weather['location'] = data.name;   
        weather['description'] = data.weather[0].description;       
        weather['tempCurr'] = data.main.temp;
        weather['tempHi'] = data.main.temp_max;
        weather['tempLow'] = data.main.temp_min;
        weather['humidity'] = data.main.humidity;
        weather['windSpeed'] = data.wind.speed;
        weather['windDir'] = data.wind.deg;

        var audioElement = document.createElement('audio');
        audioElement.setAttribute('id', 'ambientSound');    
        audioElement.setAttribute('src', '/sounds/' + gylphColor['sound'] + '.mp3');
        audioElement.setAttribute('loop', true);
        $( audioElement ).insertAfter( "#sounds" );
        $("body").css("background-color", gylphColor['color']);
        setTimeout(function(){ 
          $('.sound-note').hide('slow');
        },5000);
        AmplifiedSession.set('weatherData', weather);
        if (redirect) {
          Router.go('/wInfo/' + location);
        }
        
      }
      else {
        if (!redirect){
          Router.go('error404');
        }
        $('.bad-location').show();        
        
      }
    }).fail(function() {
        alert("failed to retrieve error");
      });    
  }

  Template.home.events({
    'submit form': function (evt, temp) {
      evt.preventDefault();
      var location = temp.find('#locationText').value;
      redirect = true;
      populateWeatherObj(location);
    }
  });

  Template.wInfo.events({
    'click #sounds': function(evt, temp) {
      var audioElement = document.getElementById('ambientSound');
      if(audioElement && audioElement.paused) {
        audioElement.play();
        $('#sounds').addClass('text-active');
      }
      else {
        audioElement.pause();
        $('#sounds').removeClass('text-active');
      }
                   
    }
  })


  Template.home.rendered = function() {         
    $("body").css("background-color", "#72BBC9");
  };

  Template.error404.rendered = function() {         
    $("body").css("background-color", "#FF4547");
  };  

  Template.wInfo.rendered = function() {         
    if (!redirect) {
      redirect = false;
      var current = Router.current();
      var path = current && current.path;
      var location = path.split("/")[2];
      populateWeatherObj(location);
    }
  };

  Template.wInfo.data = function() {
    return AmplifiedSession.get('weatherData');
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
