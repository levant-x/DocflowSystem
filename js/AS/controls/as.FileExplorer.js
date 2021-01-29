var as = as || {};

as.fe = {
	curDirectory: '',
	curElementData: {},
	options: {
		loadSysLib: true,
		ajax: {
			loadFileEditor: '/FileEditor/loadFileEditor',
			loadDir: '/FileEditor/loadDir',
			uploadFiles: '/Handlers/feUploadFilesHandler.ashx',
			createDir: '/FileEditor/createDir',
			deleteFile: '/FileEditor/deleteFile',
			renameFile: '/FileEditor/renameFile',
			renameDir: '/FileEditor/renameDir',
			deleteDir: '/FileEditor/deleteDir',
			getTextFile: '/FileEditor/getTextFile',
			saveTextFile: '/FileEditor/saveTextFile'
		},
		folderID: ''
	},
	init: function (options) {
		as.fe.options = $.extend(as.fe.options, options);
		if (as.fe.options.loadSysLib) {
			as.sys.init();
		}
		$(document).delegate('.feBtn', 'click', function (e) {
			e.preventDefault();
			as.fe.showFileEditorDialog($(this));
		});
		$(document).delegate('.feDirLink', 'click', function (e) {
			e.preventDefault();
			as.fe.loadDir($(this).attr('data-name'));
		});
		$(document).delegate('.feFileLink', 'click', function (e) {
			e.preventDefault();
			as.fe.selectFile($(this));
		});
		$(document).delegate('.feFile', 'mouseenter mouseleave', function (event) {
			if (event.type === 'mouseenter') {
				var ext = $(this).attr('data-ext');
				if (ext == ".png" || ext == ".gif" || ext == ".jpg" || ext == ".jpeg") {
					var url = $(".feFileLink>img", this).attr('src');
					$(this).append("<a href='" + url + "' class='feZoom'><img src='/Content/fe/zoom.png' title='" + as.resources.fileEditor_init_increasTitle + "' /></a>");
				} else {
					if (ext == ".txt" || ext == ".js" || ext == ".css" || ext == ".php") {
						$(this).append("<a href='#' class='feOpen'><img src='/Content/fe/open.png' title='" + as.resources.fileEditor_init_OpenTitle + "' /></a>");
					}
					else {
						var url = $(this).attr('data-url');
						$(this).append("<a href='" + url + "' target='_blank' class='feDownload'><img src='/Content/images/download.png' title='" + as.resources.fileEditor_init_LoadTitle + "' /></a>");
					}
				}
			} else {
				$(".feZoom, .feOpen, .feDownload", this).remove();
			}
		});
		$(".feZoom").fancybox({
			overlayShow: true,
			overlayOpacity: 0.5,
			zoomSpeedIn: 1500,
			zoomSpeedOut: 600
		});
		$(document).delegate('.feOpen', 'click', function (e) {
			e.preventDefault();
			var url = $(this).closest('.feFile').attr('data-url');
			var name = $(this).closest('.feFile').attr('data-name');
			$('.feManager').attr('data-url', url);

			var s = [];
			s.push("<div class='feEditFile'>");
			s.push("<h4>" + as.resources.fileEditor_init_EditFile + "</h4>");
			s.push("<textarea class='feEditFileText' id='feEditFileText'></textarea><br />");
			s.push("<input type='button' class='btn btn-primary feEditFileBtn' value='" + as.resources.fileEditor_init_BtnSave + "' /> <input type='button' class='btn btn-default feEditFileCloseBtn' value='" + as.resources.fileEditor_init_BtnClose + "' />");
			s.push("</div>");
			as.sys.showMessage(s.join(""));
			as.sys.ajaxSend(as.fe.options.ajax.getTextFile, { url: url }, function (data) {
				//data = eval('(' + data + ')');
				$('.feEditFileText').val(data.text);
				$('.feEditFile>h4').html(as.resources.fileEditor_init_EditFile + name);

				if (cm && cm.sys) {
					var mode = cm.sys.mode.html;
					if (url.endsWith(".css")) mode = cm.sys.mode.css;
					if (url.endsWith(".js")) mode = cm.sys.mode.javascript;

					var el = document.getElementById("feEditFileText");
					as.fe.fileElement = cm.sys.init(el, mode);
				}
			});
		});

		$(document).delegate('.feEditFileBtn', 'click', function (e) {
			e.preventDefault();
			var url = $('.feManager').attr('data-url');

			var text = $('.feEditFileText').val();
			if (cm && cm.sys) {
				text = cm.sys.getValue(as.fe.fileElement);
			}
			var params = { url: url, text: text };
			// console.log(params);
			as.sys.ajaxSend(as.fe.options.ajax.saveTextFile, params, function (data) {
				//data = eval('(' + data + ')');
				as.sys.bootstrapAlert(as.resources.fileEditor_init_SaveMassage, { type: 'success' });
			});

		});
		$(document).delegate('.feEditFileCloseBtn', 'click', function (e) {
			e.preventDefault();
			as.sys.closeMessage();
		});

		$(document).delegate('.feAddFolder', 'click', function (e) {
			e.preventDefault();
			var newDir = prompt(as.resources.fileEditor_init_promptFolder1, as.resources.fileEditor_init_promptFolder2);
			if (newDir) {
				var isExist = false;
				$(".feDirLink").each(function () {
					if ($(this).attr('data-name').toUpperCase() == newDir.toUpperCase()) {
						isExist = true;
					}
				});
				if (isExist) {
					alert(as.resources.fileEditor_init_AertFolderIsExist);
					return;
				}
				var cont = $(this).closest('.feManager');
				var currDir = $('.feSelDir').attr('data-name');
				var newDirFull = currDir + "/" + newDir;
				as.sys.ajaxSend(as.fe.options.ajax.createDir, { dir: newDirFull, shared: cont.attr('data-shared'), type: cont.attr('data-type'), id: cont.attr('data-id') }, function (data) {
					//data = eval('(' + data + ')');
					// $('.feDirs>ul').append("<li><a href='#' class='feDirLink' data-name='" + newDirFull + "'>" + newDir + "</a></li>");
					var ulCount = $('.feSelDir').closest('li').children('ul').length;
					if (ulCount == 0) {
						$('.feSelDir').closest('li').prepend("<span class='feDirsSwitch' style='display: inline-block; width: 10px; height: 10px; cursor: pointer; position: absolute; top:6px; left:0; background-image: url(http://localhost:52390/Content/images/minus.png);'></span>");
						$('.feSelDir').closest('li').append("<ul style='margin-left: 10px; '><li style='position: relative;padding-left: 4px;'><a href='#' class='feDirLink' data-name='" + newDirFull + "'>" + newDir + "</a></li></ul>");
						$('.feSelDir').closest('li').children('.feDirsSwitch').click(function (e) {
							var im = $(e.target).css("background-image");
							if (im.indexOf("plus") >= 0) {
								$(e.target).css("background-image", "url(/Content/images/minus.png)");
								$(e.target).parent().children("ul").show();
							} else {
								$(e.target).css("background-image", "url(/Content/images/plus.png)");
								$(e.target).parent().children("ul").hide();
							}
						});

					}
					if (ulCount == 1) { $('.feSelDir').closest('li').children('ul').append("<li style='position: relative;padding-left: 4px;' ><a href='#' class='feDirLink' data-name='" + newDirFull + "'>" + newDir + "</a></li>") }

					//$('.feDirsSwitch').click(function (e) {
					//    var im = $(e.target).css("background-image");
					//    if (im.indexOf("plus") >= 0) {
					//        $(e.target).css("background-image", "url(/Content/images/minus.png)");
					//        $(e.target).parent().children("ul").show();
					//    } else {
					//        $(e.target).css("background-image", "url(/Content/images/plus.png)");
					//        $(e.target).parent().children("ul").hide();
					//    }
					//});
					as.fe.loadDir(newDirFull);
				});
			} else {
				if (result == "") {
					alert(as.resources.fileEditor_init_AertNotNameFolder);
					return;
				}
			}
		});

		$(document).delegate('.feDeleteFile', 'click', function (e) {
			e.preventDefault();
			if (confirm(as.resources.fileEditor_init_ConfirmDellFile) == false) return false;
			as.fe.deleteSelectedFile();
		});

		$(document).delegate(".feRenameFile", "click", function (e) {
			e.preventDefault();
			var file = $('.feSelFile');
			if (file.length != 1) {
				as.sys.bootstrapAlert(as.resources.fileEditor_init_AertNotSelectFile, { type: 'warning' });
				return;
			}

			var fileName = file.attr('data-name');
			var dirName = $('.feSelDir').attr('data-name');
			var s = [];
			s.push("<div>");
			s.push(as.resources.fileEditor_init_AertNewNameFile);
			s.push("<input type='text' id='fe-new-filename' value='" + fileName + "' />");
			s.push("</div>");

			as.sys.showDialog(as.resources.fileEditor_init_ShowDialogRename1 + fileName, s.join(""), as.resources.fileEditor_init_ShowDialogRename2, function () {
				var newName = $("#fe-new-filename").val();
				if (newName == fileName) {
					return;
				}

				var cont = $('.feManager');
				var params = {
					dir: dirName,
					file: fileName,
					shared: cont.attr('data-shared'),
					type: cont.attr('data-type'),
					id: as.fe.options.folderID,// cont.attr('data-id'),
					newName: newName
				};


				as.sys.ajaxSend(as.fe.options.ajax.renameFile, params, function (data) {
					//data = eval('(' + data + ')');
					if (data.result) {
						as.fe.loadDir(dirName);
						$('.feDeleteFile').addClass('hide');
						$('.feRenameFile').addClass('hide');
					} else {
						as.sys.bootstrapAlert(as.resources.fileEditor_init_AlertNotRename, { type: "danger" });
					}
				});

				as.sys.closeDialog();
			}, false);
		});

		$(document).delegate(".feRenameDir", "click", function (e) {
			e.preventDefault();

			var fullDirName = $('.feSelDir').attr('data-name');
			var shortName = $('.feSelDir').text();
			var s = [];
			s.push("<div>");
			s.push("" + as.resources.fileEditor_init_NewNameFile + "");
			s.push("<input type='text' id='fe-new-dirname' value='" + shortName + "' />");
			s.push("</div>");
			as.sys.showDialog(as.resources.fileEditor_init_ShowDialogRenameDir1 + shortName, s.join(""), as.resources.fileEditor_init_ShowDialogRenameDir2, function () {
				var newName = $("#fe-new-dirname").val();
				if (newName == shortName) {
					return;
				}

				var cont = $('.feManager');
				var params = {
					dir: fullDirName,
					shared: cont.attr('data-shared'),
					type: cont.attr('data-type'),
					id: as.fe.options.folderID,// cont.attr('data-id'),
					newName: newName
				};

				as.sys.ajaxSend(as.fe.options.ajax.renameDir, params, function (data) {
					//data = eval('(' + data + ')');
					if (!data.result) {
						as.sys.bootstrapAlert(as.resources.fileEditor_init_AlertNotRenameDir, { type: "danger" });
						return;
					}

					$('.feSelDir').text(newName);
					fullDirName = fullDirName.replace(new RegExp(shortName + '$'), newName);
					$('.feSelDir').attr('data-name', fullDirName);
					$('.feDeleteFile').addClass('hide');
					$('.feRenameFile').addClass('hide');
				});

				as.sys.closeDialog();
			}, false);
		});

		$(document).delegate('.feDeleteDir', 'click', function (e) {
			e.preventDefault();
			if (confirm(as.resources.fileEditor_init_ConfirmDelFolder) == false) return false;
			as.fe.deleteSelectedDir();
		});

		$(document).keydown(function (event) {
			//19 for Mac Command+S
			if (!(String.fromCharCode(event.which).toLowerCase() == 's' && event.ctrlKey) && !(event.which == 19) || $('.feEditFile:visible').length == 0) return true;
			$('.feEditFileBtn').trigger('click');
			event.preventDefault();
			return false;
		});

		
	},
	setUpload: function () {
		$('#feUpload').attr('data-url', as.fe.options.ajax.uploadFiles).fileupload({
			dataType: 'json',
			done: function (e, data) {
				var s = [];
				s.push("<h4>" + as.resources.fileEditor_setUpload_Success + "</h4>");
				$.each(data.result.files, function (index, file) {
					s.push("<p>" + file.Name + "</p>");
				});
				as.sys.bootstrapAlert(s.join(""), { type: "success" });
				as.fe.loadDir(as.fe.curDirectory);
			}
		}).bind('fileuploadsubmit', function (e, data) {
			// The example input, doesn't have to be part of the upload form:
			var cont = $('.feManager');
			data.formData = { dir: as.fe.curDirectory, shared: cont.attr('data-shared'), type: cont.attr('data-type'), name: cont.attr('data-name'), id: cont.attr("data-id") };
		});
	},
	showFileExplorerDialog: function (HeaderFE,TypeFiles,BtnVal,windowFE, callback, options) {

	    options = options || {};
	    as.fe.curElementData = {};
	    var s = [];
	  

		s.push("<div class='feManager' data-shared='" + (options.folderShared || "0") + "' data-type='" + (options.folderType || "") +
			"' data-name='" + (options.folderName || "") + "' data-id='" + (as.fe.options.folderID || "") + "' >");
	
		s.push("<div class='feUpload well well-sm'>" +
			"<div class='feToolbar'>" +
			"<a href='#' class='feDeleteDir'>" + as.resources.fileEditor_showFileEditorDialogd_Del + "<i class='glyphicon glyphicon-remove'></i></a>" +
			"<a href='#' class='feRenameDir'>" + as.resources.fileEditor_showFileEditorDialog_Rename + "<i class='glyphicon glyphicon-pencil'></i></a>" +
			"<a href='#' class='feDeleteFile hide'>" + as.resources.fileEditor_showFileEditorDialog_DelFile + "<i class='glyphicon glyphicon-remove'></i></a>" +
			"<a href='#' class='feRenameFile hide'>" + as.resources.fileEditor_showFileEditorDialog_RenameFile + "<i class='glyphicon glyphicon-pencil'></i></a>" +
			"</div>" +

			"<input id='feUpload' type='file' name='files[]' data-url='' multiple accept='"+TypeFiles+"'>" +
		"</div>");
		s.push("<div class='feDirs'><ul>");

		
		
		as.sys.ajaxSend(as.fe.options.ajax.loadFileEditor, { shared: options.folderShared, type: options.folderType, id: as.fe.options.folderID }, function (data) {

		    function BtnChange() {
		        var selFile = $('.feSelFile');
		        if (selFile.length != 1 && callback) {
		            as.sys.bootstrapAlert(as.resources.fileEditor_showFileEditorDialog_AlertNotSelectFile, { type: 'warning' });
		            return;
		        }
		        as.fe.curElementData = $('.feSelFile');
		        var url = $('.feSelFile').attr('data-url');
		        if (callback) callback(url, as.fe.curElementData);
		        as.sys.closeDialog(windowFE);
		    }

		    $(document).delegate('.feSelFile', 'dblclick', function (e) {
		        BtnChange();
		    });

			addDir(data, "");

			function addDir(dir, parent) {
				var name = dir.name;
				var fname = dir.name;
				var cl = "";
				if (!name) {
					name = "Начало";
					fname = "";
					cl = "feRoot";
				}

				var newParent = parent ? parent + "/" + fname : fname;
				var needSwitch = fname !== "" && dir.dirs && dir.dirs.length > 0;
				s.push("<li class='" + cl + "' style='position: relative;padding-left: 4px;'>" +
                    (needSwitch ? "<span class='feDirsSwitch' style='display: inline-block; width: 10px; height: 10px; cursor: pointer; position: absolute; top:6px; left:0;'></span>" : "") +
                    "<a href='#' class='feDirLink' data-name='" + newParent + "'>" + name + "</a>");
				if (dir.dirs && dir.dirs.length > 0) {
					s.push("<ul style='margin-left: 10px; " + (needSwitch ? "display:none;" : "") + "'>");
					$.each(dir.dirs, function (i, dr) {
						addDir(dr, newParent);
					});
					s.push("</ul>");
				}

				s.push("</li>");
			}

			    s.push("</ul></div>");
			    s.push("<div class='feFiles'></div>");
			    s.push("<div class='feDesc'><a href='#' class='feAddFolder'><i class='glyphicon glyphicon-plus-sign'></i>" + as.resources.fileEditor_showFileEditorDialog_AddFolder + "</a><span>" + as.resources.fileEditor_showFileEditorDialog_Descrip + "</span><input type='text' class='feAlt' /></div>");
			    s.push("</div>");
			
			    as.sys.showDialog(HeaderFE, s.join(""), BtnVal, function () {
			        BtnChange();
			    }, windowFE);
			// загружаем первую категорию
			if (data.dirs.length > 0) {
				setTimeout(function () {
					var dirName = data.dirs[0].name;
					for (var i = 0; i < data.dirs.length; i++) {
						if ((data.dirs[i].name || "").toLowerCase() == "images") {
							dirName = data.dirs[i].name;
							break;
						}
					}

					as.fe.loadDir(dirName);
					as.fe.setUpload();
				}, 200);
			};
		});
		
		
	
	},
	loadDir: function (dir) {
		as.fe.curDirectory = dir;
		$('.feDeleteFile').addClass('hide');
		$('.feRenameFile').addClass('hide');

		$('.feDirLink').removeClass('feSelDir');
		$('.feDirLink[data-name="' + dir + '"]').addClass('feSelDir');

		var cont = $('.feManager');
		as.sys.ajaxSend(as.fe.options.ajax.loadDir, { dir: dir, shared: cont.attr('data-shared'), type: cont.attr('data-type'), id: cont.attr('data-id') }, function (data) {
			//data = eval('(' + data + ')');
			var s = [];
			$.each(data.files, function (i, file) {
				var img = "";
				var imageFile = "file.png";

				switch (file.ext) {
					case ".mp3":
					case ".wma":
						imageFile = "audio.png"; break;
					case ".doc":
					case ".docx":
					case ".odt":
						imageFile = "docx.png"; break;
					case ".xls":
					case ".xlsx":
						imageFile = "excel.png"; break;
					case ".pdf":
						imageFile = "pdf.png"; break;
					case ".txt":
						imageFile = "txt.png"; break;
					case ".avi":
					case ".mp4":
						imageFile = "video.png"; break;
					case ".7z":
					case ".zip":
					case ".rar":
					case ".gz":
						imageFile = "zip.png"; break;
					case ".css":
						imageFile = "css.png"; break;
					case ".js":
						imageFile = "js.png"; break;
				}
				var imageURL = "";
				var itemName = "";
				if (file.ext == ".png" || file.ext == ".jpg" || file.ext == ".jpeg" || file.ext == ".gif") {
					imageURL = file.url;
					itemName = file.name + " (" + file.width + " х " + file.height + ")";
				} else {
					imageURL = "/Content/images/filetypes/" + imageFile;
					itemName = file.name;
				};

				s.push("<div class='feFile' data-name='" + file.name + "' data-url='" + file.url + "' data-ext='" + file.ext + "' w='" + (file.width || 0) + "' h='" + (file.height || 0) + "'><a href='#' class='feFileLink' title='" + file.name + "' ><img src='" + imageURL + "' /><span>" + itemName + "</span></a></div>");
			});
			$('.feFiles').html(s.join(""));
		});
	},
	selectFile: function (file) {
		$('.feFile').removeClass("feSelFile");
		file.closest('.feFile').addClass("feSelFile");
		$('.feDeleteFile').removeClass('hide');
		$('.feRenameFile').removeClass('hide');
	},
	deleteSelectedFile: function () {
		var file = $('.feSelFile');
		var fileName = file.attr('data-name');
		var dirName = $('.feSelDir').attr('data-name');

		var cont = $('.feManager');
		as.sys.ajaxSend(as.fe.options.ajax.deleteFile, { dir: dirName, file: fileName, shared: cont.attr('data-shared'), type: cont.attr('data-type'), id: cont.attr('data-id') }, function (data) {
			// data = eval('(' + data + ')');
			if (!data.result) {
				as.sys.bootstrapAlert(as.resources.fileEditor_deleteSelectedFile_AlertErrorDelFile, { type: "danger" });
				return;
			}

			file.hide(100, function () { $(this).remove(); });
			$('.feDeleteFile').removeClass('hide');
			$('.feRenameFile').removeClass('hide');
		});
	},
	deleteSelectedDir: function () {
		var dirName = $('.feSelDir').attr('data-name');

		var cont = $('.feManager');

		as.sys.ajaxSend(as.fe.options.ajax.deleteDir, { dir: dirName, shared: cont.attr('data-shared'), type: cont.attr('data-type'), id: cont.attr('data-id') }, function (data) {
			//data = eval('(' + data + ')');
			if (!data.result) {
				as.sys.bootstrapAlert(as.resources.fileEditor_deleteSelectedFile_AlertErrorDelFolder, { type: "danger" });
				return;
			}
			//$('.feSelDir').closest('ul').closest('li').find('a');
			$('.feSelDir').hide(100, function () {
				var parent = $('.feSelDir').closest('ul').closest('li');
				var childrens = $('.feSelDir').closest('ul').children('li');
				if (childrens.length <= 1) { $(parent).children('span').remove(); $(this).closest('ul').remove(); }
				$(this).closest('li').remove();
				$(".feDirLink:first").addClass('feSelDir');
				as.fe.loadDir($('.feSelDir').attr('data-name'));
			});


		});
	}
}