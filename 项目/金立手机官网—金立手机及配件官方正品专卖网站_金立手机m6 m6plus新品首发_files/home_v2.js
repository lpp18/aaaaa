/**
 * @首页
 * @author wangzz
 */
(function($){
	// 主屏banner 
	new $SlideReview({seleSlide:"#Jslider"});
	
	//手风琴
	if($("#Jwind .ui_wind_item").length===4){
		new $SlideOrgan({seleSlide:"#Jwind",seleItem:".ui_wind_item",seleNav:".ui_wind_nav",cssCurrItem:"ui_wind_item_curr",navValue:176});
	}else{
		$id("JwindCon").style.display="none";
	}
	
	//精品手机	
	var optionsLen=$("#JmobileTab .tab1_option").length,tabLen=$("#JmobileTab .tab1_item").length;
	for(var i=tabLen;i<optionsLen;i++){
		$("#Jtab1Pro").append('<div class="wrapper tab1_item"></div>');
	}	
	var otab=$Tab2.play({oTab:"#JmobileTab",config:{selectorPanel:".tab1_con",selectorItem:".tab1_item",selectorOptions:".tab1_nav",selectorOption:".tab1_option",cssOptionCurr:"tab1_option_curr",isDelay:true,onAfterMove:function(){
			var oline=$("#Jtab1line");		
			var index=this.config.pos;
			var otabOptions=$("#JmobileTab .tab1_option"),option=otabOptions.eq(index);
			oline.stop(false,true);
			oline.animate({"width":option.width(),"left":option.position().left});
	}}});
	
	//精选配件	
	var optionsLen=$("#JpeijianTab .tab2_option").length,tabLen=$("#JpeijianTab .tab2_item").length;
	for(var i=tabLen;i<optionsLen;i++){
		$("#Jtab2Pro").append('<div class="wrapper tab2_item"></div>');
	}	
	var otab=$Tab2.play({oTab:"#JpeijianTab",config:{selectorPanel:".tab2_con",selectorItem:".tab2_item",selectorOptions:".tab2_nav",selectorOption:".tab2_option",cssOptionCurr:"tab2_option_curr",isDelay:true,onAfterMove:function(){
			var oline=$("#Jtab2line");		
			var index=this.config.pos;
			var otabOptions=$("#JpeijianTab .tab2_option"),option=otabOptions.eq(index);
			oline.stop(false,true);
			oline.animate({"width":option.width(),"left":option.position().left});
	}}}); 
	
	//图片展开	
	function imgOverHandle(e){
		e=e || window.event;
		var etarget=e.target || e.srcElement;
		var tag=etarget.getAttribute("tagmove");
		if(!tag){return;}
		etarget._timeout=setTimeout(function(){
			$(etarget.parentNode.parentNode).css({zIndex:2}).animate({"height":360},300);
		},150);
	}
	function imgOutHandle(e){
		e=e || window.event;
		var etarget=e.target || e.srcElement;
		var tag=etarget.getAttribute("tagmove");
		if(!tag){return;}
		clearTimeout(etarget._timeout);
		$(etarget.parentNode.parentNode).animate({"height":275,zIndex:1},300);
	}
	
	$addEvent($id("Jtab1First"),"mouseover",imgOverHandle);
	$addEvent($id("Jtab1First"),"mouseout",imgOutHandle);
	$addEvent($id("Jtab2First"),"mouseover",imgOverHandle);
	$addEvent($id("Jtab2First"),"mouseout",imgOutHandle);
	$addEvent($id("JtemailPanel"),"mouseover",imgOverHandle);
	$addEvent($id("JtemailPanel"),"mouseout",imgOutHandle);
	
	//手机，配件商品hover
	function productOverHandle(e){		
		e=e || window.event;
		var etarget=e.target || e.srcElement;
		var root=this,elem=etarget,tag;
		while(elem!==root){
			tag=elem.getAttribute("tag_pro");
			if(tag){
				break;
			}else{
				elem=elem.parentNode;
			}
		}		
		if(!tag){return;}
		clearTimeout(elem._timeout);
		
		if(!elem._isHover){
			elem._isHover=true;
			elem._timeout=setTimeout(function(){
				elem.className="list_hov";
			},100);
		}
	}	
	function productOutHandle(e){
		e=e || window.event;
		var etarget=e.target || e.srcElement;
		var root=this,elem=etarget,tag;
		while(elem!==root){
			tag=elem.getAttribute("tag_pro");
			if(tag){
				break;
			}else{
				elem=elem.parentNode;
			}
		}		
		if(!tag || elem!==etarget){return;}
		clearTimeout(etarget._timeout);
		elem._isHover=false;
		elem.className="";
	}	
	$addEvent([$id("Jtab1Pro"),$id("Jtab2Pro")],"mouseover",productOverHandle);
	$addEvent([$id("Jtab1Pro"),$id("Jtab2Pro")],"mouseout",productOutHandle);
	
})(jQuery);