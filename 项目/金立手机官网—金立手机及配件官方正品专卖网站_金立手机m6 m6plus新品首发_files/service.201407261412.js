var NTKF_PARAM =NTKF_PARAM || {siteid:"kf_10106",  settingid: "kf_10106_1368151120079"}; 
var GN_SERVICE=GN_SERVICE || false;

(function(){	  
	if(!GN_SERVICE){
		return ;
	}
	
	//页面片，生成html
	var tpl='<div class="ui_service_item"><a href="javascript:void(0);" class="ui_service_lbl online"  tag_serv="open" target="_self">在线服务<span></span></a><div class="ui_service_onCont" id="JserviceTab"><h3>本周热门咨询</h3><div class="ui_service_closebtn"  tag_serv="close" ><a href="javascript:void(0);" target="_self" tigle="关闭">关闭</a></div><div class="ui_service_tanNav c">{%tabNav%}</div><div class="ui_service_con">{%tabCon%}</div></div></div><div class="ui_service_item"><a href="http://shop.gionee.com/help" class="ui_service_lbl help" target="_blank">帮助中心<span></span></a></div><div class="ui_service_item" tag_serv="top"><a href="javascript:void(0)" class="ui_service_lbl backTop" target="_self">返回顶部<span></span></a></div>',
	      tpl_tabNav='<a>{%tabItem%}</a>',
	      tpl_tabCon='<div class="ui_servtab_cont c"><ol>{%tabConList%}</ol><div class="ui_service_type c"><span>没有您关注的问题？立即咨询</span>{%type%}</div></div>',
	      tpl_tabLi='<li><a href="{%url%}" target="_blank">{%li%}</a></li>';	
	var html_tabNav=[],
	      html_tabCon=[],
	      html_tabList=[],
	      len=3,
	      serviceList,
	      html="";
	for(var i=0;i<len && i<GN_SERVICE.length-1;i++){
		serviceList=GN_SERVICE[i];
		html_tabNav.push(tpl_tabNav.replace('{%tabItem%}',serviceList.cat_title));
		html_tabList=[];
		for(var j=0,oli;j<5 && j<serviceList.value.length-1;j++){
			oli=serviceList.value[j];
			html_tabList.push(tpl_tabLi.replace('{%li%}',oli.question).replace('{%url%}',oli.link));
		}
		html=tpl_tabCon.replace('{%tabConList%}',html_tabList.join(''));
		if(i===0){
			html=html.replace('{%type%}','<span  tag_serv="saleB" class="btn" >在线客服</span>');
		}else if(i===1){
			html=html.replace('{%type%}','<span  tag_serv="saleB" class="btn" >在线客服</span>');
		}else if(i===2){
			html=html.replace('{%type%}','<span  tag_serv="saleA"  class="btn" >在线客服</span>');
		}
		html_tabCon.push(html);
	}
	
	var tpl_html=tpl.replace('{%tabNav%}',html_tabNav.join('')).replace('{%tabCon%}',html_tabCon.join(''));	
	
	//创建dom
	var dom=document.createElement('div');
	dom.setAttribute("class","ui_service");
	dom.setAttribute("id","Jservice");
	dom.innerHTML=tpl_html;
	var domsripts=document.getElementsByTagName("script");
	$(dom).insertBefore($(domsripts[domsripts.length-1]));

	// 售前咨询
	function saleB(dom){
		NTKF.im_openInPageChat("kf_10106_1368151120079");	
	}
	// 售后咨询
	function saleA(dom){
		NTKF.im_openInPageChat("kf_10106_1374563268537");
	}
	// 返回顶部
	function backTop(){
		$(window).scrollTop(0);		
	}
	//展开咨询
	function openLayer(dom,e){
		var domj=$(dom).next();
		if(domj.parent().get(0).flag){
			return;
		}
		domj.parent().get(0).flag=true;
		domj.stop(false,true);
		domj.parent().addClass("ui_service_online_curr");
		domj.css({"width":0,"display":"block"});
		domj.animate({"width":"416"},300);
	}	
	//关闭咨询
	function closeLayer(dom,e){
		var domj=$(dom).parent(),that=domj.parent();
		if(!domj.parent().get(0).flag){
			return;
		}
		that.get(0).flag=false;
		domj.stop(false,true);
		domj.animate({"width":"0"},300,function(){
			that.removeClass("ui_service_online_curr");
			domj.css({"display":"none"});
		});
	}
	$addEvent(dom,"click",function(e){
		e=e || window.event;
		var etarget=e.target || e.srcElement,dom=this,elem=etarget,tag;
		while(elem!==dom){
			tag=elem.getAttribute("tag_serv");
			if(tag){
				break;
			}else{
				elem=elem.parentNode;
			}
		}
		if( !tag){return;}
		
		switch(tag){    
			case "saleB" :   //售前咨询
				saleB();
				break;
			case "saleA" :    //售后
				saleA();
				break;
			case "top" :
				backTop();
				break;
			case "open" :
			    openLayer(elem);
				break;
			case "close" :
			    closeLayer(elem);
				break;
		}
	});
	
	$addEvent(document.body,"click",function(e){
		e=e || window.event;
		var etarget=e.target || e.srcElement;		
		var domService=dom.getElementsByTagName("div")[0];
		
		if(!domService.flag){  //浮层关闭时
			return;
		}
		//浮层展开时
		var elem=etarget;
		while(elem!==document.body){
			if(elem===domService){ //在弹框内
				return;
			}else{
				elem=elem.parentNode;
			}
		}
		closeLayer(domService.getElementsByTagName("div")[0].getElementsByTagName("div")[0]);
	})
		
	$("#JserviceTab .ui_service_tanNav a").mouseenter(function(){
		var othis=$(this);
		var index=$("#JserviceTab .ui_service_tanNav").find("a").index(this);
		$("#JserviceTab .ui_service_tanNav a").removeClass("curr");
		othis.addClass("curr");
		$("#JserviceTab .ui_servtab_cont").hide().eq(index).show();
	});
	$("#JserviceTab .ui_service_tanNav a").removeClass("curr").eq(0).addClass("curr");
	$("#JserviceTab .ui_servtab_cont").hide().eq(0).show();
		
	//浮动
	function FixedRight(o){
		var othis=this;
		othis._selfName=".FixedRight";
		
		if(o== undefined || o.obj == undefined){return;}
		othis.obj=$(o.obj);
		othis.config=$.extend({},othis.config,o.config);
		othis.show();
	}
	FixedRight.prototype={
		config:{
			toRight:6,
			objH:0
		},
		setTop:function(e){
			var othis=(e && e.data) || this,cfg=othis.config;
			var owin=$(window),winH=owin.height(),srcH=owin.scrollTop();
			 othis.obj.css({"top":srcH+(winH-othis.height)/2,"marginTop":0});
		},
		show:function(){
			var othis=this,cfg=othis.config;
			othis.obj.show();
			othis.height=othis.height || cfg.objH || othis.obj.outerHeight();
			
			othis.obj.css({"right":cfg.toRight});	
			if($.browser.msie && Number($.browser.version) <= 6){
				othis.obj.css({"position":"absolute"});
				othis.setTop();	
				$(window).bind("scroll"+othis._selfName+" resize"+othis._selfName,othis,othis.setTop);
			}else{
				othis.obj.css({"position":"fixed","top":"50%","marginTop":-parseInt(othis.height/2)});
			}
		}
	};
	var fixright=new FixedRight({obj:"#Jservice"});
	
	//添加ntkfstat.js
	var ntkf=document.createElement('script');
	ntkf.setAttribute('type', 'text/javascript');
	ntkf.setAttribute('charset', 'utf-8');
    ntkf.setAttribute('src', "http://download.ntalker.com/t2dm/ntkfstat.js");
	document.getElementsByTagName("head")[0].appendChild(ntkf);	
	
})();