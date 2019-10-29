/*
	Copyright (c) 2018 WebCimes - RICHARD Florian (https://www.webcimes.com)
	Licence Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) 
	https://creativecommons.org/licenses/by-nc-nd/4.0/
	Date: 2018-02-01
*/

(function($)
{
    "use strict";
	var methods = 
	{
		init : function(options)
		{
			var defaults =
			{
				type: 'diapo',
				delay: 4000,
				transition: 2000,
				keepRatio: false,
				showLeftRight:true,
				showPlayPause:true,
				showNavigation:true,
				autoStart:true,
				indexImageStart:0
			};
			var options = $.extend(defaults, options);
			
			return this.each(function()
			{
				// Variables
				var canAutoStart, timeOutTransition, timeOutDelay, indexImage = options.indexImageStart;
				
				// Sélecteur
				var selector = $(this);
				selector.data("selector", selector);
				
				// On créer les balises pour les images
				selector.children("img").wrapAll('<div class="allImages"></div>').wrap('<div class="thisImage"></div>');
				
				// On applique un background sur chaque balise thisImage
				var allImages = selector.children(".allImages").children(".thisImage");
				allImages.each(function()
				{
					$(this).attr("style", ($(this).children("img").data("css")?$(this).children("img").data("css")+' ':'')+"background-image:url('"+$(this).children("img").attr("src")+"');");
					$(this).append($(this).children("img").data("html"));	
				});
				
				// Nb total d'image
				var nbImages = allImages.length;
								
				// Ratio des images : (background ou <img>)
				if(options.keepRatio == true)
				{
					selector.addClass("keepRatio");
				}
				
				// Diapo ou Scroll
				if(options.type == 'diapo')
				{
					selector.addClass("webCimesCarouselDiapo");
					allImages.not(":eq(0)").addClass("hide");
				
					// On applique le temps de transition au css
					allImages.css({"transition":"opacity "+options.transition+"ms ease 0s, filter "+options.transition+"ms ease 0s, visibility "+options.transition+"ms ease 0s"});
				}
				else if(options.type == 'scroll')
				{
					selector.addClass("webCimesCarouselScroll");
				}
					
				// Fonction de changement de l'image
				function changeImage(index)
				{	
					canAutoStart = false;
					indexImage = index;
					
					// Diapo ou Scroll
					if(options.type == 'diapo')
					{
						// On verifie les limites du nombre d'image
						if(indexImage > nbImages-1)
						{
							// on met a 0 si on est actuellement sur la dernière diapo
							indexImage = 0;
						}	
						else if(indexImage == -1)
						{
							// on met la dernière diapo si on demande l'image précédant la première diapo
							indexImage = nbImages-1;
						}
						
						// On affiche le nouveau fond
						allImages.addClass("hide");
						allImages.eq(indexImage).removeClass("hide");
					}
					else if(options.type == 'scroll')
					{
						// On verifie les limites du nombre d'image
						var allImagesWidth = allImages.parent('.allImages').outerWidth();
						var thisImageWidth = allImages.eq(0).outerWidth(true);
						var nbImagesShow = Math.round(allImagesWidth / thisImageWidth);
						if((indexImage+nbImagesShow) > nbImages)
						{
							// on met a 0 si on est actuellement sur la dernière diapo
							indexImage = 0;
						}	
						else if(indexImage == -1)
						{
							// on met la dernière diapo si on demande l'image précédant la première diapo
							indexImage = nbImages-nbImagesShow;
						}
						
						// On scroll jusqu'a l'image courante
						selector.children(".allImages").stop().animate({scrollLeft: parseInt(allImages.eq(indexImage).position().left + selector.children(".allImages").scrollLeft())}, options.transition,'easeInOutCubic');
					}
					
					// on met a jour la nav si elle existe
					if(options.showNavigation == true)
					{
						var carouselNav = selector.children('.carouselNav');
						carouselNav.children("div").removeClass("active");
						carouselNav.children("div:eq("+indexImage+")").addClass("active");
					}
					
					// AutoStart : On attend la fin de la transition
					clearTimeout(timeOutTransition);
					timeOutTransition = setTimeout(function()
					{
						// On regarde si un delay est défini sur l'image courante
						var delay = (allImages.eq(indexImage).children("img").data("delay")?allImages.eq(indexImage).children("img").data("delay"):options.delay);
						
						// on marque la temporisation/delay de l'image
						canAutoStart = true;
						clearTimeout(timeOutDelay);
						timeOutDelay = setTimeout(function()
						{
							if(options.autoStart == true && canAutoStart == true)
							{
								changeImage(indexImage+1);
							}
						}, delay);
						selector.data("timeOutDelay", timeOutDelay);
					}, options.transition);
					selector.data("timeOutTransition", timeOutTransition);
				}
				
				// Si il y a au moin deux images, alors on créer le diapo
				if(nbImages > 1)
				{
					
					// EXECUTION SCRIPT
					
					// on créer un bloc commande
					selector.append('<div class="carouselBtn"></div>');
					var carouselBtn = selector.children('.carouselBtn');
					
					// Resize carousel scroll
					if(options.type == 'scroll')
					{
						$(window).on("resize.webCimesCarouselScroll",function()
						{
							selector.children(".allImages").scrollLeft(parseInt(allImages.eq(indexImage).position().left + selector.children(".allImages").scrollLeft()));
						});
					}
					
					// On affiche les flèches de navigation gauche et droite
					if(options.showLeftRight == true)
					{
						carouselBtn.append(
						'<div class="btnLeft" alt="Gauche" title="Gauche"></div>'+
						'<div class="btnRight" alt="Droite" title="Droite"></div>');

						var thisBtnLeft = carouselBtn.children(".btnLeft");
						var thisBtnRight = carouselBtn.children(".btnRight");
						
						// Evenements
						
						// bouton gauche
						thisBtnLeft.click(function(event)
						{
							changeImage(indexImage-1);
						}); 
						
						// bouton droite
						thisBtnRight.click(function(event)
						{
							changeImage(indexImage+1);
						}); 
					}
					
					// On affiche le bouton play / pause
					if(options.showPlayPause == true)
					{
						carouselBtn.append(
						'<div class="btnPlay" alt="Lire" title="Lire"></div>'+
						'<div class="btnPause" alt="Pause" title="Pause"></div>');
						
						var thisBtnPlay = carouselBtn.children(".btnPlay");
						var thisBtnPause = carouselBtn.children(".btnPause");
						
						// autoStart activer
						if(options.autoStart == true)
						{
							thisBtnPlay.addClass("hide");
							thisBtnPause.removeClass("hide");
						}
						// autoStart désactiver
						else if(options.autoStart == false)
						{	
							thisBtnPlay.removeClass("hide");
							thisBtnPause.addClass("hide");
						}
						
						// Evenements
						
						// lance l'autoStart
						thisBtnPlay.click(function(event)
						{
							thisBtnPlay.addClass("hide");
							thisBtnPause.removeClass("hide");
							options.autoStart = true;
							changeImage(indexImage);
						}); 
						
						// stop l'autoStart
						thisBtnPause.click(function(event)
						{			
							thisBtnPlay.removeClass("hide");
							thisBtnPause.addClass("hide");
							options.autoStart = false;
						}); 
					}
					
					// On affiche la navigation
					if(options.showNavigation == true)
					{
						selector.append(
						'<div class="carouselNav"></div>');
						
						var carouselNav = selector.children('.carouselNav');
						var carouselNavAncre = '';	
											
						for(var i = 0; i < nbImages ; i++){carouselNavAncre += '<div></div>';}
						carouselNav.html(carouselNavAncre);
						carouselNav.find("div:eq(0)").addClass("active");
						
						// Evenements
						
						// on change par l'image sélectionner
						carouselNav.children("div").click(function(event)
						{
							var indexImage = carouselNav.children("div").index($(this));
							changeImage(indexImage);
						}); 
					}
					
					// autoStart activer, on lance le carousel
					if(options.autoStart == true)
					{
						changeImage(indexImage);
					}
				}
				else
				{
					selector.children(".carouselBtn,.carouselNav").hide();
				}
			});
		},
		destroy : function() 
		{
			return this.each(function()
			{
				// clear le timer
				var timeOutTransition = $(this).data('timeOutTransition');
				clearTimeout(timeOutTransition);
				
				// clear le timer
				var timeOutDelay = $(this).data('timeOutDelay');
				clearTimeout(timeOutDelay);
				
				// On supprime le resize webCimesCarouselScroll
				$(window).off("resize.webCimesCarouselScroll");
				
				// on supprime tout les évenements
				var selector = $(this).data('selector');
				if(typeof selector != 'undefined'){selector.find("*").addBack().off();}
			});
		}
	};
	
    $.fn.webCimesCarousel = function(method)
	{  
		if(methods[method])
		{
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1 ));
		} 
		else if(typeof method === 'object' || ! method) 
		{
			return methods.init.apply( this, arguments );
		} 
		else 
		{
			$.error('Method '+method+' does not exist on jQuery.webCimesCarousel');
		}    
	};
})(jQuery);