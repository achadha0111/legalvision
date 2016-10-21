(function(){
	angular.module('starter')
	 .controller('HomeController', ['$scope', '$cordovaFile', '$cordovaFileTransfer', 'cordovaCamera', HomeController]);

	 function HomeController($scope, $cordovaFile, $cordovaFileTransfer, $cordovaCamera) {
	 	var me = this;
	 	me.current_image = 'img/ionic.png';
	 	me.text_content = '';
	 	me.detection_type = 'TEXT_DETECTION';

	 	me.detection_types = {
	 		LABEL_DETECTION: 'label',
	 		TEXT_DETECTION: 'text',
	 		LOGO_DETECTION: 'logo',
	 		LANDMARK_DETECTION: 'landmark'
	 	};

	 	var api_key = 'AIzaSyDADZ6HGkhovfcQn8SB9QAaznyPZL6JsE8';

	 	$scope.takePicture = function(){
	 		alert('detection_type: ' +me.detection_type);

	 		var options = {
	 			destinationType: Camera.DestinationType.DATA_URL,
	 			sourceType: Camera.PictureSourceType.CAMERA,
	 			targetWidth: 500,
	 			targetHeight: 500,
	 			correctOrientation: true,
	 			cameraDirection: 0,
	 			encodingType: Camera.encodingType.JPEG
	 		};

	 		$cordovaCamera.getPicture(options).then(function(imagedata){
	 			me.current_image = "data:image/jpeg;base64," + imagedata;
	 			me.text_content = '';
	 			me.locale = '';

	 			var vision_api_json = {
	 				"requests": [
	 					{
	 						"image":{
	 							"content":imagedata
	 						},
	 						"features": [
		 						{
		 							"type": me.detection_type,
		 							"maxResults": 200
		 						}
	 						]
	 					}
	 				]
	 			};

	 			var file_contents = JSON.stringify(vision_api_json);

	 			$cordovaFile.writeFile(
	 				cordova.file.applicationStorageDirectory,
	 				'file.json',
	 				file_contents,
	 				true
	 			).then(function(result){
	 				var headers = {
	 					'Content-Type': 'application/json'
	 				};

	 				options.headers = headers;

	 				var server = 'https://vision.googleapis.com/v1/images:annotate?key=' + api_key;
	 				var filePath = cordova.file.applicationStorageDirectory + 'file.json';

	 				$cordovaFileTransfer.upload(server, filePath, options, true)
	 					.then(function(result){
	 						var res = JSON.parse(result.response);
	 						var key = me.detection_types[me.detection_type] + 'Annotations';

	 						me.text_content = res.responses[0][key][0].description;
	 					}, function(err){
	 						alert('An error occurred while reading the image');
	 					});
	 			}, function(err){
	 				alert('An error occurred while writing to the file');
	 			});
	 		}, function(err){
	 			alert('An error occurred retrieving your picture');
	 		})
	 	}
	 }
})();