/*
	lazyLoadGoogleMaps v1.0.2
	A JavaScript plugin for lazy-loading Google Maps.
	-
	By Osvaldas Valutis, www.osvaldas.info
	Available for use under the MIT License
*/

window.googleMapsScriptLoaded = function()
{
	$( window ).trigger( 'googleMapsScriptLoaded' );
};

;( function( $, window, document, undefined )
{
	'use strict';

	var $window					= $( window ),
			$body						= $( 'body' ),
			windowHeight		= $window.height(),
			windowScrollTop	= 0,

		debounce = function( delay, fn )
		{
			var timer = null;
			return function()
			{
				var context = this, args = arguments;
				clearTimeout( timer );
				timer = setTimeout( function(){ fn.apply( context, args ); }, delay );
			};
		},
		throttle = function( delay, fn )
		{
			var last, deferTimer;
			return function()
			{
				var context = this, args = arguments, now = +new Date;
				if( last && now < last + delay )
				{
					clearTimeout( deferTimer );
					deferTimer = setTimeout( function(){ last = now; fn.apply( context, args ); }, delay );
				}
				else
				{
					last = now;
					fn.apply( context, args );
				}
			};
		},

		apiScriptLoaded	 = false,
		apiScriptLoading = false,
		$containers			 = $([]),

		init = function( callback )
		{
			windowScrollTop = $window.scrollTop();

			$containers.each( function()
			{
				var $this				= $( this ),
						thisOptions = $this.data( 'options' );

				if( $this.offset().top - windowScrollTop > windowHeight * 1 )
					return true;

				if( !apiScriptLoaded && !apiScriptLoading )
				{
					var apiArgs =
					{
						callback: 'googleMapsScriptLoaded'
					};

					if( thisOptions.key )				apiArgs.key				= thisOptions.key;
					if( thisOptions.libraries )	apiArgs.libraries	= thisOptions.libraries;
					if( thisOptions.language )	apiArgs.language	= thisOptions.language;
					if( thisOptions.region )		apiArgs.region		= thisOptions.region;

					$body.append( '<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&' + $.param( apiArgs ) + '"></script>' );
					apiScriptLoading = true;
				}

				if( !apiScriptLoaded ) return true;

				var map = new google.maps.Map( this, { zoom: 15 });
				if( thisOptions.callback !== false )
					thisOptions.callback( this, map );

				$containers = $containers.not( $this );
			});
		};

	$window.on( 'googleMapsScriptLoaded',function()
	{
		apiScriptLoaded = true;
		init();
	})
	.on( 'scroll', throttle( 500, init ) )
	.on( 'resize', debounce( 1000, function()
	{
		windowHeight = $window.height();
		init();
	}));

	$.fn.lazyLoadGoogleMaps = function( options )
	{
		options = $.extend(
		{
			key:  		 false,
			libraries: false,
			language:	 false,
			region:		 false,
			callback:  false,
		},
		options );

		this.each( function()
		{
			var $this = $( this );
			$this.data( 'options', options );
			$containers = $containers.add( $this );
		});

		init();

		this.debounce = debounce;
		this.throttle = throttle;

		return this;
	};

})( jQuery, window, document );
