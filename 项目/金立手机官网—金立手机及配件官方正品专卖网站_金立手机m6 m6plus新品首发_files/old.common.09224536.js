/* --------------------------
页头页尾脚本
----------------------------- */
(function($){
	
	// 滚屏延迟加载
	var odelay=new $DelayLoad();
	
	//　登录＆注册
	$getLoginInfo(function(e){
		var userInfor=e;
		if(userInfor.status==1){
			$("#JloginReg").html('<span class="nick_username">Hi,'+(userInfor.info.user_name || userInfor.info.nickname)+'</span><a href="http://shop.gionee.com/user/order_list/" hidefocus="true" target="_self"><span class="fn_hl">我的账户</span></a> <span class="line">|</span> <a href="http://passport.gionee.com/cas/n/slogout" hidefocus="true" target="_self" >退出</a>');
			if((!userInfor.info.user_name) && userInfor.info.nickname && window.location.href.match(/^http\:\/\/shop.gionee.com(\/(index.shtml)?)?$/)!=null){
				var cookieName="nickname",cookie=$getCookie(cookieName);
			   if(!cookie){
					$("#Jslheaderbd").append('<div class="add_usr_infos" id="JuserJoint"><p>建议您 <a href="http://passport.gionee.com/cas/n/bindPre?reqTime=1" target="_blank">完善账户信息</a>，以后就可以直接登录金立商城了！</p><span class="min_pop_hide" id="Juserclose"></span></div>');
					$id("JquickMenu").style.position="relative";
					$id("JquickMenu").style.zIndex=1;
					$addEvent($id("Juserclose"),"click",function(){
						$setCookie(cookieName,userInfor.info.nickname);
						$id("JuserJoint").style.display="none";
					});
				}
			}
		}	
	});
	
	// 购物车
	function getCartInfor(){
		
		if($("#Jcart").hasClass("cart_hover")){return false;}
		
		$("#JcartBd").html('<div class="cart_loading"></div>');
		$getCartInfo(function(data){
			var oBackData=data,ocartBd=$("#JcartBd"),onum=$("#Jcart .cart_hd em");
			
			if(oBackData.goods_list.length==0){
				ocartBd.html('<div class="cart_empty">您的购物车是空的，快去挑选喜欢的商品吧！</div>');
				onum.html(0);
			}else{
				var html=[],num=0,olist=oBackData.goods_list,len=olist.length;				
				for(var i=0;i<len;i++){
					html.push('<li class="pro"><div class="ui_pimg"><a href=http://shop.gionee.com/goods.php?id='+olist[i].goods_id+' hidefocus="true" target="_blank" class="img"><img src="'+olist[i].goods_thumb+'" width="50" height="50" alt=" '+olist[i].goods_name+olist[i].goods_attr+' " /></a></div><p class="ui_pname"><a href="http://shop.gionee.com/goods.php?id='+olist[i].goods_id+'" hidefocus="true" target="_blank">'+olist[i].goods_name+olist[i].goods_attr+'</a></p><div class="price"><span class="ui_pprice"><em>&yen;</em>'+olist[i].goods_price+'</span><span class="num">&times;'+olist[i].goods_number+'</span></div></li>');
					num+=parseInt(olist[i].goods_number) || 0;
					//gift
					if(olist[i].goods_gift && olist[i].goods_gift.length>0){		 //有赠品				
						for(var j=0,len2=olist[i].goods_gift.length,gift;j<len2;j++){
							gift=olist[i].goods_gift[j];
							if(gift.is_have_stock==1){
								html.push('<li class="pro"><div class="ui_pimg"><a href=http://shop.gionee.com/goods.php?id='+gift.goods_id+' hidefocus="true" target="_blank" class="img"><img src="'+gift.goods_thumb+'" width="50" height="50" alt=" '+gift.goods_name+' " /></a></div><p class="ui_pname"><a href="http://shop.gionee.com/goods.php?id='+gift.goods_id+'" hidefocus="true" target="_blank"><span class="fn_hl">[赠品]</span>'+gift.goods_name+'</a></p><div class="price"><span class="ui_pprice"><em>&yen;</em>0</span><span class="num">&times;'+gift.goods_number+'</span></div></li>');
						   		num+=parseInt(gift.goods_number) || 0;
						    }else{						    
								html.push('<li class="pro"><div class="ui_pimg"><a href=http://shop.gionee.com/goods.php?id='+gift.goods_id+' hidefocus="true" target="_blank" class="img"><img src="'+gift.goods_thumb+'" width="50" height="50" alt=" '+gift.goods_name+' " /></a></div><p class="ui_pname"><a href="http://shop.gionee.com/goods.php?id='+gift.goods_id+'" hidefocus="true" target="_blank"><span class="fn_hl">[赠品]</span>'+gift.goods_name+'</a></p><div class="price fn_centr"><span class="num">0</span><div class="ui_zp_layer zp_lay_pos2">赠品已送完<div class="ui_arrow-outer"></div><div class="ui_arrow-inner"></div></div></div></li>');
						    }
						}
					}
				}
				html='<ul class="cart_list">'+html.join('')+'</ul>';
				html+='<div class="sumary">共<em class="fn_hl">'+num+'</em>件产品，合计：<span class="ui_price"><em>&yen;</em>'+oBackData.total.goods_price+'</span></div><div class="toCart fn_clear"><a href="http://shop.gionee.com/cart" hidefocus="true" class="btn" target="_self">去结算</a></div>';
				html='<div class="cart_cont">'+html+'</div>';
				ocartBd.html(html);
				onum.html(num);
			}
		});
	}
		
	var ocart=new $Hover2({obj:"#Jcart",cssHover:"cart_hover",selectorPanel:"#JcartBd",config:{onBefore:getCartInfor}});
	
	// 购物车初始值
	$getCartInfo(function(data){
			var oBackData=data,onum=$("#Jcart .cart_hd em");
			if(!oBackData || oBackData.goods_list.length==0){
				onum.html(0);
			}else{
				var num=0,olist=oBackData.goods_list,len=olist.length;
				for(var i=0;i<len;i++){
					num+=parseInt(olist[i].goods_number) || 0;
				}
				onum.html(num);
			}
	});
	
	//搜索框
	var otsearch=new $FocusBlur({otxt:"JsearchTxt",config:{defValue:"输入搜索内容"}});
	
	// 集团下属公司
	var ocompany=new $Hover2({obj:"#Jconpany",selectorPanel:"ul",cssHover:"link_company_hover"});
	
	// 语言
	var olang=new $Hover2({obj:"#Jlang",selectorPanel:$("#Jlang").find("ul li").eq(0),cssHover:"lang_hover"});

})(jQuery);