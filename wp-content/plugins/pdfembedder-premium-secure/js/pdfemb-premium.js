
function pdfembGetPDF(url, callback) {
	    	
		// 	Get PDF directly
	
	if (url.search("/?pdfemb-serveurl=") == -1) {
		callback(url, false); // false = not secure
		return;
	}

	jQuery.ajax({
		   dataType:'arraybuffer',
		   type:'POST',
		   url: url
		}).done(function(blob){

			pdfemb_rc4ab(pdfemb_trans.k, blob);
	
			var uia = new Uint8Array(blob);
	
		  callback(uia, pdfemb_trans.is_admin); // true = secure
		  
		});


};

function pdfembWantMobile($, divContainer, wantWidth, wantHeight) {
    if (divContainer.data('fullScreen') == 'on') {
        return false;
    }

    var mobileWidth = parseInt(divContainer.data('mobile-width'), 10);
    if (isNaN(mobileWidth) || mobileWidth < 0) {
        mobileWidth = 500;
    }

    return wantWidth < mobileWidth;
}

function pdfembMakeMobile($, wantMobile, divContainer) {
    var innerdiv = divContainer.find('div.pdfemb-inner-div');
    if (wantMobile) {
        if (innerdiv.find('.pdfemb-inner-div-wantmobile').length == 0) {

            var wantMobileWrapper = $('<div></div>', {'class': 'pdfemb-inner-div-wantmobile pdfemb-wantmobile'});

            var wantMobileFS = $('<div></div>', {'class': 'pdfemb-wantmobile-fsarea'});
            var wantMobileFSWrapper = $('<div></div>', {'class': 'pdfemb-inner-div-wantmobile-fswrap pdfemb-wantmobile'})
                .append(wantMobileFS
                    .append(document.createTextNode(pdfemb_trans.objectL10n.viewinfullscreen)));

            pdfembBindFullScreen($, wantMobileFS, divContainer);

            innerdiv.prepend(wantMobileWrapper);
            innerdiv.prepend(wantMobileFSWrapper);

            // Hide toolbars
            divContainer.find('.pdfemb-toolbar-fixed').hide();
            // Tell floating toolbars not to show
            divContainer.find('.pdfemb-toolbar-hover').data('no-hover', true);
        }
    }
    else {
        innerdiv.find('.pdfemb-wantmobile').remove();

        divContainer.find('.pdfemb-toolbar-fixed').show();
        divContainer.find('.pdfemb-toolbar-hover').data('no-hover', false);
    }
}

function pdfembAddMoreToolbar($, toolbar, divContainer) {

	if (divContainer.data('download') == 'on') {
		var downloadbtn = $('<button class="pdfemb-download" title="'+pdfemb_trans.objectL10n.download+'"></button>');
		var downloadurl = divContainer.data('pdf-url');
		if (downloadurl) {
			downloadbtn.on('click', function (e) {
				pdfembPremiumDownload(downloadurl, divContainer.data('download-nonce'), divContainer.data('tracking'));
			});
			toolbar.append(downloadbtn);
		}
	}

	var fsbtn = $('<button class="pdfemb-fs" title="'+pdfemb_trans.objectL10n.fullscreen+'"></button>');

	if (divContainer.data('fullScreen') == 'on') {
		fsbtn.addClass('pdfemb-toggled');
		fsbtn.on('click', function (e){
			// Close full screen window
            divContainer.closest('.pdfemb-fsp-wrapper').trigger('closePopup');
			divContainer.data('fullScreenClosed', 'true');
            $(document).off('pdfembMagnify');
		});
	}
	else {
        pdfembBindFullScreen($, fsbtn, divContainer);
	}
	toolbar.append(fsbtn);


	// Change Page area so you can jump

    var oldPageArea = toolbar.find('div.pdfemb-page-area');
    var oldPageNum = oldPageArea.find('span.pdfemb-page-num');

    oldPageArea.on('click', function(e) {
        var newPageInput = $("<input />", {'type': 'text', 'class': 'pdfemb-page-num'});

        newPageInput.on('keyup', function(e) {
            if ((e.keyCode ? e.keyCode : e.which) == 13) {
                var newPage = parseInt(newPageInput.val());
                if (!isNaN(newPage) && newPage > 0) {
                    divContainer.trigger('pdfembGotopage', newPage);
                }
            }
        });

        newPageInput.val(oldPageNum.text());
        oldPageNum.replaceWith(newPageInput);
        oldPageArea.off('click');
    });

}

function pdfembPremiumDownload(downloadurl, downloadnonce, tracking) {

    if (downloadnonce !== undefined && downloadnonce != ''){
        downloadurl += '&pdfemb-nonce=' + downloadnonce;
    }

    setTimeout( function() {
        window.open(downloadurl);
    },
    100)

    if (tracking == 'on') {
        // Count the download
        var $ = jQuery;
        var data = {
            action: 'pdfemb_count_download',
            pdf_url: downloadurl
        };
        // the_ajax_script.ajaxurl is a variable that will contain the url to the ajax processing file
        $.post(pdfemb_trans.ajaxurl, data, function(response) {
            // Count was recorded
        });
    }
}

function pdfembMagnifyEvent(fsDivContainer, event) {
    var $ = jQuery;
    var gtpe = $(event.originalEvent.gtpelement);
    var divContainer = gtpe.closest('.pdfemb-viewer');
    var mag = event.originalEvent.magnification;

    if (mag == -1) {
        // End of touch
        $.fn.pdfEmbedder.queueRenderPage(divContainer, divContainer.data('pagenum'));
    }
    else {
        $.fn.pdfEmbedder.magnifyZoom(divContainer, event.originalEvent.magnification);
    }
}

function pdfembBindFullScreen($, fsbtn, divContainer) {
    var dC = divContainer;

    fsbtn.fullScreenPopup({
        popup: function () {
            var _pdfDoc = dC.data('pdfDoc');
            var _pageNum = dC.data('pagenum');
            var _showIsSecure = dC.data('showIsSecure');
			var _pdfurl = dC.data('pdf-url');
            var _download = dC.data('download');
            var _tracking = dC.data('tracking');
            var _newwindow = dC.data('newwindow');
            var _downloadNonce = dC.data('download-nonce');
            var _disablerightclick = dC.data('disablerightclick');

            var fsDivContainer = $('<div class="pdfemb-viewer"></div>');
            fsDivContainer.data('pdfDoc', _pdfDoc);
            fsDivContainer.data('pagenum', _pageNum);
            fsDivContainer.data('showIsSecure', _showIsSecure);
			fsDivContainer.data('pdf-url', _pdfurl);
            fsDivContainer.data('download', _download);
            fsDivContainer.data('tracking', _tracking);
            fsDivContainer.data('newwindow', _newwindow);
            fsDivContainer.data('disablerightclick', _disablerightclick);
            fsDivContainer.data('width', 'max');
            fsDivContainer.data('height', 'auto');
            fsDivContainer.data('toolbar', 'bottom');
            fsDivContainer.data('toolbar-fixed', 'on');
            fsDivContainer.data('fullScreen', 'on');
            if (_downloadNonce !== undefined) {
                fsDivContainer.data('download-nonce', _downloadNonce);
            }
            fsDivContainer.pdfEmbedder();

            $(document).on('pdfembMagnify', function(event) {
                pdfembMagnifyEvent(fsDivContainer, event);
            });
            return fsDivContainer;
        },
        close: false,
        mainWrapperClass: 'pdfemb-fsp-wrapper',
        contentWrapperClass: 'pdfemb-fsp-content',
        inlineStyles: false
    });
}

jQuery(document).ready(function ($) {
	
	// http://www.artandlogic.com/blog/2013/11/jquery-ajax-blobs-and-array-buffers/
	/**
	 * Register ajax transports for blob send/recieve and array buffer send/receive via XMLHttpRequest Level 2
	 * within the comfortable framework of the jquery ajax request, with full support for promises.
	 *
	 * Notice the +* in the dataType string? The + indicates we want this transport to be prepended to the list
	 * of potential transports (so it gets first dibs if the request passes the conditions within to provide the
	 * ajax transport, preventing the standard transport from hogging the request), and the * indicates that
	 * potentially any request with any dataType might want to use the transports provided herein.
	 *
	 * Remember to specify 'processData:false' in the ajax options when attempting to send a blob or arraybuffer -
	 * otherwise jquery will try (and fail) to convert the blob or buffer into a query string.
	 */
	$.ajaxTransport("+*", function(options, originalOptions, jqXHR){
	    // Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
	    // level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
	    // and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
	    if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer'))
	        || (options.data && ((window.Blob && options.data instanceof Blob)
	            || (window.ArrayBuffer && options.data instanceof ArrayBuffer)))
	        ))
	    {
	        return {
	            /**
	             * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
	             * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
	             * into the jquery complete callback (such as the success function, done blocks, etc.)
	             *
	             * @param headers
	             * @param completeCallback
	             */
	            send: function(headers, completeCallback){
	                var xhr = new XMLHttpRequest(),
	                    url = options.url || window.location.href,
	                    type = options.type || 'GET',
	                    dataType = options.dataType || 'text',
	                    data = options.data || null,
	                    async = options.async || true;
	 
	                xhr.addEventListener('load', function(){
	                    var res = {};
	 
	                    res[dataType] = xhr.response;
	                    completeCallback(xhr.status, xhr.statusText, res, xhr.getAllResponseHeaders());
	                });
	 
	                xhr.open(type, url, async);
	                xhr.responseType = dataType;
	                xhr.send(data);
	            },
	            abort: function(){
	                jqXHR.abort();
	            }
	        };
	    }
	});
	
	
});

function pdfemb_rc4ab(key, ab) {
	var s = [], j = 0, x, res = '';
	var dv = new DataView(ab);
	
	for (var i = 0; i < 256; i++) {
		s[i] = i;
	}
	for (i = 0; i < 256; i++) {
		j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
	}
	i = 0;
	j = 0;
	for (var y = 0; y < ab.byteLength; y++) {
		i = (i + 1) % 256;
		j = (j + s[i]) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
		input = dv.getUint8(y);
		output = input ^ s[(s[i] + s[j]) % 256];
		dv.setUint8(y, output);
	}
}


var pdfembAnnotationsLayerBuilder = (function AnnotationsLayerBuilderClosure() {
    /**
     * @param {AnnotationsLayerBuilderOptions} options
     * @constructs AnnotationsLayerBuilder
     */
    function AnnotationsLayerBuilder(options) {
        this.pageDiv = options.pageDiv;
        this.pdfPage = options.pdfPage;
        this.div = null;
    }
    AnnotationsLayerBuilder.prototype =
    /** @lends AnnotationsLayerBuilder.prototype */ {

        /**
         * @param {PageViewport} viewport
         */
        setupAnnotations:
            function AnnotationsLayerBuilder_setupAnnotations(viewport, newwindow) {
                function bindLink(link, dest) {
                    link.href = '#'; //linkService.getDestinationHash(dest);
                    link.onclick = function annotationsLayerBuilderLinksOnclick() {
                        if (dest) {
                            //linkService.navigateTo(dest);
                            jQuery(pageDiv).parent().trigger('pdfembGotoHash', {'dest': dest});
                        }
                        return false;
                    };
                    if (dest) {
                        link.className = 'internalLink';
                    }
                }

                function bindNamedAction(link, action) {
                    link.href = '#'; //linkService.getAnchorUrl('');
                    link.onclick = function annotationsLayerBuilderNamedActionOnClick() {
                        if (action) {
                            //linkService.navigateTo(dest);
                            jQuery(pageDiv).parent().trigger('pdfembGotoAction', action);
                        }
                        return false;
                    };
                    link.className = 'internalLink';
                }

                var pdfPage = this.pdfPage;
                var self = this;
                var pageDiv = this.pageDiv;

                pdfPage.getAnnotations().then(function (annotationsData) {
                    viewport = viewport.clone({ dontFlip: true });
                    var transform = viewport.transform;
                    var transformStr = 'matrix(' + transform.join(',') + ')';
                    var data, element, i, ii;

                    if (self.div) {
                        // If an annotationLayer already exists, refresh its children's
                        // transformation matrices
                        for (i = 0, ii = annotationsData.length; i < ii; i++) {
                            data = annotationsData[i];
                            element = self.div.querySelector(
                                '[data-annotation-id="' + data.id + '"]');
                            if (element) {
                                pdfembCustomStyle.setProp('transform', element, transformStr);
                            }
                        }
                        // See PDFPageView.reset()
                        self.div.removeAttribute('hidden');
                    } else {
                        for (i = 0, ii = annotationsData.length; i < ii; i++) {
                            data = annotationsData[i];
                            if (!data || !data.hasHtml) {
                                continue;
                            }

                            element = PDFJS.AnnotationUtils.getHtmlElement(data,
                                pdfPage.commonObjs);
                            element.setAttribute('data-annotation-id', data.id);
                            if (typeof mozL10n !== 'undefined') {
                                mozL10n.translate(element);
                            }

                            var rect = data.rect;
                            var view = pdfPage.view;
                            rect = PDFJS.Util.normalizeRect([
                                rect[0],
                                view[3] - rect[1] + view[1],
                                rect[2],
                                view[3] - rect[3] + view[1]
                            ]);
                            element.style.left = rect[0] + 'px';
                            element.style.top = rect[1] + 'px';
                            element.style.position = 'absolute';

                            pdfembCustomStyle.setProp('transform', element, transformStr);
                            var transformOriginStr = -rect[0] + 'px ' + -rect[1] + 'px';
                            pdfembCustomStyle.setProp('transformOrigin', element, transformOriginStr);

                            if (data.subtype === 'Link') {
                                var link = element.getElementsByTagName('a')[0];
                                if (!data.url) {
                                    if (link) {
                                        if (data.action) {
                                            bindNamedAction(link, data.action);
                                        } else {
                                            bindLink(link, ('dest' in data) ? data.dest : null);
                                        }
                                    }
                                }
                                else if (newwindow == 'on') {
                                    link.target = '_blank';
                                }

                                jQuery(link).on('touchstart', function(e){
                                    e.stopPropagation();
                                });
                            }

                            //if (!self.div) {
                                var annotationLayerDiv = document.createElement('div');
                                annotationLayerDiv.className = 'pdfembAnnotationLayer';

                            // Get canvas
                            var canvas = self.pageDiv.getElementsByTagName("canvas")[0];

                            annotationLayerDiv.style.left = canvas.style.left;
                            annotationLayerDiv.style.top = canvas.style.top;

                            self.pageDiv.appendChild(annotationLayerDiv);
                            //  self.div = annotationLayerDiv;

                            annotationLayerDiv.appendChild(element);
                        }
                    }
                });
            },

        hide: function () {
            if (!this.div) {
                return;
            }
            this.div.setAttribute('hidden', 'true');
        }
    };
    return AnnotationsLayerBuilder;
})();

/**
 * @constructor
 * @implements IPDFAnnotationsLayerFactory
 */
function pdfembPremiumAnnotationsLayerFactory() {}
pdfembPremiumAnnotationsLayerFactory.prototype = {
    /**
     * @param {HTMLDivElement} pageDiv
     * @param {PDFPage} pdfPage
     * @returns {AnnotationsLayerBuilder}
     */
    createAnnotationsLayerBuilder: function (pageDiv, pdfPage) {
        return new pdfembAnnotationsLayerBuilder({
            pageDiv: pageDiv,
            pdfPage: pdfPage
        });
    }
};

// optimised CSS custom property getter/setter
var pdfembCustomStyle = (function CustomStyleClosure() {

    // As noted on: http://www.zachstronaut.com/posts/2009/02/17/
    //              animate-css-transforms-firefox-webkit.html
    // in some versions of IE9 it is critical that ms appear in this list
    // before Moz
    var prefixes = ['ms', 'Moz', 'Webkit', 'O'];
    var _cache = {};

    function CustomStyle() {}

    CustomStyle.getProp = function get(propName, element) {
        // check cache only when no element is given
        if (arguments.length === 1 && typeof _cache[propName] === 'string') {
            return _cache[propName];
        }

        element = element || document.documentElement;
        var style = element.style, prefixed, uPropName;

        // test standard property first
        if (typeof style[propName] === 'string') {
            return (_cache[propName] = propName);
        }

        // capitalize
        uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);

        // test vendor specific properties
        for (var i = 0, l = prefixes.length; i < l; i++) {
            prefixed = prefixes[i] + uPropName;
            if (typeof style[prefixed] === 'string') {
                return (_cache[propName] = prefixed);
            }
        }

        //if all fails then set to undefined
        return (_cache[propName] = 'undefined');
    };

    CustomStyle.setProp = function set(propName, element, str) {
        var prop = this.getProp(propName);
        if (prop !== 'undefined') {
            element.style[prop] = str;
        }
    };

    return CustomStyle;
})();
