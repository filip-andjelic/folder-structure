var devanaApp = angular.module("devanaApp", ['ngSanitize']);

devanaApp.controller("mainController", ['$scope', '$timeout', 'dataService','$compile', function($scope, $timeout, dataService, $compile){
	/*
	 *	Utility functions that work with data items
	 */
	// click hanlder for opening folder window 
	var createFolder = function(event, item, pristineData) {
		// create new id from last counter value
		if ( !pristineData ) {
            var newId = $scope.counter = $scope.counter + 1;
        }
		$scope.windowData = dataService.windowHandler("folder", item, newId, $scope.dataSource, pristineData, createNewItem);
		$scope.windowData.language = $scope.defaultLanguage;
		$timeout(function(){
			$scope.$digest();
			$('#create-popup').removeClass('popup-close');
			$('#create-popup').show();
		}, 0);
	};
	// click handler for opening file window
	var createFile = function(event, item, pristineData) {
		// create new id from last counter value
		if ( !pristineData ) {
            var newId = $scope.counter = $scope.counter + 1;
        }
		$scope.windowData = dataService.windowHandler("file", item, newId, $scope.dataSource, pristineData, createNewItem);
		$scope.windowData.language = $scope.defaultLanguage;	
		$timeout(function(){
			$scope.$digest();
			$('#create-popup').removeClass('popup-close');
			$('#create-popup').show();
		}, 0);
	};
	// click handler for opening edit mode
	var editItem = function (event, item) {
		var windowData = "";
		if ( item.type === "folder" ) {
			windowData = {
				title: {
					eng: "Edit Folder", 
					yu: "Izmijeni Folder"
				},
				id: item.nodeId,
				type: item.type,
				location: item.location,
				name: item.nodeName
			};
			createFolder(event, null, windowData);
		} 
		else if ( item.type === "file" ) {
			windowData = {
				title: {
					eng: "Edit File", 
					yu: "Izmijeni Fajl"
				},
				id: item.nodeId,
				type: item.type,
				location: item.location,
				name: item.nodeName
			};
			createFile(event, null, windowData);
		}
	};
	// function that gatheres new information for saving
	var createNewItem = function(event, name, path, type, id, editMode) {
		var newItemIcon = "",
			newItemActions = [],
			newItemType = "",
			iconColor= ""; 
		switch ( type ) {
			case ".php": 
				newItemIcon = "fa-code";
				iconColor = "#a1c1e1";
				break;
			case ".js": 
				newItemIcon = "fa-jsfiddle";
				iconColor = "#31E161";
				break;
			case ".html": 
				newItemIcon = "fa-html5";
				iconColor = "#e88d48";
				break;	
			case ".css": 
				newItemIcon = "fa-css3";
				iconColor = "#e24d4f";
				break;	
			case "folder":
				newItemIcon = "fa-folder-open";
		}
		if ( editMode ) {
			dataService.folderSpider( id, $scope.dataSource, "edit", { name: name, type: type, icon: newItemIcon, color: iconColor });
			if ( type === "folder" ) {
			// if folder name is edited, update destinations array	
				$scope.availableFolderDestinations = dataService.updateDestinations($scope.foldersArray, $scope.dataSource);
			}
		} else {
			if ( type === "folder" ) {
			// when folder is created, update destination array 
				$scope.foldersArray.push(id);
				dataService.destinationArray = $scope.foldersArray;
				newItemActions = [{
					id: 1,
					actionName: {
						eng: "Create",
						yu: "Napravi"
					},
					specialActions: [{
						actionIcon: "fa-folder",
						color: "#787878",
						clickHandler: function(event, id) {
							createFolder(event, id);
						}
					},{
						actionIcon: "fa-file",
						color: "#e6e6e6",
						clickHandler: function(event, id) {
							createFile(event, id);
						}
					}],
					actionIcon: "fa-plus-circle",
					color: "#589858"
				}, {
					id: 2,
					actionName: {
						eng: "Edit Folder",
						yu: "Izmijeni Folder"
					},
					clickHandler: function (event, item) {
						editItem(event, item);
					},
					actionIcon: "fa-pencil",
					color: "#7333f0"
				}, {
					id: 3,
					actionName: {
						eng: "Delete Folder",
						yu: "Izbriši Folder"
					},
					clickHandler: function (event, item) {
						deleteItem(event, item);
					},
					actionIcon: "fa-trash",
					color: "#982828"
				}];
				newItemType = "folder";
			} else {
				newItemType = "file";
				newItemActions = [{
					id: 1,
					actionName: {
						eng: "Edit File",
						yu: "Izmijeni Fajl"
					},
					clickHandler: function (event, item) {
						editItem(event, item);
					},
					actionIcon: "fa-pencil",
					color: "#7333f0"
				}, {
					id: 2,
					actionName: {
						eng: "Delete File",
						yu: "Izbriši Fajl"
					},
					clickHandler: function (event, item) {
						deleteItem(event, item);
					},
					actionIcon: "fa-trash",
					color: "#982828"
				}];
			}
			var newItem = {
				nodeId: id,
				nodeName: name,
				type: newItemType,
				items: [],
				location: path,
				iconColor: iconColor,
				nodeIcon: newItemIcon,
				actions: newItemActions
			};
			if ( $scope.dataSource.nodeName ) {
				$scope.dataSource = [$scope.dataSource];
			}
			dataService.folderSpider( path.id, $scope.dataSource, true, newItem);
			// trigger treeview node directive event when new items are added
			$scope.$broadcast("evaluation", { nodeId: path.id, bindChildren: true });
		}
	};
	// function that deletes information
	var deleteItem = function (event, item) {
		dataService.folderSpider(item.nodeId, $scope.dataSource, "delete");
	};
	/*
	 *  Default data of application
	 */
	$scope.defaultLanguage = "eng";
	$scope.pickLanguage = function(lng){
		$scope.defaultLanguage = lng;
	};
	$scope.pageHeader = {
		eng: 'Folder structure simulation',
		yu: 'Simulacija strukture foldera'
	};
	$scope.defaultActions = [{
		name: {
			eng: "Create Folder",
			yu: "Napravi Folder"
		},
		clickHandler: createFolder
	},{
		name: {
			eng: "Create File",
			yu: "Napravi Fajl"
		}, 
		clickHandler: createFile
	}];
	$scope.dataSource = [{
		level: 0,
		nodeId: 0,
		nodeName: "Root",
		type: "folder",
		items: [],
		nodeIcon: "fa-folder-open",
		actions: [{
			actionName: {
				eng: "Create",
				yu: "Napravi"
			},
			specialActions: [{
				actionIcon: "fa-folder",
				color: "#787878",
				clickHandler: function(event, id) {
					createFolder(event, id);
				}
			},{
				actionIcon: "fa-file",
				color: "#e6e6e6",
				clickHandler: function(event, id) {
					createFile(event, id);
				}
			}],
			actionIcon: "fa-plus-circle",
			color: "#589858"
		}]
	}];
	$scope.$watchCollection('foldersArray', function( newArray, oldArray ){
		// when new folder is created, add its path to array, to make it 
		// available for future use in creation of new files and folders
		if ( newArray ) {
			if ( $scope.dataSource.nodeName ) {
				$scope.dataSource = [$scope.dataSource];
			}
			$scope.availableFolderDestinations = dataService.updateDestinations($scope.foldersArray, $scope.dataSource);
			$timeout(function(){
				$scope.$digest();
			}, 0);	
		}
	});
	$scope.foldersArray = dataService.destinationArray = [0];
	$scope.counter = 0;
}]);
devanaApp.directive("treeView", [function(){
	return {
		scope: {
			data: "=",
			defaultLanguage: "="
		},
		restrict: "AE",
		templateUrl: "app/templates/item-template.html",
		link: function( scope, element, arguments ) {
			if ( scope.data.nodeName ) {
				scope.data = scope.data[0];	
			}
		}
	}
}]);
devanaApp.directive("nodeItem", ["$compile",function($compile){
	return {
		restrict: "AE",
		scope: {
			child: "="
		},
		templateUrl: "app/templates/node-template.html",
		link: function( scope, element, arguments ) {
			
			scope.evaluateItems = function(){
				if ( scope.child.items.length > 0 && !scope.childrenBound ) {
				// when recursive directive should be compiled we must append
				// and compile both treeview directive element and actions ng-repeat 
				// directive because of multiplying iterations
					scope.childrenBound = true;
					// get actions template html, reset existing and compile again
					var actions = $('<span ng-include="\'app/templates/actions-template.html\'"></span>')
					$(element).find('#item-'+scope.child.nodeId+'-actions').empty();
					$(element).find('#item-'+scope.child.nodeId+'-actions').append(actions);
					// append recursive directive and compile it
					$(element).find('.node-items').append('<div tree-view data="child.items"></div>');
					$compile(element.contents())(scope);
				}
			};
			scope.$on('evaluation', function( event, params ) {
				if ( params && scope.child.nodeId === params.nodeId && params.bindChildren ) {
				// do this only once, when items are added for the first time	
					scope.evaluateItems();
				}
			});
		}
	}
}]);
devanaApp.directive("popupWindow", ['$timeout', function($timeout){
	return {
		scope: {
			windowData: "=",
			availableFolderDestinations: "="
		},
		restrict: "AE",
		templateUrl: "app/templates/window-template.html",
		link: function( scope, element, arguments ) {
			scope.$watch(arguments.availableFolderDestinations, function(newData,oldData){
				if ( newData ) {
					scope.availableFolderDestinations = newData;
					scope.path = scope.availableFolderDestinations[0];
				}
			});
			scope.$watch(arguments.windowData, function(newData,oldData){
				if ( newData ) {
					scope.windowData = newData;
					scope.language = scope.windowData.language;
					if ( scope.windowData.pickedDestination ) {
						scope.path = scope.windowData.pickedDestination;
					}
					if ( scope.windowData.fileTypes ) {
						scope.fileTypes = scope.windowData.fileTypes;
					}
					if ( scope.windowData.pristineName ) {
						scope.name = scope.windowData.pristineName;
					}
				}
			});
			scope.create = function(event){
				var validation = scope.validate();
				if ( validation ) {
					var type = scope.fileType ? scope.fileType : scope.windowData.type;
					scope.windowData.createHandler(event, scope.name, scope.path, type, scope.windowData.id, scope.windowData.edit);
					scope.close();
				}
			};
			scope.close = function(){
			// reset all scope variables and close window
				scope.path = scope.availableFolderDestinations[0];
				scope.name = "";
				scope.errorText = "";
				scope.fileType = "";
				scope.typePicker = false;
				scope.showDropdown = false;
				$(element).find('#create-popup').addClass('popup-close');
			};
			scope.inputFocus = function(event){
				scope.errorText = "";
			};
			scope.validate = function(){
				if ( scope.windowData.type === "folder" && !scope.name ) {
				// when folder name isn't inserted
					scope.errorText = {
						eng: "Name of the folder must be inserted!",
						yu: "Ime foldera mora biti unijeto!"
					};
					return false;
				} 
				else if ( scope.windowData.type === "file" ) {
					// when file name isn't inserted
					if ( !scope.name || scope.name.indexOf('.') === 0 ) {
						scope.errorText = {
							eng: "Name of the file must be inserted!",
							yu: "Ime fajla mora biti unijeto!"
						};
					}
					else {
						var nameSuffix = scope.name.indexOf('.');
						if ( nameSuffix === -1 ) {
							// when type isn't inserted
							scope.errorText = {
								eng: "Type of the file must be inserted!",
								yu: "Tip fajla mora biti unijet!"
							};
						} else {
							var insertedType = "";
							var validType = false;
							for ( var i = nameSuffix; i < scope.name.length; i++ ) {
								insertedType += scope.name[i];
							}
							$.each(scope.fileTypes, function( index, type ){
								if ( type.name === insertedType ) {
									validType = true;
									return false;
								}
							});
							if ( !validType ) {
								// when type isn't valid
								scope.errorText = {
									eng: "You didn't pick a valid type! Please pick one of the available.",
									yu: "Nije izabran validan tip fajla! Molimo vas izaberite jedan od ponudjenih."
								};
							} else {
								scope.fileType = insertedType;
								return true;
							}
						}
					}
				} else {
					return true;
				}
			};
			scope.pickPath = function(event, item){
				scope.path = item;
				scope.toggleDropdown(event, 'showDropdown');
			};
			scope.pickType = function(event, type){
				var nameInput = $(event.target).closest('.user-input').find('[role="item-name"]');
				var fileName = nameInput.val();
				var newFileName = "";
				var typeInsertedIndex = fileName.indexOf('.');
				if ( typeInsertedIndex !== -1 ) {
					// override existing type when picking new
					for ( var i = 0; i < fileName.length; i++ ) {
						if ( i < typeInsertedIndex ) {	
							newFileName += fileName[i];
						}
					}
				} else {
					newFileName = fileName;
				}
				// add type suffix to existing name
				newFileName += type.name;
				nameInput.val(newFileName);
				scope.name = newFileName;
				scope.toggleDropdown(event, 'typePicker');
				var validation = scope.validate();
				if ( validation ) scope.errorText = "";
			};
			scope.toggleDropdown = function(event, property){
				scope[property] = scope[property] ? false : true;
			};
		}
	}
}]);
devanaApp.service("dataService", [function(){
	var dataService = this;
	/*
	 *	This spider browses the data in search for desired file, based on its ID,
	 *  and can insert new file in existing folder, or return path to it, delete
	 *  or edit found node's properties
	 */
	this.folderSpider = function ( folderId, dataSource, insertMode, newItem, deleteFolder ) {
		// keep this data in variable, we may use it later :)
		var pristineData = dataSource;
		// pieces to form path
		var pathToFolder = [];
		// full string path
		var newPath = "";
		// when found, stop browsing
		var breakAllLoops = false;
		var searchForFolder = function( folderId, dataSource, insertMode, newItem, deleteFolder ){
			// iterate through given data
			$.each( dataSource, function( index, node ) {
				if ( !breakAllLoops ) {
				// if item is not found, continue iteration	
					if ( !deleteFolder ) {
						if ( node.nodeId === folderId ) {
							if ( insertMode === true ) {
							// when item should be inserted into folder
								newItem.level = node.level + 1;
								node.items.push(newItem);
							} 
							else if ( insertMode === "delete" && node.location.id >= 0 ) {
							// when item should be deleted from dataSource, first delete its
							// path from destination id array if type is folder, then item itself
								if ( node.type === "folder" ) {
									searchForFolder(node.nodeId, node.items, "deleteFolderPath", null, true);
									var nodeIndex = dataService.destinationArray.indexOf(node.nodeId);
									dataService.destinationArray.splice(nodeIndex, 1);
								}
								searchForFolder(node.location.id, pristineData, "deleteFromParent", node);
							} 
							else if (  insertMode === "deleteFromParent" ) {
							// when parent id is sent with id of child item that should be deleted	
								$.each(node.items, function( index, child ) {
									if ( child.nodeId === newItem.nodeId ) {
									// when poor child is finally found, kill him!
										node.items.splice(index, 1);
										// val'ar morghulis...
										return false;
									}
								});
							}
							else if ( insertMode === "edit" ) {
							// when found node should be altered
								node.nodeName = newItem.name;
								node.iconColor = newItem.color;
								node.nodeIcon = newItem.icon;
							}
							pathToFolder.splice(node.level, pathToFolder.length - 1);
							pathToFolder[node.level] = node.nodeName;
							breakAllLoops = true;
							return false;
						} 
						else if ( node.items && node.items.length !== 0 ) {
							// clear deeper levels if exist
							pathToFolder.splice(node.level, pathToFolder.length - 1);
							// update current level value
							pathToFolder[node.level] = node.nodeName;
							// go to the unsearched deeps
							searchForFolder(folderId, node.items, insertMode, newItem);
						} else {
							pathToFolder.splice(node.level, pathToFolder.length - 1);
						}
					}
					else if ( deleteFolder && node.type === "folder" ) {
					// when folder is deleted, its descendants must be 
					// also deleted from destination of folders array
						var folderIndex = dataService.destinationArray.indexOf(node.nodeId);
						// find folder id and remove it from an array
						dataService.destinationArray.splice(folderIndex, 1);
						if ( node.items && node.items.length > 0 ) {
						// search for this folder's descendants (node.items)
							searchForFolder(node.nodeId, node.items, "deleteFolderPath", null, true);	
						}			
					}
				}
			});
		};
		// execute spider function
		searchForFolder(folderId, dataSource, insertMode, newItem, deleteFolder);
		// concat path string from array of parts
		$.each( pathToFolder, function( index, node ) {
			newPath += "\\" + node;
		});
		return newPath;
	};
	this.updateDestinations = function( array, data ) {
		var destinations = [];
		$.each( array, function( index, folderId ){
			var folderSpecificPath = dataService.folderSpider( folderId, data, false );
			destinations.push({ id: folderId, name: folderSpecificPath });
		});
		return destinations;	
	};
	this.windowHandler = function ( nodeType, parentNode, nodeId, data, pristineData, callback ) {
		var windowData = {
			id: nodeId,
			labelForButton: {
				eng: "CREATE",
				yu: "NAPRAVI"
			},
			createHandler: function(event, name, path, type, id, editMode){
				callback(event, name, path, type, id, editMode);
			}
		};
		if ( data && data.nodeId ) {
		// convert data to array	
			data = [data];
		}
		if ( nodeType === "folder" ) {
		// default folder window data	
			windowData.type = "folder";
			windowData.title = {
				eng: "Create Folder", 
				yu: "Napravi Folder"
			};
			windowData.labelForName = {
				eng: "Insert Folder Name",
				yu: "Unesi Ime Foldera"
			};
		}
		else if ( nodeType === "file" ) {
		// default file window data	
			windowData.fileTypes = [{
				name: '.js',
				icon: 'fa-jsfiddle',
				color: '#31E161'
			},{
				name: '.php',
				icon: 'fa-code',
				color: '#a1c1e1'
			},{
				name: '.html',
				icon: 'fa-html5',
				color: '#e88d48'
			},{
				name: '.css',
				icon: 'fa-css3',
				color: '#e24d4f'
			}];
			windowData.type = "file";
			windowData.title = {
				eng: "Create File", 
				yu: "Napravi Fajl"
			};
			windowData.labelForName = {
				eng: "Insert File Name",
				yu: "Unesi Ime Fajla"
			};
		}
		if ( parentNode && parentNode.nodeId !== undefined ) {
		// when specific path exists, insert new item in selected parent
			var pickedPathName = dataService.folderSpider( parentNode.nodeId, data, false );
			var availablePath = { id: parentNode.nodeId, name: pickedPathName };
			// prepare data for popup window
			windowData.pickedDestination = availablePath;
			if ( nodeType === "folder" ) {
				windowData.labelForPath = {
					eng: "Picked Folder Path",
					yu: "Izabrana Lokacija Foldera"
				};
			} 
			else if ( nodeType === "file" ) {
				windowData.labelForPath = {
					eng: "Picked File Path",
					yu: "Izabrana Lokacija Fajla"
				};
			}
		} else {
		// when path needs to be specified
			if ( nodeType === "folder" ) {
				windowData.labelForPath = {
					eng: "Insert Folder Path",
					yu: "Unesi Lokaciju Foldera"
				};
			}
			else if ( nodeType === "file" ) {
				windowData.labelForPath = {
					eng: "Insert File Path",
					yu: "Unesi Lokaciju Fajla"
				};
			}
		}
		if ( pristineData ) {
		// when edit mode is active
			windowData.title = pristineData.title;
			windowData.id = pristineData.id;
			windowData.type = pristineData.type;
			windowData.pristineName = pristineData.name;
			windowData.pickedDestination = pristineData.location;
			windowData.edit = true;
		}
		return windowData;
	};
	this.destinationArray = [];
}]);
devanaApp.filter("unique", function(){
	return function( collection, property ) {
	// this filter returns unique array of elements
	// based on items ide value	
		var arrayOfIds = [];
		$.each( collection, function( index, item ){
			if ( arrayOfIds.indexOf(item.id) < 0 ) {
				arrayOfIds.push(item);
			}
		});
		return arrayOfIds;
	}
});