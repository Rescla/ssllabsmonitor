/**
 * Created by s on 4/07/2016.
 */
var rp = require('request-promise');
var Promise = require('bluebird');
var apiRoot = 'https://api.ssllabs.com/api/v2';

module.exports = function (domain) {
    return new Promise(function (resolve, reject) {
        var becameInProgress = false;
        // Main execution
        
        return callAnalyze(true).then(handleAnalyzeResponse);

        function handleAnalyzeResponse(response) {
            if (response.status === 'READY') {
                // Done!
                console.log('done!');
                resolve(response);
            } else if (response.status === 'IN_PROGRESS') {
                if (!becameInProgress){
                    becameInProgress = true;
                    console.log('SSL Labs test in progress');
                } else {
                    var totalProgress = response.endpoints.reduce(function(totalProgress, endpoint){
                        return totalProgress + (endpoint.progress > 0 ? endpoint.progress : 0);
                    }, 0);
                    
                    totalProgress = totalProgress / response.endpoints.length;
                    
                    console.log('progress: ' + totalProgress + '%');
                }
                setTimeout(function(){
                    return callAnalyze().then(handleAnalyzeResponse);
                }, 10000);
            } else if (response.status === 'ERROR') {
                reject(response);
            } else {
                // Before in progress
                console.log('Before in progress');
                setTimeout(function(){
                    return callAnalyze().then(handleAnalyzeResponse);
                }, 5000);
            }
        }
    });


    function callAnalyze(startNew) {
        var uri = apiRoot + '/analyze';
        uri += '?host=' + domain;

        if (startNew) {
            uri += '&startNew=on';
        }

        return rp({
            uri: uri,
            transform: function (body) {
                return JSON.parse(body);
            }
        });
    }

};



