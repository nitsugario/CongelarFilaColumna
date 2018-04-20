/*
* CongelarFilaColumna is a  jQuery plugin that allows freezing of rows and columns.
* Scrolling can be enabled. Both rows and columns can be frozen. Rows to be frozen 
* should be placed in 'thead' (whole frozen header). You can freeze rows and columns combined with colspan or rowspan.
*
*
* Copyright (c) 2017
* Author:  Agustin Rios Reyes.
* Email:   nitsugario@gmail.com
* Github:  https://github.com/nitsugario/jQuery-Freeze-Table-Column-and-Rows
* Versión: 2.2
*
* Licensed under MIT
* http://www.opensource.org/licenses/mit-license.php
*
*/

(function($)
{
	$.fn.CongelarFilaColumna = function (method)
	{
		
		var defaults =
		{
			width:        '100%',
			height:       '100%',
			Columnas:     1,      //Number of columns fixed
			soloThead :   false,  //only the fixed header
			coloreacelda: false,
			colorcelda:   '#F4FA58',
			lboHoverTr:   false,
			tfoot:        false
		};
		var settings = {};
		var methods  =
		{
			init: function (options)
			{
				settings = $.extend({}, defaults, options);

				return this.each(function ()
				{
					var $tabla = $(this); 

					if (helpers._EsUnaTabla($tabla))
					{ 
						methods.setup.apply(this, Array.prototype.slice.call(arguments, 1));
					}
					else
					{
						$.error('La Tabla No es válida. :( ');
					};
				});
			},
			setup: function ()
			{
				if ( settings.soloThead )
				{
					var $wrapper,
						$lobTable     = $(this), 
						lobTable      = this,
						lstClassTable = $lobTable.attr("class");

					helpers._ObtenerAsignarAnchoAltoThead( $lobTable );

					var lobThead       = $lobTable.find("thead").clone(),
						lnuWidthTable  = $lobTable.width(),
						lobTableThead  = $("<table>").attr("class",lstClassTable).append(lobThead);
						
					
					settings.scrollbarOffset  = helpers._OptenerWidthBarraScroll();
					$lobTable.css({'width':lnuWidthTable});

					if (!$lobTable.closest('.fht-table-wrapper').length)
					{
						$lobTable.addClass('fht-table');
						$lobTable.wrap('<div class="fht-table-wrapper"></div>');
					}

					$wrapper   = $lobTable.closest('.fht-table-wrapper');

					if ( $wrapper.find('.fht-fixed-body').length == 0)
						$lobTable.wrap('<div class="fht-fixed-body"></div>');

					$fixedBody = $wrapper.find('.fht-fixed-body');

					$wrapper.css({
						width: settings.width,
						height: settings.height
					});

					/*Agregamos la tabla completa a fht-tbody-conten*/
					$lobTable.wrap('<div class="fht-tbody"><div class="fht-tbody-conten"></div></div>');
					$lobTable.closest('.fht-tbody-conten').css({'width':lnuWidthTable});
					$lobDivBody  = $wrapper.find('div.fht-tbody');

					/*Agregamos el encabesado clonado al div fht-thead*/
					$lobDivTHead = $('<div class="fht-thead"></div>').prependTo($fixedBody).css({'width':lnuWidthTable});
					lobTableThead.css({'width':lnuWidthTable});
					$lobDivTHead.append(lobTableThead).css({'width':lnuWidthTable});

					$lobTable.css({
						'margin-top': -$lobDivTHead.outerHeight(true)
					});

					var lnuTbodyHeight = $wrapper.height() - $lobDivTHead.outerHeight(true);

					$lobDivBody.css({
						'height': lnuTbodyHeight,
						'width':lnuWidthTable+settings.scrollbarOffset+2
					});

					helpers._OnScroll( $lobDivBody );

					return lobTable;
				}
				else
				{
					var $wrapper,
						$tabla      = $(this), 
						tabla       = this,
						contenedor  = $(this).parent(), 
						classT      = $tabla.attr("class"); 

					helpers._ObtenerAsignarAnchoAlto($tabla); 

					var thead       = $tabla.find("thead").clone(),
						anchotabla  = $tabla.width(),
						tablaTH     = $("<table>").attr("class",classT).append(thead),
						$tablaTHCol = $("<table>").attr("class",classT).append($("<thead>")),
						$tablaTBCol = $("<table>").attr("class",classT).append($("<tbody>"));

					settings.scrollbarOffset  = helpers._OptenerWidthBarraScroll();
					$tabla.css({'width':anchotabla});
					
					tablaTH.addClass('fht-table');
					$tablaTHCol.addClass('fht-table');
					$tablaTBCol.addClass('fht-table');
					
					helpers._ClonarHeaderColumnasACongelar($tabla,$tablaTHCol,'thead',settings.Columnas);
					helpers._ClonarHeaderColumnasACongelar($tabla,$tablaTBCol,'tbody',settings.Columnas);

					if( settings.tfoot)
					{
						$tablaTBCol.append($("<tfoot>"));
						helpers._ClonarHeaderColumnasACongelar($tabla,$tablaTBCol,'tfoot',settings.Columnas);
					}

					if (!$tabla.closest('.fht-table-wrapper').length)
					{
						$tabla.addClass('fht-table');
						$tabla.wrap('<div class="fht-table-wrapper"></div>');
					}

					$wrapper = $tabla.closest('.fht-table-wrapper');

					if ( $wrapper.find('.fht-fixed-column').length == 0)
					{
						$tabla.wrap('<div class="fht-fixed-body"></div>');
						$('<div class="fht-fixed-column"></div>').prependTo($wrapper);
						$fixedBody    = $wrapper.find('.fht-fixed-body');
					}

					$wrapper.css({
						width: settings.width,
						height: settings.height
					});

					if (!$tabla.hasClass('fht-table-init'))
					{
						$tabla.wrap('<div class="fht-tbody"><div class="fht-tbody-conten"></div></div>');
					}

					$tabla.closest('.fht-tbody-conten').css({'width':anchotabla});
					$divBody = $wrapper.find('div.fht-tbody');

					if (!$tabla.hasClass('fht-table-init'))
					{

						$divHead = $('<div class="fht-thead"></div>').prependTo($fixedBody).css({'width':anchotabla});
						
						tablaTH.css({'width':anchotabla});

						$divHead.append(tablaTH).css({'width':anchotabla});
					}
					else
					{
						$divHead = $wrapper.find('div.fht-thead');
					}

					$tabla.css({
						'margin-top': -$tabla.find('thead').outerHeight(true)
					});

					var tbodyHeight = $wrapper.height() - $divHead.outerHeight(true);

					$divBody.css({
						'height': tbodyHeight
					});

					$tabla.addClass('fht-table-init');

					var $fixedColumn    = $wrapper.find('.fht-fixed-column');

					var	$thead          = $('<div class="fht-thead"></div>').append($tablaTHCol),
						$tbody          = $('<div class="fht-tbody"></div>').append($tablaTBCol),
						$fixedBody      = $wrapper.find('.fht-fixed-body'),
						fixedBodyWidth  = $wrapper.width(),
						fixedBodyHeight = $fixedBody.find('.fht-tbody').outerHeight() - settings.scrollbarOffset;

					$thead.appendTo($fixedColumn);

					var AnchoCol = $thead.find('table').width()+1;

					$thead.find('table').css({'width': AnchoCol,'height':$divHead.outerHeight(true)});
					$tbody.find('table').css({'width': AnchoCol});

					$tbody.appendTo($fixedColumn).css({
						'height': fixedBodyHeight+2,
						'background-color': '#ffffff'
					});
					
					$fixedColumn.css({
						'width':  AnchoCol
					});
					
					$fixedBody.css({
						'width': fixedBodyWidth
					});

					helpers._OnScroll($divBody);

					return tabla;
				};
			}
		};
		var helpers  =
		{
			/*
				* return boolean
				* valida si el elemento tien un thead y un tbody.
			*/
			_EsUnaTabla: function($obj)
			{
				var $tabla = $obj,
				TieneTable = $tabla.is('table'),
				TieneThead = $tabla.find('thead').length > 0,
				TieneTbody = $tabla.find('tbody').length > 0;

				if (TieneTable && TieneThead && TieneTbody)
				{
					return true;
				}

				return false;
			},
			_ObtenerAsignarAnchoAltoThead: function($obj)
			{
				var $lobTable = $obj;

				$lobTable.find("thead tr").each(function()
				{
					$(this).find("th").each(function()
					{
						if( settings.coloreacelda )
							$(this).css({'background-color': settings.colorcelda});

						$(this).css({'width':$(this).width(),'height':$(this).height(),'overflow': 'hidden'});
					});
				});
			},
			_ObtenerAsignarAnchoAlto: function($obj)
			{
				var $tabla                 = $obj,
					lstTipoThTd            = "",
					lnuCuentaColumnasFila  = 1,
					lnuColumnasFijas       = settings.Columnas,
					lboRowspan             = false,
					lboColspan             = false,
					lboMasColumnas         = true,
					lboFaltaColumnaFila    = false,
					lnuCuantosColspan      = 0,
					lnuCuentaColspan       = 0,
					lnuCuantosRowspan      = 0,
					lnuCuentaRowspan       = 0,
					lnuCuentaRowspanFaltan = 0;

				$tabla.find("tr").each(function(lnuFila)
				{
					lstTipoThTd = ( $(this).parent().is('thead') ) ? 'th' : ( $(this).parent().is('tbody') ) ? 'td' : ( $(this).parent().is('tfoot') ) ? 'td' : 'undefined';

					//-- Asignar un identificador a las filas, si no lo tienen.
					if( $(this).parent().is('tbody') || $(this).parent().is('tfoot') )
					{
						lstSigla = ( $(this).parent().is('thead') ) ? 'th' : ( $(this).parent().is('tbody') ) ? 'tb' : ( $(this).parent().is('tfoot') ) ? 'tf' : 'undefined';
						lstIdTr  = lstSigla+lnuFila;

						if( settings.lboHoverTr )
							if( !$(this).attr("id") )
								$(this).attr("id",lstIdTr);
					}

					if ( !lboRowspan )
					{
						$(this).find( lstTipoThTd ).each(function(lnuCell)
						{
							if ( lnuCuentaColumnasFila <= lnuColumnasFijas )
							{
								if ( $(this).attr("rowspan") > 1 )
								{
									if ( $(this).attr( "colspan" ) > 1)
										lnuCuentaRowspan = lnuCuentaRowspan-parseInt($(this).attr( "colspan" ))-1;
									else
										lnuCuentaRowspan++;

									if( lnuCuantosRowspan < $(this).attr("rowspan") )
									{
										lnuCuantosRowspan = $(this).attr("rowspan")-1;
										lboFaltaColumnaFila   = true;
									}
									else
										lboFaltaColumnaFila   = true;

									lnuCuentaRowspanFaltan = $(this).attr("rowspan")-1;
									lboRowspan             = true;
								}

								if ( $(this).attr( "colspan" ) > 1 )
									lnuCuentaColumnasFila += parseInt($(this).attr( "colspan" ));
								else
									lnuCuentaColumnasFila++;
								
								if( settings.coloreacelda )
									$(this).css({'background-color': settings.colorcelda});

								$(this).css({'width':$(this).width(),'height':$(this).height(),'overflow': 'hidden'});
							}
						});

						lnuCuentaColumnasFila = 1;

						if( lboRowspan )
							lnuCuantosRowspan--;
					}
					else
					{
						var lnuFaltan = lnuColumnasFijas - lnuCuentaRowspan;
							lnuCuentaRowspanFaltan--;

						if ( lnuCuantosRowspan-- <= 0 )
						{
							lboRowspan        = false;
							lnuCuentaRowspan  = 0;

							if( lnuFaltan > 0 )
							{
								lnuCuentaColumnasFila3 = 1;
								lnuColumnasFijas3      = lnuFaltan;

								$(this).find( lstTipoThTd ).each(function(lnuCell)
								{
									if ( lnuCuentaColumnasFila3 <= lnuColumnasFijas3 )
									{
										if ( $(this).attr( "colspan" ) > 1 )
											lnuCuentaColumnasFila3 += parseInt($(this).attr( "colspan" ));
										else
											lnuCuentaColumnasFila3++;
										
										if( settings.coloreacelda )
											$(this).css({'background-color': settings.colorcelda});

										$(this).css({'width':$(this).width(),'height':$(this).height(),'overflow': 'hidden'});
									}
								});

								lnuCuentaColumnasFila3 = 1;
							}				
						}
						else
						{
							lnuCuentaColumnasFila2 = 1;
							lnuColumnasFijas2      = lnuFaltan;

							$(this).find( lstTipoThTd ).each(function(lnuCell)
							{
								if ( lnuCuentaColumnasFila2 <= lnuColumnasFijas2 )
								{
									if ( $(this).attr( "colspan" ) > 1 )
										lnuCuentaColumnasFila2 += parseInt($(this).attr( "colspan" ));
									else
										lnuCuentaColumnasFila2++;
									
									if( settings.coloreacelda )
										$(this).css({'background-color': settings.colorcelda});

									$(this).css({'width':$(this).width(),'height':$(this).height(),'overflow': 'hidden'});
								}
							});

							lnuCuentaColumnasFila2 = 1;
						}
						
					};
				});
			},
			_ClonarHeaderColumnasACongelar: function($pobTabla,$ponDonde,pstTipoThTbTf,pnuCuantasCols)
			{
				var lnuCuentaColumnasFila  = 1,
					lnuColumnasFijas       = pnuCuantasCols,
					lboRowspan             = false,
					lboColspan             = false,
					lboMasColumnas         = true,
					lboFaltaColumnaFila    = false,
					lnuCuantosColspan      = 0,
					lnuCuentaColspan       = 0,
					lnuCuantosRowspan      = 0,
					lnuCuentaRowspan       = 0,
					lnuCuentaRowspanFaltan = 0,
					$lobTrThTd             = $pobTabla.find(pstTipoThTbTf),
					lstTipoThTd            = (pstTipoThTbTf == "thead") ? "th" : (pstTipoThTbTf == "tbody" || pstTipoThTbTf =='tfoot') ? "td" : "td",
					$lobClonarTrThTd;

				$lobTrThTd.find("tr").each(function(lnuFila)
				{
					if( settings.lboHoverTr )// Asignar el evento hover a las filas para marcarlas.
						if( pstTipoThTbTf =='tbody' || pstTipoThTbTf =='tfoot' )
						{
							$(this).hover(
								function()
								{
									lstIdTr = "#"+$(this).attr("id");
									$(this).css( "background", "rgba(182,227,250,0.6)" );
									$(lstIdTr).css( "background", "rgba(182,227,250,0.6)" );
								},
								function() {
									lstIdTr = "#"+$(this).attr("id");
									$(this).css( "background", "" );
									$(lstIdTr).css( "background", "" );
								}
							);
						}

					if ( !lboRowspan )
					{
						var tr = $(this).clone(true).html("");

						$(this).find( lstTipoThTd ).each(function(lnuCell)
						{
							if ( lnuCuentaColumnasFila <= lnuColumnasFijas )
							{
								if ( $(this).attr("rowspan") > 1 )
								{
									if ( $(this).attr( "colspan" ) > 1 )
										lnuCuentaRowspan = lnuCuentaRowspan-parseInt($(this).attr( "colspan" ))-1;
									else
										lnuCuentaRowspan++;

									if( lnuCuantosRowspan < $(this).attr("rowspan") )
									{
										lnuCuantosRowspan = $(this).attr("rowspan")-1;
										lboFaltaColumnaFila   = true;
									}
									else
										lboFaltaColumnaFila   = true;

									lnuCuentaRowspanFaltan = $(this).attr("rowspan")-1;
									lboRowspan             = true;
								}

								if ( $(this).attr( "colspan" ) > 1 )
									lnuCuentaColumnasFila += parseInt($(this).attr( "colspan" ));
								else
									lnuCuentaColumnasFila++;
								
								if (lnuCell == 0)
								{
									$lobClonarTrThTd = tr.appendTo($ponDonde.find(pstTipoThTbTf));
									$lobClonarTrThTd.append($(this).clone());
								}
								else
									$lobClonarTrThTd.append($(this).clone());
							}
						});

						lnuCuentaColumnasFila = 1;

						if( lboRowspan )
							lnuCuantosRowspan--;
					}
					else
					{
						var lnuFaltan = lnuColumnasFijas - lnuCuentaRowspan;
							lnuCuentaRowspanFaltan--;

						if ( lnuCuantosRowspan-- <= 0 )
						{
							lboRowspan        = false;
							lnuCuentaRowspan  = 0;

							if( lnuFaltan > 0 )
							{
								lnuCuentaColumnasFila3 = 1;
								lnuColumnasFijas3      = lnuFaltan;
								var tr                 = $(this).clone(true).html("");

								$(this).find( lstTipoThTd ).each(function(lnuCell)
								{
									if ( lnuCuentaColumnasFila3 <= lnuColumnasFijas3 )
									{
										if ( $(this).attr( "colspan" ) > 1 )
											lnuCuentaColumnasFila3 += parseInt($(this).attr( "colspan" ));
										else
											lnuCuentaColumnasFila3++;
										
										if (lnuCell == 0)
										{
											$lobClonarTrThTd = tr.appendTo($ponDonde.find(pstTipoThTbTf));
											$lobClonarTrThTd.append($(this).clone());
										}
										else
											$lobClonarTrThTd.append($(this).clone());
									}
								});

								lnuCuentaColumnasFila3 = 1;
							}
							else
							{
								var tr = $(this).clone(true).html("");
								tr.appendTo($ponDonde.find(pstTipoThTbTf));
							}				
						}
						else
						{
							if( lnuFaltan > 0 )
							{
								lnuCuentaColumnasFila2 = 1;
								lnuColumnasFijas2      = lnuFaltan;
								var tr                 = $(this).clone(true).html("");

								$(this).find( lstTipoThTd ).each(function(lnuCell)
								{
									if ( lnuCuentaColumnasFila2 <= lnuColumnasFijas2 )
									{
										if ( $(this).attr( "colspan" ) > 1 )
											lnuCuentaColumnasFila2 += parseInt($(this).attr( "colspan" ));
										else
											lnuCuentaColumnasFila2++;
										
										if (lnuCell == 0)
										{
											$lobClonarTrThTd = tr.appendTo($ponDonde.find(pstTipoThTbTf));
											$lobClonarTrThTd.append($(this).clone());
										}
										else
											$lobClonarTrThTd.append($(this).clone());
									}
								});

								lnuCuentaColumnasFila2 = 1;
							}
							else
							{
								var tr = $(this).clone(true).html("");
								tr.appendTo($ponDonde.find(pstTipoThTbTf));
							}
						}
					};
				});
			},
			_OnScroll: function($obj)
			{
				var $tabla   = $obj,
					$wrapper = $tabla.closest('.fht-table-wrapper'),
					$thead   = $tabla.siblings('.fht-thead');

				$tabla.on('scroll', function()
				{
					if( !settings.soloThead )
					{
						var $fixedColumns = $wrapper.find('.fht-fixed-column');

						$fixedColumns.find('.fht-tbody table').css({
							'margin-top': -$tabla.scrollTop()
						});
					}

					$thead.find('table').css({
						'margin-left': -this.scrollLeft
					});

				});
			},
			_OptenerWidthBarraScroll: function()
			{
				var scrollbarWidth = 0;

				if (!scrollbarWidth)
				{
					if (/msie/.test(navigator.userAgent.toLowerCase()))
					{
						var $textarea1 = $('<textarea cols="10" rows="2"></textarea>').css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
							$textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>').css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');

						scrollbarWidth = $textarea1.width() - $textarea2.width() + 2; 
						$textarea1.add($textarea2).remove();

					}
					else
					{
						var $div = $('<div />').css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
											.prependTo('body').append('<div />').find('div')
											.css({ width: '100%', height: 200 });

						scrollbarWidth = 100 - $div.width();
						$div.parent().remove();

					}
				}

				return scrollbarWidth;
			}
		};
		
		if (methods[method])
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method)
			return methods.init.apply(this, arguments);
		else
			$.error('El Método "' +  method + '" No existe en el plugin CongelarFilaColumna! :( ');

	}
})(jQuery);