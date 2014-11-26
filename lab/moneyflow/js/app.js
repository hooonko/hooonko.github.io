requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
      "app": "../app",
      "jquery": "jquery-1.11.1.min",
      "bootstrap": "bootstrap.min",
      "datepicker": "bootstrap-datepicker",
      "moment": "moment-with-locales.min"
    },
    "shim": {
        "bootstrap": { "deps" :['jquery'] },
        "datepicker": { "deps" :['bootstrap', 'jquery'] }
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);