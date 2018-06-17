"use strict";

 angular.module('config', [])

.constant('ENV', {serverURL:'https://sourcedata-dev.vital-it.ch/php/api/',baseURL:'http://localhost:9000/',baseHref:'/',withCredentials:true,debugInfoEnabled:true,CORS:true,httpCache:false,html5:false})

;