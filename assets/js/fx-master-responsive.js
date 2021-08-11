
window.log = function(){
  log.history = log.history || [];
  log.history.push(arguments);
  if(this.console) {
      arguments.callee = arguments.callee.caller;
      console.log( Array.prototype.slice.call(arguments) );
  }
};
 
// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});

//
// fdxPlayYoutube
//
// Plays a youtube video
//
// e (object) / youtubeID (string) / videoName (string)
//
if (!window.fdxPlayYoutube) {
	function fdxPlayYoutube(e, youtubeID,videoName,videoType,videoParam) {
		var videoPlay = '//www.youtube.com/embed/';
		var videoAnt = 'Video:YT:';
		if(videoType == "YouKu"){
				videoPlay = '//player.youku.com/embed/';
				videoAnt = 'Video:YK:';
		}
		var winProt = window.location.protocol;
		var elParent = e.parentNode;
		var embedWidth = elParent.offsetWidth;
		var embedHeight = elParent.offsetHeight;
		// check if in auto rotate slideshow and trigger click on active
		// to cancel auto rotate timeout
		var isInSlideshow = $(e).parents('.fx-slideshow').length > 0;
		if (isInSlideshow) {
			var autoRotateData = $(e).parents('.fx-slideshow').data('autoRotate');
			if (autoRotateData === 'true' || autoRotateData === true) {
				$(e).parents('.fx-slideshow').find('.fx-slide-controls li.active').click();
			}
		}
		if (typeof videoParam === 'undefined') { videoParam = '';}
		// 10 ms timeout to leave enough time for auto rotate cancel click trigger
		var injectVideoTimeout = setTimeout(function() {
			elParent.innerHTML = '<iframe class="fx-playing" src="'+winProt+videoPlay+youtubeID+'?rel=0&autoplay=1&wmode=transparent'+videoParam+'" frameborder="0" style="width:'+embedWidth+'px;height:'+embedHeight+'px;display:block;" allowfullscreen></iframe>';
			var PageName = s.pageName;
			logLinkView(videoAnt + videoName + ":" + PageName);
		}, 10);
	}
}

//
// fdxCreateSlideshow
//
// Create an instance of a slideshow
//
// slideshowWrapper (object) / autoRotate (boolean)
//
if (!window.fdxCreateSlideshow) {
	function fdxCreateSlideshow(slideshowWrapper, autoRotate) {

		// Setup basic options
		var rotate           = autoRotate ? autoRotate : false,
			rotateSpeed      = 9000,

		// Setup event control objects
			pagerControls    = slideshowWrapper.find('.fx-slide-controls li'),
			prevNextControls = slideshowWrapper.find('.fx-slide-prevnext a'),
			bannerItems      = slideshowWrapper.find('.fx-slides li');

		// Go to a specific slide when passed the index
		var goToSlide = function(ind) {

			// Get the target objects to enable and disable
			var nonTargets = bannerItems.not(':eq('+ind+')').add(pagerControls.not(':eq('+ind+')')),
				newTargets = bannerItems.eq(ind).add(pagerControls.eq(ind));

			// Toggle active classes
			nonTargets.removeClass('active');
			newTargets.addClass('active');
		};

		// Pager controls
		pagerControls.click(function(e) {

			// Clear interval on rotate timer
			if (autoRotate) {
				clearInterval(rotateTimer);
			}

			// Pause any youtube videos
			$(this).parents('.fx-slideshow').find('.fx-video').each(function() {
				var playerFrame = $(this).find('iframe'),
					playerSrc = playerFrame.attr('src');

				if (playerSrc !== 'undefined' && playerFrame.length > 0 && playerFrame.hasClass('fx-playing')) {
					playerFrame.attr('src', '');
					playerFrame.attr('src', playerSrc.replace('&autoplay=1', ''));
				}
			});

			// Call the goTo method and pass current index
			goToSlide($(this).index());

			e.preventDefault();
		});

		// Prev/next controls
		prevNextControls.click(function(e) {

			// Get current active pager object and set targetIndex to next
			var currentPager = slideshowWrapper.find('.fx-slide-controls li.active'),
				targetIndex  = currentPager.next().length < 1 ? 0 : currentPager.next().index();

			// If going prev, reset targetIndex
			if ($(this).hasClass('prev')) {
				targetIndex = currentPager.prev().length < 1 ? slideshowWrapper.find('.fx-slide-controls li:last').index() : currentPager.prev().index();
			}

			// Clear interval on rotate timer
			if (autoRotate) {
				clearInterval(rotateTimer);
			}

			// Call the goTo method
			goToSlide(targetIndex);

			e.preventDefault();
		});


		// Hide controls when 1 or less items
		if (bannerItems.length < 2) {
			slideshowWrapper.find('.fx-slide-controls').hide();
		} else {
			// Auto rotate
			if (autoRotate) {
				// Set Timer to trigger click on the next banner pager
				var rotateTimer = setInterval(function(){

					// Get current active and go to next
					var curPag   = slideshowWrapper.find('.fx-slide-controls li.active'),
						nextInd  = curPag.next().length < 1 ? 0 : curPag.next().index();

					// Call the goTo method
					goToSlide(nextInd);

				}, rotateSpeed);
			}
		}

	}
}

//
// fdxSyncHeights
//
// Syncs heights of columns for the perfect layout
//
//
if (!window.fdxSyncHeights) {
	function fdxSyncHeights() {
		if ($('.fx-sync-heights').length > 0) {

			$('.fx-sync-heights .fx-block').removeAttr('style');

			$('.fx-sync-heights').each(function() {
				var blockTallest = 0,
					syncBlocks = $(this).find('.fx-block');

				if ($(window).width() > 599) {
					$(syncBlocks).each(function() {
						var thisHeight = $(this).height();
						
						if(thisHeight > blockTallest) {
							blockTallest = thisHeight;
						}
					});

					$(syncBlocks).each(function() {
						$(this).css('minHeight', blockTallest+'px');
					});

				}
			});
		}
	}
}

//
// fdxAutoLayout
//
// Pure magic
//
if (!window.fdxAutoLayout) {
	function fdxAutoLayout() {

		var inLiveSiteEditor = $('#page-edit-html').length > 0;

		var runFdxAutoLayout = function() {
			// console.log('Initiating Auto Layout...');

			var layoutSelector = '.fx-grid';
			var wrappingSelector = '.ls-cmp-wrap';
			var layoutBreakClass = 'fdxLayoutBreak';
			var numLayouts = $(layoutSelector).length;
			var hasLayouts = numLayouts > 0;

			if (hasLayouts && !$('body').hasClass('fdxAutoLayoutUsed')) {

				if (numLayouts === 1) {
					// console.log('Only 1 layout on this page...');
				} else {
					// console.log('Page has '+numLayouts+' layouts...');
				}

				$(layoutSelector).each(function() {
					// console.log('LAYOUT:'+ $(this).attr('class'));
					$(this).parents(wrappingSelector).addClass(layoutBreakClass);
				});

				$('.'+layoutBreakClass).each(function() {

					var nextIsLayout = $(this).next().hasClass(layoutBreakClass);
					if (!nextIsLayout) {

						var inLayoutNow = $(this).find(layoutSelector);
						var layoutClasses = inLayoutNow.attr('class').replace(layoutSelector, '');
						var hasInnerGrid = inLayoutNow.find('.fx-inner-grid').length > 0;
						var defaultAddToCol = hasInnerGrid ? inLayoutNow.find('.fx-col:first .fx-inner-grid') : inLayoutNow.find('.fx-col:first');
						var layoutBlocks = $(this).nextUntil('.'+layoutBreakClass);
						var numLayoutBlocks = layoutBlocks.length;

						defaultAddToCol.addClass('fdxLayoutDropZone');

						var currentLayout = '1';

						if (layoutClasses.match(/fx-1-2/)) {
							currentLayout = '1-2';
						}
						if (layoutClasses.match(/fx-2-1/)) {
							currentLayout = '2-1';
						}
						if (layoutClasses.match(/fx-2-2/)) {
							currentLayout = '2-2';
						}
						if (layoutClasses.match(/fx-1-3/)) {
							currentLayout = '1-3';
						}
						if (layoutClasses.match(/fx-3-1/)) {
							currentLayout = '3-1';
						}
						if (layoutClasses.match(/fx-3/)) {
							currentLayout = '3';
						}
						if (layoutClasses.match(/fx-4/)) {
							currentLayout = '4';
						}

						// console.log('Parsing '+currentLayout+' Layout...');
						
						if (numLayoutBlocks > 0) {

							if (numLayoutBlocks === 1) {
								// console.log('Found only 1 block');
							} else {
								// console.log('Found '+numLayoutBlocks+' blocks');
							}

							layoutBlocks.each(function() {

								var thisBlock = $(this);

								var liveEditMode = thisBlock.attr('fx_type');
								if (typeof liveEditMode !== 'undefined' && liveEditMode !== false) {
									// console.log('LIVESITE SCRIPT REMOVAL!');
									thisBlock.find('script').remove();
								}

								var isBlockDivider = thisBlock.find('.fx-divider').length > 0;
								if (isBlockDivider) {

									// console.log('Divider block found --- setting new drop zone.');

									var newTargetAddToCol = hasInnerGrid ? inLayoutNow.find('.fdxLayoutDropZone').parent().next().find('.fx-inner-grid') : inLayoutNow.find('.fdxLayoutDropZone').next();

									$('.fdxLayoutDropZone').removeClass('fdxLayoutDropZone');
									newTargetAddToCol.addClass('fdxLayoutDropZone');

									thisBlock.remove();

								} else {

									var appendToLayoutCol = inLayoutNow.find('.fdxLayoutDropZone');
									thisBlock.appendTo(appendToLayoutCol);
									// console.log('Moved block '+thisBlock.attr('id')+' to layout '+currentLayout);

								}

							});

							
						} else {
							// console.log('Found 0 blocks.');
						}

					} else {
						// console.log('Next block is another layout...skipping over.');
					}

				});
				
				// console.log('Auto layout complete!')
				$('body').addClass('fdxAutoLayoutUsed');
				fdxSyncHeights();
				
			} else {
				if ($('body').hasClass('fdxAutoLayoutUsed')) {
					// console.log('Auto layout already completed on this page! Aborting.');
				} else {
					// console.log('Sorry, no layouts being used on this page. Aborting.');
				}
			}
		}


		if (inLiveSiteEditor && $('#content').hasClass('fx-tiles')) {
			// console.log('IN LIVESITE EDITOR! Adding Layout Controls...');
			var respControlsMarkup = '<div class="fdxControls fullMode fx-cf"><a href="#" class="refresh"><span>Layout Edit</span></a><a href="#" class="runLayout"><span>Layout Preview</span></a></div>';

			$('<div id="fdxResponsiveControls">'+respControlsMarkup+'</div>').insertBefore($('#content'));

			$(document).on('click', '#fdxResponsiveControls a', function(e) {
				var thisControl = $(this).attr('class');

				if (thisControl === 'refresh') {
					window.location.reload();
				}

				if (thisControl === 'runLayout') {
					runFdxAutoLayout();
					fdxAutoTabs(true);
					fdxShowHideSags(true);
					fdxHandleCustomForm("runLayout");
					$('.fdxControls').removeClass('fullMode').addClass('layoutMode');
				}

				e.preventDefault();
			});

		} else {
			runFdxAutoLayout();
		}

	}
}

function fdxAutoTabs() {

	var runFdxAutoTabs = function() {
		// console.log('Initiating Auto Tabs...');

		if ($('.fx-tabs').length > 0 && !$('body').hasClass('fdxAutoTabsUsed')) {
			var tabCount = 1;

			// set first tab marker classes
			$('.fx-tabs:first').parent().parent().addClass('fdxFirstTab').find('.fx-slideshow').append('<div class="fx-slides"><ul><li></li></ul></div>');

			// set last tab ending marker classes
			$('.fx-tabs-ending').parent().parent().addClass('fdxTabsBreak fdxLastTab');

			// prep each tab and build the main wrapper structure
			$('.fx-tabs').each(function() {
				
				if (tabCount < 6) {
					// console.log('...Tab Count: ' + tabCount);

					$(this).find('.fx-slide-controls').removeAttr('style'); // TEMP

					var tabTitleMarkup = $(this).find('.fx-slide-controls ul').html();

					if (!$(this).parents('.ls-cmp-wrap').hasClass('fdxFirstTab')) {
						$('.fdxFirstTab').find('.fx-slide-controls ul').append(tabTitleMarkup);
						$('.fdxFirstTab').find('.fx-slides ul').append('<li></li>');
					}

					$(this).parent().parent().addClass('fdxTabsBreak');
				}
				tabCount = tabCount+1;
				
			});

			// move each prepped tab
			var startTabCount = 0;
			$('.fdxTabsBreak').each(function() {

				if (!$(this).hasClass('fdxLastTab')) {
					// console.log('...startTabCount: ' + startTabCount);

					var nextUntilTab = $(this).nextUntil('.fdxTabsBreak');

					$('.fdxFirstTab > div > .fx-tabs > .fx-slideshow > .fx-slides > ul > li:eq('+startTabCount+')').append(nextUntilTab);

					if (!$(this).hasClass('fdxFirstTab')) {
						$(this).remove();
					}

					startTabCount++;
				}

			});

			// cleanup and rebind click events after short timer for safety
			setTimeout(function() {

				// set active
				var setActiveIndex = $('.fdxFirstTab > div > .fx-tabs > .fx-slideshow > .fx-slide-controls > ul > li.active').index();
				$('.fdxFirstTab > div > .fx-tabs > .fx-slideshow > .fx-slides > ul > li:eq('+setActiveIndex+')').addClass('active');

				// remove last tab marker
				$('.fdxLastTab').remove();
				// setTimeout(function() {$('.fx-tabs .fx-slide-controls').show();}, 200);

				// instantiate new slideshow
				var newSlideshowObj = $('.fdxFirstTab > div > .fx-tabs > .fx-slideshow');
				fdxCreateSlideshow(newSlideshowObj, false);

				// done
				$('body').addClass('fdxAutoTabsUsed');

			}, 10);

		} else {
			// console.log('No tabs exist or fdxAutoTabs has already been run!');
		}
		
	};

	setTimeout(function() {
		runFdxAutoTabs();
	}, 100);

}

	function fdxShowHideSags(livesite) {

		var runFdxShs = function() {
			// console.log('FROM MASTER JS: Initiating Show Hide SAGs...');

			if ($('.fx-shs').length > 0 && !$('body').hasClass('fdxShowHideSagsDone')) {

				// set last tab ending marker classes
				var alreadyInShsLayout = $('.fx-faq-ending').parent().parent().parents('.ls-cmp-wrap');
				if (alreadyInShsLayout.length > 0) {
					// console.log('nested layout inside show hide sag');

					// alreadyInShsLayout.addClass('fdxShsBreak');

					$('.fx-shs').each(function() {
						var shWrapper = $(this).find('.fx-shs-wrapper');

						$(this).parents('.iw_component').append(shWrapper);

						shWrapper.append(alreadyInShsLayout).hide();
					});

					// cleanup
					setTimeout(function() {
						// done
						$('body').addClass('fdxShowHideSagsDone');

					}, 50);

				} else {
					// console.log('not nested singleton');
					
					$('.fx-faq-ending').parents('.ls-cmp-wrap').addClass('fdxShsBreak');
					$('.fx-shs').each(function() {
						var nextUntilBreak = $(this).parents('.ls-cmp-wrap').nextUntil('.fdxShsBreak');
						var shWrapper = $(this).find('.fx-shs-wrapper');

						$(this).parents('.iw_component').append(shWrapper);

						shWrapper.append(nextUntilBreak).hide();
					});

					// cleanup
					setTimeout(function() {
						// remove breaks
						$('.fdxShsBreak').remove();

						// done
						$('body').addClass('fdxShowHideSagsDone');

					}, 50);
				}

			} else {
				// console.log('No sags exist or fdxShowHideSags has already been run!');
			}
			
		};

		if ($('#page-edit-html').length > 0 && !livesite) {
			// console.log('in live site not running SHS!')
		} else {
			// console.log('livesite is true running shs!')
			setTimeout(function() {
				runFdxShs();
			}, 500);
		}
		
	}

	function fdxLayoutInit() {
		if ($('.ls-canvas').length > 0) {
			fdxAutoLayout();
			fdxAutoTabs();
			fdxShowHideSags();
			fdxHandleCustomForm();
		}
	}

	function fdxLaunchModal(id) {
		if ($(id).length > 0) {
			$(id).show();
			var PageName = s.pageName;
			var llvmodalValue = '';
			if (id === '#modal1'){llvmodalValue = fxllvmodal1;}
			if (id === '#modal2'){llvmodalValue = fxllvmodal2;}
			if (id === '#modal3'){llvmodalValue = fxllvmodal3;}
			if (id === '#modal4'){llvmodalValue = fxllvmodal4;}
			if (id === '#modal5'){llvmodalValue = fxllvmodal5;}
			if (llvmodalValue !== ''){logLinkView(llvmodalValue+":"+PageName);}
		}
	}

	function getUrlParam(name) {
		var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (!results) {
			return 0;
		}
		return results[1] || 0;
	}
	
	function fdxInit() {
		$(document).ready(function() {
			if (!$('body').hasClass('fdxInitComplete')) {

				// sort table headers
				$('.datatable th').click(function(){
			    var table = $(this).parents('table').eq(0)
			    var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
			    this.asc = !this.asc
			    if (!this.asc){rows = rows.reverse()}
			    for (var i = 0; i < rows.length; i++){table.append(rows[i])}
			 })
			 function comparer(index) {
			   return function(a, b) {
			          var valA = getCellValue(a, index), valB = getCellValue(b, index)
			          return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			   }
			 }
				function getCellValue(row, index){ return $(row).children('td').eq(index).html() }

				// trigger click on full video image
				$(document).on('click', '.fx-video > img', function(e){
					$(this).parent().find('.fx-play-icon').click();
					e.preventDefault();
				});

				// mega and left nav
				$(document).on('click', '.fx-nav .more span', function(e){
					$(this).parent().toggleClass('open').find('ul:first').slideToggle();
					e.preventDefault();
				});

				$(document).on('click', '.fx-meganav > .fx-nav > ul > li a.nav-link', function(e){

					var hasWrapperDiv = $(this).next('.wrapper').length > 0;

					$('.left-active').removeClass('left-active');
					
					if($(window).width() > 799){
						$(this).parent().toggleClass('active slide');
						
						$(this).parent().siblings().not($(this)).removeClass('slide active');
						
						if($(this).parent().index() != 0){
							if ($(this).parent().hasClass('active')) {
								$(this).parent().prev().addClass('left-active');
							}
						}
						
					}else{
						$(this).parent().toggleClass('open').find('div.wrapper').slideToggle();
					}

					if (hasWrapperDiv) {
						e.preventDefault();
					}
					
				});

				// launch modals
				$(document).on('click', 'a[href^="#modal"]', function(e){
					var launchId = $(this).attr('href');
					fdxLaunchModal(launchId);
					e.preventDefault();
				});
				// launch modals
				$(document).on('click', 'area[href^="#modal"]', function(e){
					var launchId = $(this).attr('href');
					fdxLaunchModal(launchId);
					e.preventDefault();
				});

				// toggle show hide sags
				$(document).on('click', '.fx-shs-trigger', function(e){
					var toggleShsText = $(this).data('toggleText');
					var currentText = $(this).html();
					$(this).html(toggleShsText).data('toggleText', currentText);
					$(this).parents('.fx-block').next('.fx-shs-wrapper').slideToggle();
					e.preventDefault();
				});

				// slideshows
				$('.fx-slideshow').each(function(){
					var slideShowObj = $(this), rotateOption = slideShowObj.data('autoRotate') || false;
					fdxCreateSlideshow(slideShowObj, rotateOption);
				});

				// toggle faqs
				$(document).on('click', '.fx-faqs .fx-question', function(e){
					if ($(this).parent().parent().data('accordian') == true) {
						$('.fx-faqs > .fx-faq.active').removeClass('active').find('.fx-answer').slideUp();
					}
					$(this).siblings('.fx-answer').slideToggle();
					$(this).parent().toggleClass('active');
					if ($(this).parent().hasClass('active')) {
							if (($(this).attr('tagoverwrite')) && (typeof $(this).attr('tagoverwrite') !== 'undefined') && ($(this).attr('tagoverwrite') !== null)){
								logLinkView('FAQ:'+$(this).attr('tagoverwrite'));
					  	}
							else 
							{
								logLinkView('FAQ:'+$(this).text());
							}
					} 
					e.preventDefault();
				});

				// toggle open sag faqs
				$(document).on('click', '.fx-faq-trigger', function(e){
					var linkContext = $(this),
						linkToggleText = linkContext.data('toggleText');
					if (linkContext.parents('.fx-block').hasClass('fx-sag')) {
						if (linkContext.parents('.fx-block').hasClass('fx-inverse')) {
							linkContext.data('originalSag', 'fx-inverse');
						} else {
							linkContext.data('originalSag', 'fx-purple');
						}
						linkContext.parents('.fx-block').removeClass('fx-sag fx-inverse fx-purple').find('.fx-faq-wrapper').slideDown();
					} else {
						var ogSagClass = linkContext.data('originalSag');
						linkContext.parents('.fx-block').find('.fx-faq-wrapper').slideUp(300, function() {
							if (ogSagClass) {
								linkContext.parents('.fx-block').addClass('fx-sag '+ogSagClass);
							} else {
								linkContext.parents('.fx-block').addClass('fx-sag');
							}
						});
					}
					if (linkToggleText) {
						var curToggleText = linkContext.html();
						linkContext.html(linkToggleText).data('toggleText', curToggleText);
					}
					e.preventDefault();
				});

				// toggle open alert
				$(document).on('click', '.fx-alert-trigger', function(e){
					var alertDets = $(this).parents('.fx-block').find('.fx-alert-details'),
						alertToggleText = $(this).data('toggleText');
					if (alertDets.is(':visible')) {
						$(this).parents('.fx-block').find('.fx-alert-details').slideUp(200);
					} else {
						$(this).parents('.fx-block').find('.fx-alert-details').slideDown(200);
					}
					if (alertToggleText) {
						var curAlertText = $(this).html();
						$(this).html(alertToggleText).data('toggleText', curAlertText);
					}
					e.preventDefault();
				});

				// div table 
				$('.fx-div-table table').each(function(){

					var divTableTitles = new Array();
					var tableHeaders =  $(this).find('th');
					var tableRows =  $(this).find('.tableRow');

						//Get div titles and put them into array
						$(tableHeaders).each(function(i){ 
							divTableTitles.push($(this).text());
						});

						$(tableRows).each(function(){
							var tableContent = $(this).find('td');
							var count = tableContent.length;				
							for (i = 0; i < count; i++) { 
									$(tableContent[i]).attr('data-divTitle', divTableTitles[i]);
								}
						});		
				});

				// auto layout
				fdxLayoutInit();
				
				// auto open faqs
				fxFaq();
				// col syncing
				fdxSyncHeights();
				$(window).bind('resize', function() {
					fdxSyncHeights();
				});

				// set flag
				$('body').addClass('fdxInitComplete');
				
				// set responsive navigation
				if (typeof fdx_navigation_flag !== 'undefined' && fdx_navigation_flag === true){
					fdxresponsiveNavigation();
				}
			}
		});
	}

function fxFaq() {
    var faqParam = getUrlParam('fx-faq');
    if (faqParam.length > 0) {
        var faqT = setTimeout(function() {
            if ($('.fx-question#' + faqParam).length > 0) {
                var hasParent = $('.fx-question#' + faqParam).parent().parent().attr('class');
                var showOpenParent = $('.fx-question#' + faqParam).closest('div[class^="fx-shs"]');
                var showTrigger = $(showOpenParent).parent().find('.fx-shs-trigger');

                if (showOpenParent.length == 1) {
                    $('.fx-question#' + faqParam).click();
                    $(showTrigger).click();
                    scrollToFaq(faqParam);
                } else if (hasParent === 'fx-answer') { // double in
                    $('.fx-question#' + faqParam).parents('.fx-faq').parents('.fx-faq').find('.fx-question').first().click();
                    $('.fx-question#' + faqParam).click();
                    scrollToFaq(faqParam);
                }
                // fx-shs
                else {
                    $('.fx-question#' + faqParam).click();
                    scrollToFaq(faqParam);
                }
            }
        }, 500);
    }
}

function scrollToFaq(faq) {
    var goToDis = $('.fx-question#' + faq).offset().top;
    $(window).scrollTop(goToDis);
}

function injectJq(cb) {
   var inLiveSiteEditor = document.getElementById('page-edit-html');
		//console.log(content);
	 if ((inLiveSiteEditor != "") && (typeof inLiveSiteEditor !== "undefined") && (inLiveSiteEditor !== null)){
		var s = document.createElement('script');
		var p = window.location.protocol;
		var b = window.location.host;
		var n = 'http://www.fedex.com/templates/components/libraries/1.0/jQuery/1.7.2/jquery.min.js';
		if (b.match(/fedex/i)) {
			n = p+'//'+b+'/templates/components/libraries/1.0/jQuery/1.7.2/jquery.min.js';
		}
		s.setAttribute('src', n);
		document.getElementsByTagName('head')[0].appendChild(s);
		if (typeof cb === 'function') {
			cb();
		}
	}
	else {
				try {
				IM.makeSureJQuery(cb);
			} catch(err) {}
	}
}

if (!window.jQuery) {
	injectJq(function() {
		if ('jQuery' in window) {
			fdxInit();
		} else {
			var t = setInterval(function() {
				if ('jQuery' in window) {
					fdxInit();
					clearInterval(t);
				}
			}, 150);
		}
	});
} else {
	fdxInit();
}

if (typeof fx_slim !== 'undefined') {
	if (fx_slim) {
		document.body.className += ' fx-slim'; 
	}
}

// Responsive Navigation Code
var pathURL= window.location.pathname;
var fullURL = window.location.href;
function navigationOpen(navURL) {
	if (exactMatch(navURL+"/")) {
		navURL = navURL+"/";
	}
	else if ((navURL.substring(navURL.length-1) === "/") && exactMatch(navURL.substring(0, navURL.length-1))) {
		navURL = navURL.substring(0, navURL.length-1);
	}
	else if (exactMatch(navURL.replace("index.html",""))) {
		navURL = navURL.replace("index.html","");
	}
	else if (exactMatch(navURL.replace("/index.html",""))) {
		navURL = navURL.replace("/index.html","");
	}
	else if (exactMatch(navURL+"index.html")) {
		navURL = navURL+"index.html";
	}
	else if (exactMatch(navURL+"/index.html")) {
		navURL = navURL+"/index.html";
	}

	$('#fx-page-navigation a[href="'+navURL+'"]').addClass("fx-nav-active").parentsUntil("li.fx-nav0").parent().addClass("open").closest("ul").addClass("open").css("display", "block")
}
function processNavLink(processURL){
	if (exactMatch(processURL)) {
		navigationOpen(processURL);
	}
	else if (exactMatch(processURL+"/")) {
		navigationOpen(processURL+"/");
	}
	else if ((processURL.substring(processURL.length-1) === "/") && exactMatch(processURL.substring(0, processURL.length-1))) {
		navigationOpen(processURL.substring(0, processURL.length-1));
	}
	else if (exactMatch(processURL.replace("index.html",""))) {
		navigationOpen(processURL.replace("index.html",""));
	}
	else if (exactMatch(processURL.replace("/index.html",""))) {
		navigationOpen(processURL.replace("/index.html",""));
	}
	else if (exactMatch(processURL+"index.html")) {
	navigationOpen(processURL+"index.html");
	}
	else if (exactMatch(processURL+"/index.html")) {
	navigationOpen(processURL+"/index.html");
	}
}
function fdxresponsiveNavigation(){
    if (typeof navURL !== 'undefined' && $('#fx-page-navigation a[href^="'+navURL+'"]').length === 1){navigationOpen(navURL);}
    else if (typeof navURL !== 'undefined' && $('#fx-page-navigation a[href^="'+navURL+'"]').length !== 1){processNavLink(navURL)}
    else{ 
       if ($('#fx-page-navigation a[href^="'+fullURL+'"]').length === 1){navigationOpen(fullURL);}
       else if (typeof fullURL !== 'undefined' && $('#fx-page-navigation a[href^="'+fullURL+'"]').length !== 1){processNavLink(fullURL);}
       else if($('#fx-page-navigation a[href^="'+pathURL+'"]').length === 1) {navigationOpen(pathURL);}
       else if (typeof pathURL !== 'undefined' && $('#fx-page-navigation a[href^="'+pathURL+'"]').length !== 1){processNavLink(pathURL);}
    }
}
function exactMatch(navURL) {
	if ($('#fx-page-navigation a[href="'+navURL+'"]').length === 1){
		return true;
	}
	return false;
}

function buildMobile(){
	var orderedBlocks = {}, 
		blocks = [];

	// build ordered blocks object, and push any 'naturally ordered' blocks to arr
	$.each($('.fx-block'), function(i, value){

		var hasOrderp =  typeof $(this).data('fxOrder') != 'undefined' ? $(this).data('fxOrder') : false;

		if(hasOrderp || hasOrderp === 0){
			orderedBlocks[hasOrderp] = value;
		}else{
			blocks.push(value.outerHTML);
		}

	});
	
	// inject ordered blocks into block order arr
	$.each(orderedBlocks, function(key, value){
		blocks.splice(key, 0, value.outerHTML);
	})

	// insert mobile HTML
	$('#content').append('<div class="mobile_layout"></div>');
	$('.mobile_layout').html(blocks.join(''));
}
function fdxHandleCustomForm(layout) {
        // Are we in the LiveSite Editor?
        var inLiveSiteEditor = document.getElementById('page-edit-html');
        // We need to find all the customform elements and add them to our form.
	if ($('body').hasClass("fx-form-complete") ) { return;}
	$('body').addClass("fx-form-complete");
	console.log("Set fx-form-complete");
                $(".fx-datapoint").each ( function () {
                        var me = $(this);
                        me.find("input").each ( function () {
                                var i = $(this);
                                var value = i.val();
                                if (value == "") {
                                        value = "none";
                                }
                                if (layout == "runLayout") {
                                        var dv = $(this).attr("defaultvalue");
                                        if( "dv" in window ) {
                                                console.log("Set By default");
                                                $(this).val( dv);
                                        } else {
                                                console.log("Set to blank");
                                                $(this).val("");
                                        }
                                } else if(inLiveSiteEditor) {
                                        i.attr("defaultvalue",value);
                                        i.val( "DEFAULT: " + value + "  NAME: " + i.attr("name") + "  LENGTH:" + i.attr("minlength")+  "," + i.attr("maxlength") + "  REQUIRED: " + (i.attr("optional") == "required") + "  PLACEHOLDER: " + i.attr("placeholder") + "  VALIDATION: " + i.attr("validation"));
                                } 
                        });
                });
		if (!inLiveSiteEditor) {
			var form = 0;
			$(".ls-area-body > .ls-cmp-wrap > .iw_component").each (function (a,b) {
				var c = $(this).children();
				if (form == 1) {
					$("#custom_form").append($(c[0]));
					$(this).parent().remove();
				}
				if (c.hasClass("fx-form-buttons") || c.find(".fx-form-buttons").length >0){
					console.log("found end");
					form = 2;
				}   
				if (c.find("#custom_form").length>0 ) {
					c.find(".ls-cmp-wrap > .iw_component").each (function (a,b) {
						var d = $(this).children();
						if (form == 1) {
							$("#custom_form").append($(d[0]));
							$(this).parent().remove();
						}
						if ($(d[0]).hasClass("fx-form")) {
							form = 1;
						}
						if (d.find(".fx-form-buttons").length >0){
							form = 2;
						}
					});
					if (form == 0) {
						form = 1;
					}
				}  
			});
			$("#custom_form").find(".fx-copy").removeClass("fx-copy");
			$("#custom_form").find(".fx-block").removeClass("fx-block");
		}

                // We need to add a handler to make calls back to the cgi
		$( "#customform_buttons button[type^='submit']" ).click(function( event ) {
                        $("[id^='customform']").removeClass("fx-error");
                        //alert( "Handler for .submit() called." );
                        event.preventDefault();
                        //var jsonData = { "fields" :{ "input" : [] }};
                        var jsonData = "";
                        // Input Field handler
                        // Input Field handler
                        $("#custom_form .fx-error-banner").addClass("fx-hidden");

                        $("[name^='cf_']").each ( function (a,b) {
				// Don't send unchecked readio or checkboxes
				if ( $(this).is(':radio') || $(this).is(':checkbox') ) {
					if (! $(this).is(':checked') ) {
						return;
					}
				}
                                if (b.name) {
					jsonData = jsonData + b.name + "=" + b.value + "&";
                                }
                        });


                        // Perform post
                        $.getJSON ("/cgi-bin/formelements_json.cgi", jsonData).done (
                                function (data) {
					if (data.location) {
						window.location.href = data.location;
						return;
					}
                                        $.each (data.fields , function (pos,obj) {
                                                var e = $("#customform_" + obj.name);
                                                if (obj.value == 1 || obj.value == 2) {
                                                        e.addClass("fx-error");
                                                }
                                                if (obj.value == 1) {
                                                        e.find(".fx-error-resolution").addClass("fx-hidden");
                                                } else {
                                                        e.find(".fx-error-resolution").removeClass("fx-hidden");
                                                }
                                        });
                                }
                        ).fail ( 
                                function () {
                                        //alert("Failed");
                                }
                        );

                });

}
