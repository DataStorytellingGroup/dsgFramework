// *** REST DATA LENS API wrapper ***

var GeoInsights = {
    
    token: "myToken",
    app_id: null,
    app_code: null,
    baseUrl: 'https://datalens.api.here.com/v1',

    setup: function ( credential ) {
      this.app_id = credential.app_id;
      this.app_code = credential.app_code;
    },

    getAccessToken: function( email, password, credential, callback ){  

      this.app_id = credential.app_id;
      this.app_code = credential.app_code;
      
      var tmp_credentials = {'email':email, 'password':password };

      return $.ajax({
          type: 'POST',
          url: this.baseUrl + '/' + 'sign_in' + '?' + jQuery.param({'app_id':this.app_id, 'app_code':this.app_code}),
          data: JSON.stringify(tmp_credentials),
          dataType: 'JSON',
          success: callback
      });
    },

    getDatasets: function( callback ) {
      this.get('/datasets', function(result) {
        var datasets = {};
        result.datasets.forEach(function(data) {
          datasets[data.id] = data;
        });

        callback(datasets);
      });
    },

    getDatasetSchema: function( datasetId, callback ) {
      this.get('/datasets/' + datasetId, callback);
    },

    createQuery: function( datasetId, facets, callback ) {
      this.post('/queries', { dataset: datasetId, version: 1, facets:  facets }, callback);
    },

    postQuery: function ( queryJSON, callback ) {
      return $.ajax({
        type: 'POST',
        url: this.baseUrl + '/queries/?' + $.param({ 'access_token': this.token, 'app_id':this.app_id, 'app_code':this.app_code}),
        data: JSON.stringify(queryJSON),
        dataType: 'JSON'
      });
    },

    getQueryData: function( queryId, params, callback ) {
      this.get('/queries/' + queryId + '/data', params, callback );
    },

    get: function( path, params, callback ) {
      this.requestNoToken('get', path, params, callback );
    },

    post: function( path, data, callback ) {
      this.request('post', path, data, callback);
    },

    request: function( method, path, data, callback ) {
      $.ajax({
        data:     JSON.stringify(data),
        dataType: 'json',
        success:  callback,
        type:     method,
        url:      this.baseUrl + path + '?' + $.param({'access_token': this.token, 'app_id': this.app_id, 'app_code': this.app_code })
      });
    },

    requestNoToken: function( method, path, parameters, callback ) {
      $.ajax({
        data:     JSON.stringify({}),
        dataType: 'json',
        success:  callback,
        type:     method,
        url:      this.baseUrl + path + '?' + $.param({'app_id': this.app_id, 'app_code': this.app_code }) + '&' + $.param(parameters)
      });
    }
};
