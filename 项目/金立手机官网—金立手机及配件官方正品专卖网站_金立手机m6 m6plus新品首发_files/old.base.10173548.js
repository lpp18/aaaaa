/* =========================================
base.js:全站公用的脚本
============================================ */
var undefined;

// 设置ie6背景缓存
(function(navigator){
	var browser = new Object();
	browser.name=navigator.appName;
	if(browser.name.indexOf("Microsoft")!=-1){
		browser.version=navigator.appVersion.indexOf("MSIE");
		browser.version=parseInt(navigator.appVersion.substring(browser.version+4));
		if(browser.version<=6){
			document.execCommand("BackgroundImageCache", false, true);
		}
	}
})(window.navigator);

/* ===================================================
@ js 组件:
* 以$开头
* 类首字母大写，方法首字母小写
====================================================== */
/* --------------------------
* $id:获取dom元素
* param {sring/dom} id：id或dom元素
* return {dom} : 返回dom元素
----------------------------- */
function $id(id) {
	return typeof (id) == "string" ? document.getElementById(id) : id;
}

/* --------------------------
* 判断ie6
----------------------------- */
function $isIE6(){	
	var browser = new Object(),result=false;
	browser.name=window.navigator.appName;  
	if(browser.name.indexOf("Microsoft")!=-1){
		browser.version=window.navigator.appVersion.indexOf("MSIE");
		browser.version=parseInt(window.navigator.appVersion.substring(browser.version+4));
		if(browser.version<=6){
			result=true;
		}
	}
	return result;
}

/* ---------------------------------------------------
* $DelayLoad ：延时加载
* @ param {string/dom} o:延迟的范围
------------------------------------------------------ */
function $DelayLoad(o,undefined){
	var othis=this;
	othis._selfId=(++othis.constructor._newNum);
	othis._selfName=".$DelayLoad"+othis._selfId;
	
	if(o!=undefined){
		othis.oContent=$id(o).getElementsByTagName("img");
	}else{
		othis.oContent=document.images;
	}
	
	othis.init();
}
$DelayLoad.prototype={
	init:function(){
		var othis=this;
		
		if(othis.oContent.length == 0){ return false;}	
		
		othis.oLoadItems=new Array();
		for(var i=0,len=othis.oContent.length;i<len;i++){
			if(othis.oContent[i].attributes["init_src"]){
				othis.oLoadItems.push($(othis.oContent[i]));
			}
		}
		if(othis.oLoadItems.length == 0){return false; }
		
		$(window).bind("scroll"+othis._selfName+" resize"+othis._selfName,othis,othis.fnLoad);			
		othis.fnLoad();	
	},
	fnLoad:function(e){
		var othis=(e && e.data) || this;		
		var owin=$(window),oLoad=othis.oLoadItems;
		var scrollStart=owin.scrollTop(),winH=owin.height(),end=scrollStart+winH;
		
		var sum=oLoad.length;
		for(var i=0;i<sum;i++){ 
			
		   if(oLoad[i].attr("src")==oLoad[i].attr("init_src")){
				oLoad.splice(i,1);
				i--;
				sum--;
				continue;
			}		
			
			var offTop=parseInt(oLoad[i].offset().top); 
			var offBottom=parseInt(offTop+(oLoad[i].outerHeight() || othis.height));		
			
			if((offTop >= scrollStart && offTop <=end) || (offBottom>=scrollStart && offBottom <= end || (offTop<scrollStart && offBottom > end))){
				oLoad[i].attr("src",oLoad[i].attr("init_src"));
				oLoad.splice(i,1);
				i--;
				sum--;
			}
		}
			
		if(sum==0){
			$(window).unbind("scroll"+othis._selfName+" resize"+othis._selfName);
		}			
	}
};
$DelayLoad._newNum=0;
$DelayLoad.prototype.constructor=$DelayLoad;

/* --------------------------------
* $FocusBlur :
* callback {function} callback:回调 ，带有两个参数，isFocus：是否为focus，isNull是否为空
----------------------------------- */
function $FocusBlur(o){
	if(o==undefined){return;}
	
	this.otxt=$id(o.otxt);
	this.config.cssFocus=o.config.cssFocus || this.config.cssFocus;
	this.config.defValue=o.config.defValue || this.config.defValue;
	this.callback=typeof callback=="function"?callback:this.callback;
	
	//初始化
	this.init();
}
$FocusBlur.prototype={
	config:{cssFocus:"focus",defValue:""},
	callback:function(){},
	init:function(){
		var that=this,otxt=that.otxt;
		
		// 绑定	
		$(otxt).bind("focus",that,that.focusHandler);
		$(otxt).bind("blur",that,that.blurHandler);
		
		// 设置状态
		if(otxt.value.length==0 || otxt.value==that.config.defValue){
			otxt.value=that.config.defValue;
			otxt.style.color="#999999";
		}else{
			otxt.style.color="#000000";
		}
	},
	focusHandler:function(e){
		var that=e.data,isNull=false,cfg=that.config,o=that.otxt;
		$(o).addClass(cfg.cssFocus);
		o.style.color="#000000";
		if(o.value == cfg.defValue){
			isNull=true;
			o.value="";	
		}
		that.callback(true,isNull);
	},
	blurHandler:function(e){
		var that=e.data,isNull=false,cfg=that.config,o=that.otxt;
		$(o).removeClass(cfg.cssFocus);
		if(o.value.length==0){
			isNull=true;
			o.value=cfg.defValue;
			o.style.color="#999999";	
		}
		that.callback(false,isNull);
	}
};
$FocusBlur.prototype.constructor=$FocusBlur;

/* --------------------------
* $Hover ： hover效果
* param {Object} obj :hover 的元素
* param {String} cssHover : hover时的样式
* param {String /obj selectorPanel} : 展开的元素
* param {number} speed : 展开的时间
* param {number} delay : 延迟展开的时间
* param {function} onBefore : 展开之前的操作
*---------------------------- */
function $Hover(o){
	var othis=this;
	if(!o || o.obj==undefined){
		return;
	}else{
		othis.obj=$(o.obj);	
		othis.oPanel=othis.obj.find(o.selectorPanel);
	}
	othis.config=$.extend({},othis.config,o.config);
	
	// 初始化
	othis.obj.bind("mouseenter",othis,othis.mouseenterHandler);	
	othis.obj.bind("mouseleave",othis,othis.mouseleaveHandler);		
}
$Hover.prototype={
		config:{onBefore:null,cssHover:"curr",speed:200,delay:2,onAfter:null},
		mouseenterHandler:function(e){
			var eData=e.data,cfg=eData.config;
			eData._timeout=setTimeout(function(){
				if(eData.config.onBefore!=null){
					eData.config.onBefore(eData);
				}
				eData.oPanel.stop(false,true);
				eData.obj.addClass(cfg.cssHover);	
				eData.oPanel.slideDown(cfg.speed);
				return eData._timeout;},cfg.delay);
		},
		mouseleaveHandler:function(e){
			var eData=e.data,cfg=eData.config;
			clearTimeout(eData._timeout);
			if(eData.obj.hasClass(cfg.cssHover)){
				eData.oPanel.stop(false,true);
				eData.oPanel.slideUp(cfg.speed,function(){
					eData.obj.removeClass(cfg.cssHover);
					if(eData.config.onAfter!=null){
						eData.config.onAfter(eData);
					}
				});	
			}
		}
};
$Hover.prototype.constructor=$Hover;

/* --------------------------------------------------
@ $Slide:滚动切换
----------------------------------------------------- */
function $Slide(o,undefined){
	var othis=this,undefined;
	othis.timeout=null;
	othis._selfID=(++othis.constructor._newNum);
	othis._selfName=".$Slide"+othis._selfID;
	
	if(!o){return;}
	if(o.config!=undefined){
		othis.config=$.extend({},othis.config,o.config);	
	}
	if(o.oslide!=undefined){
		othis.oslide=$(o.oslide);
		othis.oPanel=othis.oslide.find(othis.config.panelSelector);
		othis.oItems=othis.oPanel.find(othis.config.itemsSelector);
		othis.oOptionsCon=othis.oslide.find(othis.config.optionsSelector);
		othis.oOptions=othis.oOptionsCon.find(othis.config.optionSelector);
	}
}
$Slide.prototype={
	config:{pos:0,isRandom:false,speed:400,delay:4000,auto:false,moveWay:"moveWidth",itemsSelector:".ui_slide_item",panelSelector:".ui_slide_panel",optionSelector:".ui_slide_option",optionsSelector:".ui_slide_options",optionCSSCurr:"ui_slide_option_curr",itemCSSCurr:"ui_slide_item_curr",itemWidth:0,itemHeight:0,onBeforeMove:null,isDelay:false},
	autoPlay:function(){
		var othis=this;
		clearTimeout(othis.timeout);
		othis.config.pos++;
		othis.move();
		othis.timeout=setTimeout(function(){othis.autoPlay(); return othis.timeout;},othis.config.delay);
	},
	setPos:function(){
		var othis=this;
		othis.config.pos>=othis.sum?othis.config.pos=othis.config.pos-othis.sum:othis.config.pos=othis.config.pos;
	},
	itemsHandler: function(e){
		var othis=e.data;
		clearTimeout(othis.timeout);	
	},
	optionsEnterHandler:function(e){
		var othis=e.data,cfg=othis.config,oself=$(this);
		othis.delayTimeout=setTimeout(function(){ 
			clearTimeout(othis.timeout);
			var index=othis.oOptions.index(oself);
			cfg.pos=index;
			othis.move();				
		},200);		
	},
	leaveHandler:function(e){
		var othis=e.data;
		clearTimeout(othis.delayTimeout);
		if(othis.config.auto){
			clearTimeout(othis.timeout);
			othis.timeout=setTimeout(function(){othis.autoPlay(); return othis.timeout;},othis.config.delay);
		}
	},
	init:function(){
	   var othis=this,cfg=othis.config;
	   var sum=othis.oOptions.length;
	   othis.sum=sum;
	   
	   if(sum==0){othis.oslide.hide();return false;}
	   if(sum==1){
		   othis.oOptions.hide();
		   othis.oItems.addClass(cfg.itemCSSCurr);
		   if(othis.config.isDelay){
			  cfg.pos=0;
			  $(window).bind("resize"+othis._selfName+" scroll"+othis._selfName,othis,othis.fnDelay);
			  othis.fnDelay(); 
		   }
		   return false;
	   }
	   
	   if(cfg.isRandom){
			cfg.pos=Math.floor(othis.sum*Math.random());
	   }
	   
	   othis.setMoveWay();
	   
	   if(othis.config.isDelay){
		  othis.config.onBeforeMove=othis.fnDelay; 
		  $(window).bind("resize"+othis._selfName+" scroll"+othis._selfName,othis,othis.fnDelay);
		  othis.fnDelay();
	   }
	   
	   othis.oItems.mouseenter(othis,othis.itemsHandler);
	   othis.oOptions.mouseenter(othis,othis.optionsEnterHandler);
	   othis.oOptions.mouseleave(othis,othis.leaveHandler);
		
		if(cfg.auto){
			othis.oItems.mouseleave(othis,othis.leaveHandler);
			othis.timeout=setTimeout(function(){othis.autoPlay(); return othis.timeout;},cfg.delay);	
		}			
	},
	move:function(){
		if(this.config.onBeforeMove){
			this.onBeforeMove=this.config.onBeforeMove;
			this.onBeforeMove();	
		}	
		this.movefunc();		
	},
	setMoveWay:function(){			
		var othis=this,cfg=othis.config;	
		othis.oInitMoveWay[cfg.moveWay](othis);
		othis.movefunc=othis.oMoveWays[cfg.moveWay];
	},
	setStatus:function(){
		var othis=this,cfg=othis.config;
		othis.oItems.removeClass(cfg.itemCSSCurr);	
		othis.oItems.eq(cfg.pos).addClass(cfg.itemCSSCurr);
		othis.oOptions.removeClass(cfg.optionCSSCurr);
		othis.oOptions.eq(cfg.pos).addClass(cfg.optionCSSCurr);
	},
	oInitMoveWay:{
		 // moveWidth 移动宽度
		 moveWidth:function(e){
			 var othis=e,cfg=othis.config;
			 othis.itemValue=othis.config.itemWidth || othis.oItems.eq(0).outerWidth(true); 
			 othis.oPanel.css({"width":othis.itemValue*othis.sum});
			 othis.setPos();
			 othis.oPanel.css({"left":-cfg.pos*othis.itemValue});
			 othis.setStatus();
		},
		
		// moveHeight 移动高度
		moveHeight:function(e){	
			var othis=e,cfg=othis.config;
			othis.itemValue=othis.config.itemHeight || othis.oItems.eq(0).outerHeight(true);
			othis.oPanel.css({"height":othis.itemValue*othis.sum});
			othis.setPos();
			othis.oPanel.css({"top":-cfg.pos*othis.itemValue});
			othis.setStatus();
		},
		
		// moveNone:直接切换，没有特效
		moveNone:function(e){
			  var othis=e,cfg=othis.config;
				 othis.setPos();
				 othis.oItems.hide();
				 othis.oItems.eq(cfg.pos).show();
				 othis.setStatus();	
		},
		
		// moveOpacity 改变透明度
		moveOpacity:function(e){
				var othis=e,cfg=othis.config;
				 othis.setPos();
				 othis.oItems.hide();
				 othis.oItems.eq(cfg.pos).show();
				 othis.setStatus();	
			},
		
		// moveWidthC 移动宽度--无痕的
		
		// moveHeightC 移动高度--无痕的
		moveHeightC:function(e){
			var othis=e;
			othis.oItemsFirst=othis.oItems.eq(0);
			othis.oItemsFirst.css("position","relative");
			othis.itemValue=othis.config.itemWidth || othis.oItemsFirst.outerWidth(true);
			othis.oPanel.css({"width":othis.itemValue*(othis.sum+1)});	
			othis.setPos();
			othis.oPanel.css({"left":-cfg.pos*othis.itemValue});
			othis.setStatus();	
		}
	},
	oMoveWays:{
		// moveWidth 移动宽度
		 moveWidth:function(){
			var othis=this,cfg=othis.config;
			othis.oPanel.stop(false,true);
			othis.setPos();
			othis.setStatus();
			othis.oPanel.animate({"left":-cfg.pos*othis.itemValue},cfg.speed);
		 },
		 
		 // moveHeight 移动高度
		 moveHeight:function(){
			var othis=this,cfg=othis.config;
			othis.oPanel.stop(false,true);
			othis.setPos();
			othis.oPanel.animate({"top":-cfg.pos*othis.itemValue},cfg.speed);
			othis.setStatus();
		 },
		
		// moveNone:直接切换，没有特效
		moveNone:function(){
			var othis=this,cfg=othis.config;
			othis.setPos();
			othis.setStatus();
			othis.oItems.hide();
			othis.oItems.eq(cfg.pos).show();
		},
		
		// moveOpacity 改变透明度
		moveOpacity:function(){
			var othis=this,cfg=othis.config;
			othis.setPos();
			othis.oItems.hide();
			othis.oItems.eq(cfg.pos).fadeIn();
			othis.setStatus();
		},
		
		// moveHeightC 移动高度--无痕的
		moveHeightC:function(){
			var othis=this,cfg=othis.config;
			othis.oPanel.stop(false,true);
			
			if(cfg.pos>othis.sum-1){
				othis.oItemsFirst.css({"left":othis.itemValue*othis.sum});
				othis.oPanel.animate({"left":-cfg.pos*othis.itemValue},cfg.speed,function(){
					othis.oPanel.css("left",0);
					othis.oItemsFirst.css("left",0);
				});
				cfg.pos=cfg.pos-othis.sum;
				othis.setStatus();
			}else if(othis.pos<0){
				cfg.pos=cfg.pos+othis.sum;
				othis.setStatus();
				othis.oPanel.css("left",-othis.itemValue*othis.sum);
				othis.oItemsFirst.css({"left":othis.itemValue*othis.sum});
				othis.oPanel.animate({"left":-(cfg.pos*othis.itemValue)},cfg.speed,function(){
					othis.oItemsFirst.css("left",0);
				});
			}else{
				othis.setStatus();
				othis.oPanel.animate({"left":-cfg.pos*othis.itemValue},cfg.speed);
			} 
		}
	},
	fnDelay:function(e){
		var othis=(e && e.data) || this,oimgs;
		if(!othis.oDelayImgs){
			oimgs=othis.oslide.find("img");	
			othis.oDelayImgs=new Array();	
			oimgs.each(function(){
				if($(this).attr("orial_src")){othis.oDelayImgs.push(this);}	
			});		
		};
		var spos=othis.config.pos;
		if(spos>othis.oItems.length-1){spos=spos-othis.oItems.length;}
		oimgs=othis.oItems.eq(spos).find("img");
		
		var owin=$(window);	
		var scrollStart=owin.scrollTop(),winH=owin.height(),end=scrollStart+winH;
		
		var sum=oimgs.length;
		oimgs.each(function(){
			var oself=$(this);
			var offTop=parseInt(oself.offset().top);
			var offBottom=parseInt(offTop+(oself.outerHeight() || 800));
			if((offTop>=scrollStart && offTop <=end) || (offBottom>=scrollStart && offBottom <= end )){
				oself.attr("src",oself.attr("orial_src"));
				for(var i=0;i<othis.oDelayImgs.length;i++){
					if(othis.oDelayImgs[i]== this){othis.oDelayImgs.splice(i,1);i--;break;}	
				}
			}	
		});
		if(othis.oDelayImgs.length==0){ othis.config.onBeforeMove=null; $(window).unbind("resize"+othis._selfName+" scroll"+othis._selfName);}
	}	
};
$Slide.prototype.constructor=$Slide;
$Slide._newNum=0;
$Slide.play=function(o){
	var obj=new $Slide(o);
	obj.init();
	return obj;
};

/* --------------------------------------------------
@ $SlideSimple:循环切换
----------------------------------------------------- */
function $SlideSimple(o){
	var othis=this;
	othis.timeout=null;
	
	if(!o){return;}
	if(o.config!=undefined){
		othis.config=$.extend({},othis.config,o.config);	
	}
	if(o.oslide!=undefined){
		othis.oslide=$(o.oslide);
		othis.oItems=othis.oslide.find(othis.config.itemsSelector);
		othis.oPanel=othis.oslide.find(othis.config.panelSelector);
	}
}
$SlideSimple.prototype={
	config:{pos:0,isRandom:false,speed:400,delay:4000,moveWay:"moveHeightC",itemsSelector:".ui_slide_item",panelSelector:".ui_slide_panel"},
	autoPlay:function(){
		var othis=this;
		clearTimeout(othis.timeout);
		othis.config.pos++;
		othis.move();
		othis.timeout=setTimeout(function(){othis.autoPlay(); return othis.timeout;},othis.config.delay);
	},
	setPos:function(){
		var othis=this;
		othis.config.pos>=othis.sum?othis.config.pos=othis.config.pos-othis.sum:othis.config.pos=othis.config.pos;
	},
	itemsHandler: function(e){
		var othis=e.data;
		var index=othis.oItems.index(this);
		if(index==othis.config.pos){
			clearTimeout(othis.timeout);					
		};
	},
	leaveHandler:function(e){
		var othis=e.data;
			othis.timeout=setTimeout(function(){othis.autoPlay(); return othis.timeout;},othis.config.delay);
	},
	init:function(){
	   var othis=this,cfg=othis.config;
	   var sum=othis.oItems.length;
	   othis.sum=sum;
	   
	   if(sum==0){othis.oslide.hide();return false;}
	   if(sum==1){return false;}
	   
	   othis.setMoveWay();
	   
	   othis.oItems.mouseenter(othis,othis.itemsHandler);
	   
	   cfg.pos=Math.floor(othis.sum*Math.random());
	   othis.move();
	   othis.oItems.mouseleave(othis,othis.leaveHandler);
	   othis.timeout=setTimeout(function(){othis.autoPlay(); return othis.timeout;},cfg.delay);						
	},
	setMoveWay:function(){			
		var othis=this,cfg=othis.config;	
		othis.oInitMoveWay[cfg.moveWay](othis);
		othis.move=othis.oMoveWays[cfg.moveWay];
	},
	oInitMoveWay:{
		 // moveWidth 绉诲姩瀹藉害
		 moveWidth:function(e){
			 var othis=e;
			 othis.oItemsFirst=othis.oItems.eq(0);
			 othis.itemValue=othis.oItemsFirst.outerWidth(true);
			 othis.oPanel.css({"width":othis.itemValue*othis.sum});
		},
		
		// moveHeight 绉诲姩楂樺害
		moveHeight:function(e){	
			var othis=e;
			othis.oItemsFirst=othis.oItems.eq(0);
			othis.itemValue=othis.oItemsFirst.outerWidth(true);
			othis.oPanel.css({"height":othis.itemValue*othis.sum});
		},
		
		// moveNone:鐩存帴鍒囨崲锛屾病鏈夌壒鏁�
		moveNone:function(){},
		
		// moveOpacity 鏀瑰彉閫忔槑搴�
		moveOpacity:function(){},
		
		// moveWidthC 绉诲姩瀹藉害--鏃犵棔鐨�
		moveWidthC:function(e){
			var othis=e;
			othis.oItemsFirst=othis.oItems.eq(0);
			othis.oItemsFirst.css("position","relative");
			othis.itemValue=othis.oItemsFirst.outerWidth(true);
			othis.oPanel.css({"widthd":othis.itemValue*(othis.sum+1)});	
		},
		
		// moveHeightC 绉诲姩楂樺害--鏃犵棔鐨�
		moveHeightC:function(e){
			var othis=e;
			othis.oItemsFirst=othis.oItems.eq(0);
			othis.oItemsFirst.css("position","relative");
			othis.itemValue=othis.oItemsFirst.outerHeight(true);
			othis.oPanel.css({"height":othis.itemValue*(othis.sum+1)});	
		}
	},
	oMoveWays:{
		// moveWidth 绉诲姩瀹藉害
		 moveWidth:function(){
			var othis=this,cfg=othis.config;
			othis.oPanel.stop(false,true);
			othis.setPos();
			othis.oPanel.animate({"left":-cfg.pos*othis.itemValue},cfg.speed);
		 },
		 
		 // moveHeight 绉诲姩楂樺害
		 moveHeight:function(){
			var othis=this,cfg=othis.config;
			othis.oPanel.stop(false,true);
			othis.setPos();
			othis.oPanel.animate({"top":-cfg.pos*othis.itemValue},cfg.speed);
		 },
		
		// moveNone:鐩存帴鍒囨崲锛屾病鏈夌壒鏁�
		moveNone:function(){
			var othis=this,cfg=othis.config;
			othis.setPos();
			othis.oItems.hide();
			othis.oItems.eq(cfg.pos).show();
		},
		
		// moveOpacity 鏀瑰彉閫忔槑搴�
		moveOpacity:function(){
			var othis=this,cfg=othis.config;
			othis.setPos();
			othis.oItems.hide();
			othis.oItems.eq(cfg.pos).fadeIn();
		},
		
		// moveWidthC 绉诲姩瀹藉害--鏃犵棔鐨�
		moveWidthC:function(){
			var othis=this,cfg=othis.config;
			othis.oPanel.stop(false,true);
			
			if(cfg.pos>othis.sum-1){
				othis.oItemsFirst.css({"left":othis.itemValue*othis.sum});
				othis.oPanel.animate({"left":-cfg.pos*othis.itemValue},cfg.speed,function(){
					othis.oPanel.css("left",0);
					othis.oItemsFirst.css("left",0);
				});
				cfg.pos=cfg.pos-othis.sum;
			}else if(othis.pos<0){
				cfg.pos=cfg.pos+othis.sum;
				othis.oPanel.css("left",-othis.itemValue*othis.sum);
				othis.oItemsFirst.css({"left":othis.itemValue*othis.sum});
				othis.oPanel.animate({"left":-(cfg.pos*othis.itemValue)},cfg.speed,function(){
					othis.oItemsFirst.css("left",0);
				});
			}else{
				othis.oPanel.animate({"left":-cfg.pos*othis.itemValue},cfg.speed);
			} 
		},
		
		// moveHeightC 绉诲姩楂樺害--鏃犵棔鐨�
		moveHeightC:function(){
			var othis=this,cfg=othis.config;
			othis.oPanel.stop(false,true);
			
			if(cfg.pos>othis.sum-1){
				othis.oItemsFirst.css({"top":othis.itemValue*othis.sum});
				othis.oPanel.animate({"top":-cfg.pos*othis.itemValue},cfg.speed,function(){
					othis.oPanel.css("top",0);
					othis.oItemsFirst.css("top",0);
				});
				cfg.pos=cfg.pos-othis.sum;
			}else if(othis.pos<0){
				cfg.pos=cfg.pos+othis.sum;
				othis.oPanel.css("top",-othis.itemValue*othis.sum);
				othis.oItemsFirst.css({"top":othis.itemValue*othis.sum});
				othis.oPanel.animate({"top":-(cfg.pos*othis.itemValue)},cfg.speed,function(){
					othis.oItemsFirst.css("top",0);
				});
			}else{
				othis.oPanel.animate({"top":-cfg.pos*othis.itemValue},cfg.speed);
			} 
		}
	}	
};
$SlideSimple.prototype.constructor=$SlideSimple;
$SlideSimple.play=function(o){
	var obj=new $SlideSimple(o);
	obj.init();
	return obj;
}

/* ---------------------------------------------------
@ $Tab : tab切换
------------------------------------------------------ */
function $Tab(o, undefined) {
    var othis = this;
    othis._selfID = (++othis.constructor._newNum);
    othis._selfName = ".$Tab" + othis._selfID;
    
    if (!o) {
        return;
    }
    if (o.config != undefined) {
        othis.config = $.extend({}, othis.config, o.config);
    }
    if (o.oTab != undefined) {
        othis.oTab = $(o.oTab);
        othis.oPanel = othis.oTab.find(othis.config.selectorPanel);
        othis.oItems = othis.oPanel.find(othis.config.selectorItem);
        othis.oOptionsCon = othis.oTab.find(othis.config.selectorOptions);
        othis.oOptions = othis.oOptionsCon.find(othis.config.selectorOption);
    }
	
	othis.init();
}
$Tab.prototype = {
    config: {pos: 0,isRandom: false,selectorItem: ".ui_tab_item",selectorPanel: ".ui_tab_panel",selectorOption: ".ui_tab_option",selectorOptions: ".ui_tab_options",cssOptionCurr: "ui_tab_option_curr",onBeforeMove: null,onAfterMove: null,isDelay: false},
    init: function() {
        var othis = this, cfg = othis.config;
        var sum = othis.oOptions.length;
        othis.sum = sum;
        
        if (sum == 0) {
            othis.oTab.hide();
            return false;
        }
        if (sum == 1) {
            cfg.pos = 0;
        } else {
            if (cfg.isRandom) {
                cfg.pos = Math.floor(sum * Math.random());
            }
            othis.oOptions.click(othis, othis.optionsEnterHandler);
        }
        
        if(cfg.isDelay) {
            cfg.onBeforeMove = othis.fnDelay;
            $(window).bind("resize" + othis._selfName + " scroll" + othis._selfName, othis, othis.fnDelay);
            othis.fnDelay();
        }
        
        othis.move();
    },
    move: function() {
        if (this.config.onBeforeMove) {
            this.onBeforeMove = this.config.onBeforeMove;
            this.onBeforeMove();
        }
        this.movefunc();
    },
    movefunc: function() {
        var othis = this, cfg = othis.config;
        othis.oItems.hide();
        othis.oItems.eq(cfg.pos).show();
        othis.oOptions.removeClass(cfg.cssOptionCurr);
        othis.oOptions.eq(cfg.pos).addClass(cfg.cssOptionCurr);
    },
    optionsEnterHandler: function(e) {
        var othis = e.data, cfg = othis.config, oself = $(this);
      //  othis._delayTimeout = setTimeout(function() {
      //      clearTimeout(othis._delayTimeout);
            var index = othis.oOptions.index(oself);
            cfg.pos = index;
            othis.move();
       // }, 200);
    },
    optionsLeaveHandler: function(e) {
        clearTimeout(e.data._delayTimeout);
    },
    fnDelay: function(e) {
        var othis = (e && e.data) || this, oimgs;
        if (!othis.oDelayImgs) {
            oimgs = othis.oslide.find("img");
            othis.oDelayImgs = new Array();
            oimgs.each(function() {
                if ($(this).attr("orial_src")) {
                    othis.oDelayImgs.push(this);
                }
            });
        }
        ;
        var spos = othis.config.pos;
        oimgs = othis.oItems.eq(spos).find("img");
        
        var owin = $(window);
        var scrollStart = owin.scrollTop(), winH = owin.height(), end = scrollStart + winH;
        
        var sum = oimgs.length;
        oimgs.each(function() {
            var oself = $(this);
            if (!oself.attr("orial_src")) {
                return;
            }
            
            var offTop = parseInt(oself.offset().top);
            var offBottom = parseInt(offTop + (oself.outerHeight() || 800));
            if ((offTop >= scrollStart && offTop <= end) || (offBottom >= scrollStart && offBottom <= end) || (offTop < scrollStart && offBottom > end)) {
                oself.attr("src", oself.attr("orial_src"));
                for (var i = 0; i < othis.oDelayImgs.length; i++) {
                    if (othis.oDelayImgs[i] == this) {
                        othis.oDelayImgs.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        });
        if (othis.oDelayImgs.length == 0) {
            othis.config.onBeforeMove = null;
            $(window).unbind("resize" + othis._selfName + " scroll" + othis._selfName);
        }
    }
};
$Tab.prototype.constructor = $Tab;
$Tab.play = function(o) {
    var obj = new $Tab(o);
    obj.init();
    return obj;
};

/* -------------------------------------------------
$Timeout:倒计时
---------------------------------------------------- */
function $Timeout(id,time,callback){
	if(!id){return false;}
	this.obj=document.getElementById(id);
	this.time=time || 0;
	if(typeof(callback) == "function"){
		this.callback=callback;
	}else{
		this.callback=function(){};
	}
	var that=this;
	that._timeout=setTimeout(function(){that.startTime();},1000);
}
$Timeout.prototype.startTime=function(){
	var that=this;	
	clearTimeout(that._timeout);
	that.time--;
	that.obj.innerHTML=that.time;
	if(that.time>0){
		that._timeout=setTimeout(function(){
			that.startTime();	
		},1000);
	}else{
		that.callback();
	}
}


// JavaScript Document
//翻页组件
function $page(opt) {
	var option = {
		keyId : Math.random(),
		pageCount : 0,
		currentPage : 0,
		itemCount : 0,
		more : false,
		domList : [],
		type : "full",
		action : "url",
		url : "http://www.xxx.com/?pid={#pageId#}",
		func : function(pageId, opt) {
			return true;
		},
		onInit : function(pageId, opt) {
			return true;
		}
	};
	for (var i in opt) {
		option[i] = opt[i];
	}
	var standStyle = ['', '{#goTo#}<a href="#nolink" pageTag="go" pageId="{#pageId#}">{#pageId#}</a>{#goTo/#} {#current#}<a class=\"ui_page_curr\" href=\"javascript:void(0);\">{#pageId#}</a>{#current/#}{#hide#}<span class="page-break">...</span>{#hide/#}{#next#}<a href="#nolink" class="page-next" pageTag="go" pageId="{#pageId#}">下一页</a>{#next/#}{#_next#}<a class=\"page-next\" href=\"javascript:void(0);\">下一页</a>{#_next/#}{#previou#}<a href="#nolink" pageTag="go" pageId="{#pageId#}" class="page-prev">上一页</a>{#previou/#}{#_previou#}<a class=\"page-next\" href=\"javascript:void(0);\">上一页</a>{#_previou/#}{#first#}{#first/#}{#_first#}{#_first/#}{#last#}{#last/#}{#_last#}{#_last/#}{#more#}<span class="page-break">...</span>{#more/#}{#_more#}{#_more/#}'];
	var templateList = {
		full : [standStyle[0], standStyle[1], '<div class="paginator">{#previousPage#}{#pageList#}{#morePage#}{#nextPage#}<span class="page-skip"> 到第<input type="text" name="inputItem" pageTag="input" value="{#currentPageId#}"  maxlength="{#maxlength#}" {#debugtag#} />页<button pageTag="jumper" value="go">确定</button></span></div>'],
		simple : [standStyle[0], standStyle[1], '<div class="paginator">{#previousPage#}{#pageList#}{#morePage#}{#nextPage#}</div>'],
		shortSimple : [standStyle[0], standStyle[1], '<div class="paginator">{#previousPage#}{#shortPageList#}{#morePage#}{#nextPage#}</div>'],
		miniSimple : [standStyle[0], standStyle[1], '<div class="paginator">{#previousPage#}{#miniPageList#}{#nextPage#}</div>'],
		noLastTmpl : [standStyle[0], standStyle[1], '<div class="paginator">{#previousPage#}{#noLastTmpl#}{#nextPage#}</div>']
	};
	var template = templateList[option.type][0] + templateList[option.type][1] + templateList[option.type][2];
	var pageCount = parseInt(option.pageCount);
	var currentPage = parseInt(option.currentPage);
	var itemCount = parseInt(option.itemCount);
	currentPage = (currentPage > pageCount) ? pageCount : currentPage;
	var pt = {
		next : "",
		_next : "",
		previou : "",
		_previou : "",
		first : "",
		_first : "",
		last : "",
		_last : "",
		more : "",
		_more : "",
		goTo : "",
		current : "",
		hide : ""
	};
	for (var i in pt) {
		var r = (new RegExp("{#" + i + "#}(.*){#" + i + "/#}", "ig")).exec(template);
		pt[i] = (r) ? RegExp.$1 : "";
	}
	pt.nextPageHtml = (currentPage < pageCount) ? (pt.next.replace(/{#pageId#}/g, (currentPage + 1))) : (pt._next);
	pt.previousPageHtml = (currentPage > 1) ? (pt.previou.replace(/{#pageId#}/g, (currentPage - 1))) : (pt._previou);
	pt.firstPageHtml = (currentPage > 1) ? (pt.first.replace(/{#pageId#}/g, 1)) : (pt._first);
	pt.lastPageHtml = (currentPage < pageCount) ? (pt.last.replace(/{#pageId#}/g, pageCount)) : (pt._last);
	pt.morePageHtml = (option.more) ? (pt.more.replace(/{#pageId#}/g, (pageCount + 1))) : (pt._more);
	pt.pagelistHtml = "";
	pt.shortPageListHtml = "";
	pt.noLastTmplHtml = "";
	pt.miniPageListHtml = "<span>" + currentPage + "/" + pageCount + "</span>";
	
	if (pageCount <= 10) {
		for (var i = 1; i <= pageCount; i++) {
			pt.pagelistHtml += (i == currentPage) ? (pt.current.replace(/{#pageId#}/g, i)) : (pt.goTo.replace(/{#pageId#}/g, i));
		}
	} else {
		var prePage = currentPage - 2;
		var frePage = currentPage + 2;
		prePage = (prePage <= 2) ? 1 : prePage;
		frePage = (frePage > pageCount - 2) ? pageCount : frePage;
		if (currentPage <= 4) {
			frePage = 6
		}
		pt.pagelistHtml += (currentPage > 4) ? (pt.goTo.replace(/{#pageId#}/g, 1) + pt.hide) : "";
		for ( i = prePage; i <= frePage; i++) {
			pt.pagelistHtml += (i == currentPage) ? (pt.current.replace(/{#pageId#}/g, i)) : (pt.goTo.replace(/{#pageId#}/g, i));
		}
		pt.pagelistHtml += (currentPage <= pageCount - 4) ? (pt.hide + pt.goTo.replace(/{#pageId#}/g, pageCount)) : "";
	}
	if (pageCount <= 8) {
		for (var i = 1; i <= pageCount; i++) {
			pt.shortPageListHtml += (i == currentPage) ? (pt.current.replace(/{#pageId#}/g, i)) : (pt.goTo.replace(/{#pageId#}/g, i));
		}
	} else {
		var prePage = currentPage - 2;
		var frePage = currentPage + 2;
		prePage = (prePage <= 2) ? 1 : prePage;
		frePage = (frePage > pageCount - 2) ? pageCount : frePage;
		if (currentPage <= 4) {
			frePage = 6;
		}
		pt.shortPageListHtml += (currentPage > 4) ? (pt.goTo.replace(/{#pageId#}/g, 1) + pt.hide) : "";
		for ( i = prePage; i <= frePage; i++) {
			pt.shortPageListHtml += (i == currentPage) ? (pt.current.replace(/{#pageId#}/g, i)) : (pt.goTo.replace(/{#pageId#}/g, i));
		}
		pt.shortPageListHtml += (currentPage <= pageCount - 4) ? (pt.hide + pt.goTo.replace(/{#pageId#}/g, pageCount)) : "";
	}
	if (pageCount <= 6) {
		for (var i = 1; i <= pageCount; i++) {
			pt.noLastTmplHtml += (i == currentPage) ? (pt.current.replace(/{#pageId#}/g, i)) : (pt.goTo.replace(/{#pageId#}/g, i));
		}
	} else {
		var prePage = currentPage - 2;
		var frePage = currentPage + 1;
		prePage = (prePage <= 3) ? 1 : prePage;
		frePage = (frePage > pageCount - 1) ? pageCount : frePage;
		pt.noLastTmplHtml += (currentPage > 5) ? (pt.goTo.replace(/{#pageId#}/g, 1) + pt.goTo.replace(/{#pageId#}/g, 2) + pt.hide) : "";
		for ( i = prePage; i <= frePage; i++) {
			pt.noLastTmplHtml += (i == currentPage) ? (pt.current.replace(/{#pageId#}/g, i)) : (pt.goTo.replace(/{#pageId#}/g, i));
		}
		pt.noLastTmplHtml += (currentPage <= pageCount - 2) ? pt.hide : "";
	}
	if (option.more) {
		pt.pagelistHtml = "";
		for (var i = 1; i <= pageCount; i++) {
			pt.pagelistHtml += (i == currentPage) ? (pt.current.replace(/{#pageId#}/g, i)) : (pt.goTo.replace(/{#pageId#}/g, i));
		}
		pt.shortPageListHtml = pt.pagelistHtml;
	}
	template = templateList[option.type][2].replace(/{#currentPageId#}/g, currentPage).replace(/{#pageCountNum#}/g, pageCount).replace(/{#itemCountNum#}/g, itemCount).replace(/{#firstPage#}/g, pt.firstPageHtml).replace(/{#previousPage#}/g, pt.previousPageHtml).replace(/{#nextPage#}/g, pt.nextPageHtml).replace(/{#lastPage#}/g, pt.lastPageHtml).replace(/{#pageList#}/g, pt.pagelistHtml).replace(/{#shortPageList#}/g, pt.shortPageListHtml).replace(/{#morePage#}/g, pt.morePageHtml).replace(/{#miniPageList#}/g, pt.miniPageListHtml).replace(/{#noLastTmpl#}/g, pt.noLastTmplHtml).replace(/{#maxlength#}/g, pageCount.toString().length);
	var frameList = [];
	var inputList = [];
	var buttomList = [];
	var linkList = [];
	frameList = frameList.concat(getItemFromArray(option.domList));
	function getItemFromArray(arr) {
		var array = [];
		for (var k = 0; k < arr.length; k++) {
			if (arr[k].length > 0) {
				array = array.concat(getItemFromArray(arr[k]));
			} else {
				array.push(arr[k]);
			}
		}
		return array;
	}

	var k = frameList.length;
	for (var i = 0; i < frameList.length; i++) {
		try {
			frameList[i].innerHTML = template.replace(/{#debugtag#}/g, i);
			var temp = frameList[i].getElementsByTagName("input");
			for (var j = 0; j < temp.length; j++) {
				if (temp[j].getAttribute("pageTag") == "input") {
					inputList.push(temp[j]);
				}
			}
			var temp = frameList[i].getElementsByTagName("button");
			for (var j = 0; j < temp.length; j++) {
				if (temp[j].getAttribute("pageTag") == "jumper") {
					buttomList.push(temp[j]);
				}
			}
			var temp = frameList[i].getElementsByTagName("a");
			for (var j = 0; j < temp.length; j++) {
				if (temp[j].getAttribute("pageTag") == "go") {
					linkList.push(temp[j]);
				}
			}
		} catch(e) {
		}
	}
	for (var i = 0; i < inputList.length; i++) {
		inputList[i].onblur = function() {
			this.value = this.value.replace(/[^0-9]/g, '');
			if (this.value > pageCount || this.value < 1) {
				this.value = "";
			}
			for (var j = 0; j < inputList.length; j++) {
				inputList[j].value = this.value;
			}
		};
		inputList[i].onfocus = function() {
			this.select();
		};
		inputList[i].onkeydown = function(e) {
			var e = window.event || e;
			if (e.keyCode != 13) {
				return true;
			} else {
				this.onblur();
				buttomList[0].onclick();
				return false;
			}
		};
	}
	for (var i = 0; i < linkList.length; i++) {     //a-->go
	    var ids=linkList[i].getAttribute("pageId");	    
		if (option.action == "url" && ids!=1) {
			linkList[i].href = option.url.replace("{#pageId#}", linkList[i].getAttribute("pageId"));
		}
		if(option.action == "url" && ids==1){
			linkList[i].href = option.url.replace("_{#pageId#}", "");
		}
		else {
			linkList[i].onclick = function() {
				goTo(this.getAttribute("pageId"), option);
			};
		}
	}
	goTo = function(pageId, opt) {   //跳到第几页；
		if (opt.action == "url" && pageId!=1) {
			location.href = opt.url.replace("{#pageId#}",pageId);
		}
		if(opt.action == "url" && pageId==1){
			location.href = opt.url.replace("_{#pageId#}", "");
		}
		if (opt.action == "func") {
			return opt.func(pageId, opt);
		}
		return false;
	};
	option.onInit();
}

/* ====================================一体化   */
/**
@ $addEvent:绑定事件
* param {element}elem:元素
* param {string}type:事件类型
* param {function}handle:句柄
*/
function $addEvent(elem,type,handle){
	if(!elem || !type || !handle){
		return;	
	}	
	if(elem instanceof Array){
		for(var i = 0, len = elem.length; i < len; i++) {
			$addEvent(elem[i], type, handle);
		}
		return;	
	}	
	if( type instanceof Array) {
		for(var i = 0, len = type.length; i < len; i++) {
			$addEvent(elem, type[i], handle);
		}
		return;
	}
	if(!$addEvent.createDelegate){
		$addEvent.createDelegate=function(handle, context) {
			return function() {
				return handle.apply(context, arguments);
			};
		};
	}
	var delegateHandle=$addEvent.createDelegate(handle,elem);
	
	var typeArr=type.split("."),type=typeArr[0],spaceId=typeArr.length>1?typeArr[1]:false;	
	if(window.addEventListener){
		elem.addEventListener(type,delegateHandle,false);	
	}else if(window.attachEvent){
		elem.attachEvent("on"+type,delegateHandle);
	}else{
		alert("你的浏览器太out了");	
	}
	
	elem.__eventHandle= elem.__eventHandle || {};
	elem.__eventHandle[type]=elem.__eventHandle[type] || [];	
	if(spaceId){
		elem.__eventHandle[type].push({delegateHandle:delegateHandle,handle:handle,spaceId:spaceId});
	}else{
		elem.__eventHandle[type].push({delegateHandle:delegateHandle,handle:handle});
	}
	
	return delegateHandle;
}

/**
@ $removeEvent:取消事件监听
* param {element}elem:元素
* param {string}type:事件类型
* param {function}handle:句柄
*/
function $removeEvent(elem,type,handle,delegateHandle){
	if(arguments.length<2){return;}	
	var typeArr=type.split("."),type=typeArr[0],spaceId=typeArr.length>1?typeArr[1]:false;
	if(!elem.__eventHandle || !elem.__eventHandle[type]){return;}
	
	for(var i=0,eventArr=elem.__eventHandle[type],len=eventArr.length,isremove,eventSingle;i<len;i++){
		isremove=false,eventSingle=eventArr[i];
		if(!handle || (handle && (eventSingle.handle===handle))){
			if(!spaceId || (spaceId && (eventSingle.spaceId===spaceId))){
				if(!delegateHandle || (delegateHandle && delegateHandle===eventSingle.delegateHandle)){
					isremove=true;
				}
			}
		}
		if(isremove){
			if(window.removeEventListener){
				elem.removeEventListener(type,eventSingle.delegateHandle,false);	
			}else{
				elem.detachEvent("on"+type,eventSingle.delegateHandle);
			}
			eventArr.splice(i,1);
			i--;
			len--;
			if(delegateHandle){
				break;
			}
		}
	}
}

/* --------------------------------------------------
@ $Hover :
----------------------------------------------------- */
function $Hover2(o){
	var othis=this;
	if(o.obj==undefined){
		return;
	}else{
		othis.obj=$(o.obj);	
		othis.oPanel=othis.obj.find(o.selectorPanel);
	}
	if(o.cssHover){othis.cssHover=o.cssHover;}
	othis.config=$.extend({},othis.config,o.config);
	othis.obj.bind("mouseenter",othis,othis.mouseenterHandler);	
	othis.obj.bind("mouseleave",othis,othis.mouseleaveHandler);		
}
$Hover2.prototype={
		cssHover:"curr",
		config:{onBefore:null},
		mouseenterHandler:function(e){
			var eData=e.data;
			clearTimeout(eData._timeout);
			if(!eData.obj.hasClass(eData.cssHover)){
				eData._timeout=setTimeout(function(){
					if(eData.config.onBefore!=null){
						eData.config.onBefore();
					}
					eData.oPanel.stop(false,true);
					eData.obj.addClass(eData.cssHover);	
					eData.oPanel.slideDown(200);
				},200);
			}
		},
		mouseleaveHandler:function(e){
			var eData=e.data;
			clearTimeout(eData._timeout);
			if(eData.obj.hasClass(eData.cssHover)){
				eData._timeout=setTimeout(function(){
					eData.oPanel.stop(false,true);
					eData.oPanel.slideUp(200,function(){
						eData.obj.removeClass(eData.cssHover);
					});	
				},300);
		    }
		}
};
$Hover2.prototype.constructor=$Hover;

/* ---------------------------------------------------
@ $Tab : tab切换
------------------------------------------------------ */
function $Tab2(o,undefined){
	var othis=this;
	othis._selfID=(++othis.constructor._newNum);
	othis._selfName=".$Tab2"+othis._selfID;
	
	if(!o){return;}
	if(o.config!=undefined){
		othis.config=$.extend({},othis.config,o.config);	
	}
	if(o.oTab!=undefined){
		othis.oTab=$(o.oTab);
		othis.oPanel=othis.oTab.find(othis.config.selectorPanel);
		othis.oItems=othis.oPanel.find(othis.config.selectorItem);
		othis.oOptionsCon=othis.oTab.find(othis.config.selectorOptions);
		othis.oOptions=othis.oOptionsCon.find(othis.config.selectorOption);
	}	
}
$Tab2.prototype={	
	config:{pos:0,isRandom:false,selectorItem:".ui_tab_item",selectorPanel:".ui_tab_panel",selectorOption:".ui_tab_option",selectorOptions:".ui_tab_options",cssOptionCurr:"ui_tab_option_curr",onBeforeMove:null,onAfterMove:null,isDelay:false},
	init:function(){
	   var othis=this,cfg=othis.config;
	   var sum=othis.oOptions.length;
	   othis.sum=sum;
	   
	   if(sum==0){othis.oTab.hide();return false;}
	   if(sum==1){
		   cfg.pos=0;
	   }else{
		   if(cfg.isRandom){
				cfg.pos=Math.floor(sum*Math.random());
		   }	
	   	   othis.oOptions.mouseenter(othis,othis.optionsEnterHandler);
	  	   othis.oOptions.mouseleave(othis,othis.optionsLeaveHandler);	   
	   }
	   	   
	   if(cfg.isDelay){
		  $(window).bind("resize"+othis._selfName+" scroll"+othis._selfName,othis,othis.fnDelay);
	   }
	   	   
	   othis.move();
	},
	move:function(){
		if(this.config.onBeforeMove){
			this.onBeforeMove=this.config.onBeforeMove;
			this.onBeforeMove();	
		}	
		if(this.config.isDelay){
		 	this.fnDelay();
		 }
		this.movefunc();			
		if(this.config.onAfterMove){
			this.onAfterMove=this.config.onAfterMove;
			this.onAfterMove();	
		}		
	},
	movefunc:function(){
		var othis=this,cfg=othis.config;
			othis.oItems.hide();
			othis.oItems.eq(cfg.pos).show();
			othis.oOptions.removeClass(cfg.cssOptionCurr);
			othis.oOptions.eq(cfg.pos).addClass(cfg.cssOptionCurr);
	},
	optionsEnterHandler:function(e){
		var othis=e.data,cfg=othis.config,oself=$(this);
		othis._delayTimeout=setTimeout(function(){ 
			clearTimeout(othis._delayTimeout);
			var index=othis.oOptions.index(oself);
			cfg.pos=index;
			othis.move();				
		},200);		
	},
	optionsLeaveHandler:function(e){
		clearTimeout(e.data._delayTimeout);
	},
	fnDelay:function(e){
		var othis=(e && e.data) || this,oimgs;
		if(!othis.oDelayImgs){
			oimgs=othis.oTab.find("img");	
			othis.oDelayImgs=new Array();	
			oimgs.each(function(){
				if($(this).attr("orial_src")){othis.oDelayImgs.push(this);}	
			});		
		}
		var spos=othis.config.pos;
		oimgs=othis.oItems.eq(spos).find("img");
		
		var owin=$(window);	
		var scrollStart=owin.scrollTop(),winH=owin.height(),end=scrollStart+winH;
		
		var sum=oimgs.length;
		oimgs.each(function(){
			var oself=$(this);
			if(!oself.attr("orial_src")){return;}
			
			var offTop=parseInt(oself.offset().top);
			var offBottom=parseInt(offTop+(oself.outerHeight() || 800));
			if((offTop>=scrollStart && offTop <=end) || (offBottom>=scrollStart && offBottom <= end) || (offTop< scrollStart && offBottom > end)){
				oself.attr("src",oself.attr("orial_src"));
				for(var i=0;i<othis.oDelayImgs.length;i++){
					if(othis.oDelayImgs[i]== this){othis.oDelayImgs.splice(i,1);i--;break;}	
				}
			}	
		});
		if(othis.oDelayImgs.length==0){ othis.config.isDelay=false; $(window).unbind("resize"+othis._selfName+" scroll"+othis._selfName);}
	}	
};
$Tab2.prototype.constructor=$Tab2;
$Tab2.play=function(o){
	var obj=new $Tab2(o);
	obj.init();
	return obj;
};

function $trim(str){
	return str.replace(/^\s+|\s$/g,'');	
}
/* ===================================================
@ user：用户信息
====================================================== */
/**
 * 设置cookie
 * @param {String} name
 * @param {String} value
 * @param {String} expires
 * @param {String} path
 * @param {String} domain
 * @param {String} secure
 */
function $setCookie(name, value, expires, path, domain, secure) {
	var exp = new Date(), expires = arguments[2] || null, path = arguments[3] || "/", domain = arguments[4] || null, secure = arguments[5] || false;
	expires ? exp.setMinutes(exp.getMinutes() + parseInt(expires)) : "";
	document.cookie = name + '=' + escape(value) + ( expires ? ';expires=' + exp.toGMTString() : '') + ( path ? ';path=' + path : '') + ( domain ? ';domain=' + domain : '') + ( secure ? ';secure' : '');
}

/* --------------------------------------------------
 * 获取cookie
 * @param {string} name
 * @return null 没有找到
 * @return ""/string value
 */
function $getCookie(name) {
	var reg = new RegExp("(^| |(?=;))" + name + "(?:=([^;]*))?(;|$)"), val = document.cookie.match(reg);
	return val ? (val[2] ? unescape(val[2]) : "") : null;
}

/*
 * 删除cookie 
 * @param {String} name
 * @param {String} path
 * @param {String} domain
 * @param {String} secure
 */
function $delCookie(name, path, domain, secure) {
	var value = $getCookie(name);
	if (value != null) {
		var exp = new Date();
		exp.setMinutes(exp.getMinutes() - 1000);
		path = path || "/";
		document.cookie = name + '=;expires=' + exp.toGMTString() + ( path ? ';path=' + path : '') + ( domain ? ';domain=' + domain : '') + ( secure ? ';secure' : '');
	}
}

/* ---------------------------------------------------
* $getLoginInfo : 获取登录信息
@param {Object} userInfo：存储用户登录信息；status：0/1未登录/已登录;
@param {Object} userInfo.info:已登录用户的信息，用户id，用户名(user_id,user_name);
@param {Array} callbackArr:回调队列
@param {number} isCheck:是否异步请求中（1是；0否）；
------------------------------------------------------ */
var $userInfo={},$callbackArr=[],$isCheck=0;
function $checkInfo(){
		var cookieName="tgt";
		var cookieValue=$getCookie(cookieName);
		if(cookieValue===null || cookieValue.length==0){
			$userInfo.status=0;
			$userInfo.info="";
			var len=$callbackArr.length;
			for(var i=0;i<len;i++){
				try{
				   $callbackArr[i]($userInfo);						
				}catch(e){}
			}
			$callbackArr.length=0;
		}else{
			$.ajax({
				url:"http://shop.gionee.com/user.php?act=get_login_user",
				dataType:"jsonp",
				data:{
					dtype:"jsonp",
					jsoncallback:"callback",
					callback:"GetLoginInfoback",
					st:(new Date()).getTime()
				}
			});
		}
		isCheck=0;
	}
function GetLoginInfoback(data){
				if(!data){
					$userInfo.status=0;
				}else{
					$userInfo.status=data.status;
				}				
				$userInfo.info="";
				if($userInfo.status==0){
					var exp = new Date();
					exp.setMinutes(exp.getMinutes() - 1000);
					document.cookie ='tgt=;expires=' + exp.toGMTString() + ';path=/;domain=.gionee.com;';
				}else{
					$userInfo.info=data.user_infor;
				}
				
				var len=$callbackArr.length;
				if(len>0){
					for(var i=0;i<len;i++){
						$callbackArr[i]($userInfo);	
					}
					$callbackArr.length=0;
				}
}
var $getLoginInfo=(function(){
	return function(callback){
			if($isCheck==0){ // 
					$isCheck=1;
					$callbackArr.push(callback);	
					$checkInfo();
				}else{
					$callbackArr.push(callback);	
				}
		}
})();

/* -----------------------------------------------------
* $getCartInfo:获取购物车数据
* @param {function} callback:回调函数；
*/ 
var GetCartInfoBack;
function $getCartInfo(callback){
		GetCartInfoBack=callback || function(){};
		$.ajax({
			url:"http://shop.gionee.com/flow.php?step=get_cart_goods",
			dataType:"jsonp",
			data:{
					dtype:"jsonp",
					jsoncallback:"callback",
					callback:"GetCartInfoBack",
					st:(new Date()).getTime()
			}
		});
}

// 竖风琴
function $SlideOrgan(opt){
	this._selfId=(++this.constructor._newNum);
	this._selfName=".SlideOrgan"+this._selfId;
	
	this.option={
		width:0,
		height:0,
		navValue:0, //导航的宽度
		auto:false,  //是否自动播放
		delay:2000,  //播放间隔时间
		speed:400,  //播放速度
		delayLoad:true, //是否延时加载
		pos:0,
		zIndex:1,   //整个风琴的z-index
		seleSlide:"",
		seleItem:".ui_slide_item",
		seleNav:".ui_slide_nav",
		cssCurrItem:"ui_slide_item_curr",
		onMoveBefore:null,
		onMoveAtfer:null
	};
	if(!opt || !opt.seleSlide){return;}
	
	var that=this,config=that.option;
	for(var prop in opt){
		config[prop]=opt[prop];
	}
	that.init();
}
$SlideOrgan.prototype={
	constructor:$SlideOrgan,
	init:function(){
		var that=this,opt=that.option;
		//元素
		that.domSlide=$(opt.seleSlide);
		that.domItems=that.domSlide.children(opt.seleItem);
		that.domNavs=that.domSlide.find(opt.seleNav);
		
		//初始化
		that.initStatus();		
		
		//绑定事件
		that.bindEvent();
		
		//延时加载图片
		if(opt.delayLoad){
			opt.onBeforeMove=that.fnDelay; 
			$(window).bind("resize"+that._selfName+" scroll"+that._selfName,that,that.fnDelay);
			that.fnDelay();
		}		
		
		//运行
		if(opt.auto){
			that._timeout=setTimeout(function(){
				that.autoPlay();
			},opt.delay);
		}
	},
	initStatus:function(){
		var that=this,opt=that.option;
		that.itemsLen=that.domItems.length;
		that.itemValue=that.domItems.eq(0).outerWidth(true);
		
		that.navValue=opt.navValue || that.domNavs.eq(0).width();
		for(var i=0,len=that.itemsLen;i<len;i++){
			that.domItems.eq(i).css({"zIndex":opt.zIndex+(len-i),"right":(len-i-1)*that.navValue});
		}
		that.setStatus();
	},
	setStatus:function(){
		var that=this,opt=that.option;
		that.domItems.removeClass(opt.cssCurrItem);
		that.domItems.eq(opt.pos).addClass(opt.cssCurrItem);
		/*
		var index=that.domSlide.find("."+opt.cssCurrItem);console.log(index.get(0));
		var preNav=index.find(opt.seleNav);console.log(preNav.get(0));
		preNav.css({"opacity":0}).show();		
		preNav.fadeOut(opt.speed,function(){
			preNav.css({"opacity":1}).show();			
		});	
		that.domItems.eq(opt.pos).addClass(opt.cssCurrItem);
		that.domNavs.eq(opt.pos).css({"opacity":1}).show();		
		that.domNavs.eq(opt.pos).fadeOut(opt.speed,function(){
			that.domNavs.eq(opt.pos).css({"opacity":0}).hide();		
		});*/
	},
	bindEvent:function(){
		var that=this,opt=that.option;
		//item
		that.domItems.bind("mouseenter",function(){
			clearTimeout(that.domItems._timeout);
			clearTimeout(that._timeout);
			that.domItems._timeout=setTimeout(function(){
				clearTimeout(that._timeout);
				clearTimeout(that.domItems._timeout);
				that.domItems.stop(false,true);					
			},opt.speed);
		});
		that.domItems.bind("mouseleave",function(){
			clearTimeout(that.domItems._timeout);
			clearTimeout(that._timeout);
			that.domItems._timeout=setTimeout(function(){
				clearTimeout(that._timeout);
				clearTimeout(that.domItems._timeout);
				if(opt.auto){
					that._timeout=setTimeout(function(){
						that.autoPlay();
					},opt.delay);
				}					
			},opt.speed);
		});
		// nav
		that.domNavs.bind("mouseenter",function(e){
			var oself=$(this);
			var index=that.domNavs.index(oself);
			if(index==that.option.pos){return;}
			
			clearTimeout(that._timeout);
			that.domNavs._timeout=setTimeout(function(){
				clearTimeout(that._timeout);
				that.option.pos=index;
				that.move();
			},200);
		});
		
	},
	setPos:function(){
		var that=this,opt=that.option,len=that.itemsLen;
		if(opt.pos >len-1 || opt.pos<0){
			opt.pos=0;
		}
	},
	autoPlay:function(){
		var that=this,opt=that.option;
		clearTimeout(that._timeout);
		opt.pos++;
		that.setPos();
		that.move();
		that._timeout=setTimeout(function(){
			that.autoPlay();
		},opt.delay);	
	},
	movefunc:function(){
		var that=this,opt=that.option;
		that.domItems.stop(false,true);	
		
		var len=that.itemsLen,itemValue=that.itemValue,navValue=that.navValue;	
		that.setStatus();
		
		for(var i=0,right=0;i<len;i++){
			if(i<opt.pos){
				right=(len-i-2)*navValue+itemValue;
			}else{
				right=(len-i-1)*navValue;
			}
			that.domItems.eq(i).animate({"right":right},opt.speed);
		}	
	},
	move:function(){
		if(this.option.onBeforeMove){
			this.onBeforeMove=this.option.onBeforeMove;
			this.onBeforeMove();
		}
		this.movefunc();	
		if(this.option.onAfterMove){
			this.onAfterMove=this.option.onAfterMove;
			this.onAfterMove();
		}
	},
	fnDelay:function(e){
		var that=(e && e.data) || this,opt=that.option;
		
		//获取需要加载的图片
		if(!that.delayImgs){
			that.delayImgs=new Array(that.itemsLen);
			for(var i=0,oimgs;i<that.itemsLen;i++){
				that.delayImgs[i]=that.delayImgs[i] || [];
				oimgs=that.domItems.eq(i).find("img");
				oimgs.each(function(){
					if($(this).attr("orial_src")){that.delayImgs[i].push(this);}	
				});
			}	
		};
		
		//加载显示区域
		that.setPos();
		var pos=opt.pos;
		
		//加载显示区图片
		var owin=$(window);	
		var scrollStart=owin.scrollTop(),winH=owin.height(),end=scrollStart+winH;
		for(var i=0,delayimg=that.delayImgs[pos],len=delayimg.length;i<len;i++){
			domjimg=$(delayimg[i]);
			var offTop=parseInt(domjimg.offset().top);
			var offBottom=parseInt(offTop+(domjimg.outerHeight() || 800));
			if((offTop>=scrollStart && offTop <=end) || (offBottom>=scrollStart && offBottom <= end) || (offTop< scrollStart && offBottom > end)){
					domjimg.attr("src",domjimg.attr("orial_src"));
					delayimg.splice(i,1);
					i--;
					len--;
			}
		}
				
		//判断是否加载完，加载完解除绑定
		for(var i=0,len=that.delayImgs.length;i<len;i++){
			if(that.delayImgs[i].length!==0){break;}
		}
		if(i===len){ 
			opt.onBeforeMove=null; 
			$(window).unbind("resize"+that._selfName+" scroll"+that._selfName);
		}
	}		
};
$SlideOrgan._newNum=0;

// 可预览前后画面的切换
function $SlideReview(opt,undefined){
	this._selfId=(++this.constructor._childNum);
	this._selfName=".SlideReview"+this._selfId;
	this.option={
		width:0, //宽度
		height:0, //高度
		pos:0, //初始位置
		isRandom:false, //初始播放位置是否随机
		speed:400, //播放速度
		delay:6000, //播放间隔时间
		auto:true,  //是否自动播放
		delayLoad:true,  //是否延迟加载
		col:1,//单侧预留可观看的个数
		seleSlide:"",  //播放dom元素
		selePanel:".ui_slide_panel",
		seleItems:".ui_slide_item",
		seleOpts:".ui_slide_opts",
		seleOpt:".ui_slide_opt",
		selePrev:".ui_slide_prev",
		seleNext:".ui_slide_next",
		seleMaskPrev:".ui_slide_maskPrev",
		seleMaskNext:".ui_slide_maskNext",
		cssCurrItem:"ui_slide_item_curr",
		cssCurrOpt:"ui_slide_opt_curr",
		cssPrevHover:"ui_slide_prev_hover",
		cssNextHover:"ui_slide_next_hover",
		onBeforeMove:null,
		onAfterMove:null
	}
	
	if(!opt || !opt.seleSlide){return;}	
	
	var that=this,config=that.option;
	for(var prop in opt){
		config[prop]=opt[prop];
	}
	that.init();
}
$SlideReview.prototype={
	constructor:$Slide,
	init:function(){
		var that=this,opt=that.option;
		//获取元素
		that.domSlide=$(opt.seleSlide);
		that.domPanel=that.domSlide.find(opt.selePanel);
		that.domItems=that.domPanel.find(opt.seleItems);
		that.domOptCon=that.domSlide.find(opt.seleOpts);
		that.domOptions=that.domOptCon.find(opt.seleOpt);
		that.domPrev=that.domSlide.find(opt.selePrev);
		that.domNext=that.domSlide.find(opt.seleNext);
		that.domMaskPrev=that.domSlide.find(opt.seleMaskPrev);
		that.domMaskNext=that.domSlide.find(opt.seleMaskNext);
				
		//元素的个数
		that.itemsLen=that.domItems.length;
		if(that.itemsLen===0){
			that.domSlide.hide();
			return;
		}
		if(that.itemsLen===1){
			that.domOptCon.hide();
			that.domPrev.hide();
			that.domNext.hide();
			that.domMaskPrev.hide();
			that.domMaskNext.hide();
			if(opt.delayLoad){
			  opt.pos=0;
			  that.sumLen=1;
			  opt.onBeforeMove=that.fnDelay; 
			  $(window).bind("resize"+that._selfName+" scroll"+that._selfName,that,that.fnDelay);
			  that.fnDelay();
		    }
			return;
		}
		
		if(that.itemsLen===2){
			that.domPrev.hide();
			that.domNext.hide();
			that.domMaskPrev.hide();
			that.domMaskNext.hide();
			that.domSlide.css({"overflow":"hidden","width":that.domItems.eq(0).width(),"margin-left":"auto","margin-right":"auto","margin-top":"0","margin-bottom":"0","height":"460px"});
		}
		
		//克隆元素
		that.domItems.clone().appendTo(that.domPanel);
		that.domItems=that.domPanel.find(opt.seleItems);
		that.sumLen=that.domItems.length;
		if(that.sumLen<4*opt.col+1){			
			that.domItems.clone().appendTo(that.domPanel);
			that.domItems=that.domPanel.find(opt.seleItems);
			that.sumLen=that.domItems.length;
		}
		
		//初始化
		that.initPos();	
		that.initStatus();	
		
		//绑定事件
		that.bindEvent();
		
		//加载图片		
		if(opt.delayLoad){
			opt.onBeforeMove=that.fnDelay; 
			$(window).bind("resize"+that._selfName+" scroll"+that._selfName,that,that.fnDelay);
			that.fnDelay();
		}	
		
		//运行
		if(opt.auto){
			that._timeout=setTimeout(function(){
				that.autoPlay();
			},opt.delay);
		}
				
	},
	initPos:function(){
		var that=this,opt=that.option;
		if(opt.isRandom){
			opt.pos=Math.floor(that.itemsLen*Math.random());
		}
	},
	initStatus:function(){		
		var that=this,opt=that.option;
		that.itemValue=opt.width || that.domItems.eq(0).outerWidth(true);
		that.domPanel.css({"width":that.itemValue*that.sumLen});
		that.setPos();
		that.domPanel.css({"left":-opt.pos*that.itemValue});
		that.setStatus();
	},
	setPos:function(){
		var that=this,opt=that.option,len=that.itemsLen,sumLen=that.sumLen;
		if(opt.pos-opt.col<0){
			opt.pos=opt.pos+len;
		}
		if(opt.pos+opt.col>sumLen-1){
			opt.pos=opt.pos-len;
		}
	},
	setStatus:function(){
		var that=this,opt=that.option;
		that.setPos();
		that.domItems.removeClass(opt.cssCurrItem);
		that.domItems.eq(opt.pos).addClass(opt.cssCurrItem);
		that.domOptions.removeClass(opt.cssCurrOpt);
		that.domOptions.eq(opt.pos%that.itemsLen).addClass(opt.cssCurrOpt);
	},
	autoPlay:function(){
		var that=this,opt=that.option;
		clearTimeout(that._timeout);
		opt.pos++;
		that.move();
		that._timeout=setTimeout(function(){that.autoPlay();},opt.delay);
	},
	movefunc:function(time){		
		var that=this,opt=that.option;
		that.domPanel.stop(false,true);
		
		var left=parseInt(that.domPanel.css("left")) || 0;
		if(opt.pos+opt.col>that.sumLen-1){
				opt.pos=opt.pos-that.itemsLen;
				left=-(opt.pos-1)*that.itemValue;
		}else if(opt.pos-opt.col<0){
				opt.pos=opt.pos+that.itemsLen;		
				left=-(opt.pos+1)*that.itemValue;
		}
	   that.domPanel.css({"left":left});			
	   that.setStatus();		   
	   var toLeft=-opt.pos*that.itemValue;
	   if(time){
	      	that.domPanel.animate({"left":toLeft},time);
	   }else{
	    	that.domPanel.animate({"left":toLeft},opt.speed,'easeInOut');
	   }
	},
	move:function(time){		
		if(this.option.onBeforeMove){
			this.onBeforeMove=this.option.onBeforeMove;
			this.onBeforeMove();
		}
		this.movefunc(time);	
		if(this.option.onAfterMove){
			this.onAfterMove=this.option.onAfterMove;
			this.onAfterMove();
		}
	},
	bindEvent:function(){
		var that=this,opt=that.option;
		//domslide
		if(that.itemsLen>2){
			that.domSlide.bind("mouseenter",function(e){
				clearTimeout(that.domSlide._timeout);
				that.domSlide._timeout=setTimeout(function(){
					that.domPrev.show();
					that.domNext.show();				
				},200);
			});		
			that.domSlide.bind("mouseleave",function(e){
				clearTimeout(that.domSlide._timeout);
				that.domSlide._timeout=setTimeout(function(){
					clearTimeout(that.domSlide._timeout);	
					that.domPrev.hide();
					that.domNext.hide();				
				},200);
			});
		}
		//items
		that.domItems.bind("mouseenter",function(e){
			clearTimeout(that.domItems._timeout);
			clearTimeout(that._timeout);
			that.domItems._timeout=setTimeout(function(){
				clearTimeout(that._timeout);
				clearTimeout(that.domItems._timeout);
				that.domItems.stop(false,true);					
			},200);
		});		
		that.domItems.bind("mouseleave",function(e){
			clearTimeout(that.domItems._timeout);
			clearTimeout(that._timeout);
			if(that.option.auto){
				that._timeout=setTimeout(function(){
					that.autoPlay();
				},opt.delay);
			}
		});
		
		//options
		that.domOptions.bind("mouseenter",function(e){	
			clearTimeout(that.domOptions._timeout);		
			var oself=this;		
			that.domOptions._timeout=setTimeout(function(){
				clearTimeout(that._timeout);
				clearTimeout(that.domOptions._timeout);
				that.domPanel.stop(false,true);				
				var index=$(oself).parent().children().index(oself);
				if(opt.pos%that.itemsLen!==index){					
					opt.pos=index;
					that.move(1);	
				}							
			},200);	
		});	
		that.domOptions.bind("mouseleave",function(e){
			clearTimeout(that._timeout);
			clearTimeout(that.domOptions._timeout);
			if(that.option.auto){
				that._timeout=setTimeout(function(){
					that.autoPlay();
				},opt.delay);
			}
		});
		//btn		
		that.domPrev.bind("click",function(e){
			that.movePrev();
		});		
		that.domNext.bind("click",function(e){
			that.moveNext();
		});			
		that.domMaskPrev.bind("click",function(e){
			that.movePrev();
		});		
		that.domMaskNext.bind("click",function(e){
			that.moveNext();
		});	
	},
	movePrev:function(){		
		var that=this,opt=that.option;
		clearTimeout(that._timeout);
		opt.pos--;
		that.move();
		that._timeout=setTimeout(function(){that.autoPlay();},opt.delay);
	},
	moveNext:function(){		
		var that=this,opt=that.option;
		clearTimeout(that._timeout);
		opt.pos++;
		that.move();
		that._timeout=setTimeout(function(){that.autoPlay();},opt.delay);
	},
	fnDelay:function(e){
		var that=(e && e.data) || this,opt=that.option;
		
		//获取需要加载的图片
		if(!that.delayImgs){
			that.delayImgs=new Array(that.itemsLen);
			for(var i=0,oimgs,j=0;i<that.sumLen;i++){
				oimgs=that.domItems.eq(i).find("img");
				j=i%that.itemsLen;
				that.delayImgs[j]=that.delayImgs[j] || [];
				oimgs.each(function(){
					if($(this).attr("orial_src")){that.delayImgs[j].push(this);}	
				});
			}	
		};
		
		//加载显示区域
		var pos=opt.pos,posArr=[],pos0=pos%that.itemsLen,pos1,pos2;
		posArr.push(pos0);
		pos-opt.col<0?pos1=pos-opt.col+that.itemsLen:pos1=(pos-opt.col)%that.itemsLen;
		if(pos1!==pos0){posArr.push(pos1);}
		pos+opt.col<that.sumLen?pos2=pos+opt.col:pos2=pos+opt.col-that.itemsLen;
		pos2%=that.itemsLen;
		if(pos2!==pos0 && pos2!==pos1){posArr.push(pos2);}
		
		//加载显示区图片
		var owin=$(window);	
		var scrollStart=owin.scrollTop(),winH=owin.height(),end=scrollStart+winH;
		for(var i=0,len=posArr.length,delayimg;i<len;i++){
			delayimg=that.delayImgs[posArr[i]];
			for(var j=0,len2=delayimg.length,domjimg;j<len2;j++){
				domjimg=$(delayimg[j]);
				var offTop=parseInt(domjimg.offset().top);
				var offBottom=parseInt(offTop+(domjimg.outerHeight() || 800));
				if((offTop>=scrollStart && offTop <=end) || (offBottom>=scrollStart && offBottom <= end) || (offTop< scrollStart && offBottom > end)){
					domjimg.attr("src",domjimg.attr("orial_src"));
					delayimg.splice(j,1);
					j--;
					len2--;
				}
			}
		}
				
		//判断是否加载完，加载完解除绑定
		for(var i=0,len=that.delayImgs.length;i<len;i++){
			if(that.delayImgs[i].length!==0){break;}
		}
		if(i===len){ 
			opt.onBeforeMove=null; 
			$(window).unbind("resize"+that._selfName+" scroll"+that._selfName);
		}
	}	
};
$SlideReview._childNum=0;