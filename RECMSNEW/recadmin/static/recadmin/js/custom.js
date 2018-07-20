/**
 * Resize function without multiple trigger
 * 
 * Usage:
 * $(window).smartresize(function(){  
 *     // code here
 * });
 */
(function($,sr){
    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
      var timeout;

        return function debounced () {
            var obj = this, args = arguments;
            function delayed () {
                if (!execAsap)
                    func.apply(obj, args); 
                timeout = null; 
            }

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 100); 
        };
    };

    // smartresize 
    jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');
/**
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
    $BODY = $('body'),
    $MENU_TOGGLE = $('#menu_toggle'),
    $SIDEBAR_MENU = $('#sidebar-menu'),
    $SIDEBAR_FOOTER = $('.sidebar-footer'),
    $LEFT_COL = $('.left_col'),
    $RIGHT_COL = $('.right_col'),
    $NAV_MENU = $('.nav_menu'),
    $FOOTER = $('footer');

	
	
// Sidebar
function init_sidebar() {
// TODO: This is some kind of easy fix, maybe we can improve this
var setContentHeight = function () {
	// reset height
	$RIGHT_COL.css('min-height', $(window).height());
	var bodyHeight = $BODY.outerHeight(),
		footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
		leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
		contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

	// normalize content
	contentHeight -= $NAV_MENU.height() + footerHeight;

	$RIGHT_COL.css('min-height', contentHeight);
   /* var left_col_height = $('.main_container').height()+26+'px';
    $('.left_col').css('min-height',$(window).height());*/
};

  $SIDEBAR_MENU.find('a').on('click', function(ev) {
	  console.log('clicked - sidebar_menu');
        var $li = $(this).parent();

        if ($li.is('.active')) {
            $li.removeClass('active active-sm');
            $('ul:first', $li).slideUp(function() {
                setContentHeight();
            });
        } else {
            // prevent closing menu if we are on child menu
            if (!$li.parent().is('.child_menu')) {
                $SIDEBAR_MENU.find('li').removeClass('active active-sm');
                $SIDEBAR_MENU.find('li ul').slideUp();
            }else
            {
				if ( $BODY.is( ".nav-sm" ) )
				{
					$SIDEBAR_MENU.find( "li" ).removeClass( "active active-sm" );
					$SIDEBAR_MENU.find( "li ul" ).slideUp();
				}
			}
            $li.addClass('active');

            $('ul:first', $li).slideDown(function() {
                setContentHeight();
            });
        }
    });

// toggle small or large menu 
$MENU_TOGGLE.on('click', function() {
		console.log('clicked - menu toggle');
		
		if ($BODY.hasClass('nav-md')) {
			$SIDEBAR_MENU.find('li.active ul').hide();
			$SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
		} else {
			$SIDEBAR_MENU.find('li.active-sm ul').show();
			$SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
		}

	$BODY.toggleClass('nav-md nav-sm');

	setContentHeight();

	$('.dataTable').each ( function () { $(this).dataTable().fnDraw(); });
});

	// check active menu
	$SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');
	$SIDEBAR_MENU.find('a').filter(function () {
		return this.href == CURRENT_URL;
	}).parent('li').addClass('current-page').parents('ul').slideDown(function() {
		setContentHeight();
	}).parent().addClass('active');

	// recompute content when resizing
	$(window).smartresize(function(){  
		setContentHeight();
	});

	setContentHeight();

	// fixed sidebar
	if ($.fn.mCustomScrollbar) {
		$('.menu_fixed').mCustomScrollbar({
			autoHideScrollbar: true,
			theme: 'minimal',
			mouseWheel:{ preventDefault: true }
		});
	}
};
// /Sidebar

	var randNum = function() {
	  return (Math.floor(Math.random() * (1 + 40 - 20))) + 20;
	};


// Panel toolbox
$(document).ready(function() {
    $('.collapse-link').on('click', function() {
        var $BOX_PANEL = $(this).closest('.x_panel'),
            $ICON = $(this).find('i'),
            $BOX_CONTENT = $BOX_PANEL.find('.x_content');
        
        // fix for some div with hardcoded fix class
        if ($BOX_PANEL.attr('style')) {
            $BOX_CONTENT.slideToggle(200, function(){
                $BOX_PANEL.removeAttr('style');
            });
        } else {
            $BOX_CONTENT.slideToggle(200); 
            $BOX_PANEL.css('height', 'auto');  
        }

        $ICON.toggleClass('fa-chevron-up fa-chevron-down');
    });

    $('.close-link').click(function () {
        var $BOX_PANEL = $(this).closest('.x_panel');

        $BOX_PANEL.remove();
    });
});
// /Panel toolbox

// Tooltip
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body'
    });
});
// /Tooltip

// Progressbar
if ($(".progress .progress-bar")[0]) {
    $('.progress .progress-bar').progressbar();
}
// /Progressbar

// Switchery
$(document).ready(function() {
    if ($(".js-switch")[0]) {
        var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
        elems.forEach(function (html) {
            var switchery = new Switchery(html, {
                color: '#26B99A'
            });
        });
    }
});
// /Switchery
/*====================django ajax ======*/
jQuery(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});
/*===============================django ajax end===*/

// iCheck 包装在方法中

function create_icheck(){
    if ($("input.flat")[0]) {
        $(document).ready(function () {
            $('.a-center').iCheck({
                checkboxClass: 'icheckbox_flat-green',
                radioClass: 'iradio_flat-green'
            });
        });
    }
    $('table input').on('ifChecked', function () {
        checkState = '';
        $(this).parent().parent().parent().addClass('selected');
        countChecked();
    });
    $('table input').on('ifUnchecked', function () {
        checkState = '';
        $(this).parent().parent().parent().removeClass('selected');
        countChecked();
    });

    var checkState = '';

    $('.bulk_action input').on('ifChecked', function () {
        checkState = '';
        $(this).parent().parent().parent().addClass('selected');
        countChecked();
    });
    $('.bulk_action input').on('ifUnchecked', function () {
        checkState = '';
        $(this).parent().parent().parent().removeClass('selected');
        countChecked();
    });
    $('.bulk_action input#check-all').on('ifChecked', function () {
        checkState = 'all';
        countChecked();
    });
    $('.bulk_action input#check-all').on('ifUnchecked', function () {
        checkState = 'none';
        countChecked();
    });

    function countChecked() {
        if (checkState === 'all') {
            $(".bulk_action input[name='table_records']").iCheck('check');
        }
        if (checkState === 'none') {
            $(".bulk_action input[name='table_records']").iCheck('uncheck');
        }

        var checkCount = $(".bulk_action input[name='table_records']:checked").length;

        if (checkCount) {
            $('.column-title').hide();
            $('.bulk-actions').show();
            $('.action-cnt').html('选中'+checkCount+'条记录');
        } else {
            $('.column-title').show();
            $('.bulk-actions').hide();
        }
    }
}

/*$(document).ready(function() {
    if ($("input.flat")[0]) {
        $(document).ready(function () {
            $('.a-center').iCheck({
                checkboxClass: 'icheckbox_flat-green',
                radioClass: 'iradio_flat-green'
            });
        });
    }
});
// /iCheck

// Table
$('table input').on('ifChecked', function () {
    checkState = '';
    $(this).parent().parent().parent().addClass('selected');
    countChecked();
});
$('table input').on('ifUnchecked', function () {
    checkState = '';
    $(this).parent().parent().parent().removeClass('selected');
    countChecked();
});

var checkState = '';

$('.bulk_action input').on('ifChecked', function () {
    checkState = '';
    $(this).parent().parent().parent().addClass('selected');
    countChecked();
});
$('.bulk_action input').on('ifUnchecked', function () {
    checkState = '';
    $(this).parent().parent().parent().removeClass('selected');
    countChecked();
});
$('.bulk_action input#check-all').on('ifChecked', function () {
    checkState = 'all';
    countChecked();
});
$('.bulk_action input#check-all').on('ifUnchecked', function () {
    checkState = 'none';
    countChecked();
});

function countChecked() {
    if (checkState === 'all') {
        $(".bulk_action input[name='table_records']").iCheck('check');
    }
    if (checkState === 'none') {
        $(".bulk_action input[name='table_records']").iCheck('uncheck');
    }

    var checkCount = $(".bulk_action input[name='table_records']:checked").length;

    if (checkCount) {
        $('.column-title').hide();
        $('.bulk-actions').show();
        $('.action-cnt').html('选中'+checkCount+'条记录');
    } else {
        $('.column-title').show();
        $('.bulk-actions').hide();
    }
}*/


//批量启用
$('#enable_data').on('click',function(){
    var data = [];
    $(".bulk_action input[name='table_records']:checked").each(function(){
        data.push($(this).val());
    });
    var url =$(this).attr('name');
    batch_enable(data,url);

});
function batch_enable(data,url){
    console.log(data);
    $.ajax({
        url:url+'/operatemulti/?status=1',
        type:'POST',
        dataType:'json',
        data:'data='+data,
        success:function(data){
            console.log(data);
            if(data == 1){
                window.location.reload();
            }
        },
        fail:function(err){
            console.log(err);
        }
    });
}

//批量停用
$('#disable_data').on('click',function(){
    var data = [];
    $(".bulk_action input[name='table_records']:checked").each(function(){
        data.push($(this).val());
    });
    var url =$(this).attr('name');
    batch_disable(data,url);

});
function batch_disable(data,url){
    console.log(data);
    $.ajax({
        url:url+'/operatemulti/?status=0',
        type:'POST',
        dataType:'json',
        data:'data='+data,
        success:function(data){
            console.log(data);
            if(data == 1){
                window.location.reload();
            }
        },
        fail:function(err){
            console.log(err);
        }
    });
}

//批量删除
$('#del_data').on('click',function(){
    var data = [];
    $(".bulk_action input[name='table_records']:checked").each(function(){
        data.push($(this).val());
    });
    console.log(data);
    var url = $(this).attr('name');
    batch_del(data,url);
});
function batch_del(data,url){
    console.log(data);
    $.ajax({
        url:url+'/delmulti/',
        type:'POST',
        dataType:'json',
        data:'data='+data,
        success:function(data){
            console.log(data);
            if(data == 1){
                window.location.reload();
            }
        },
        fail:function(err){
            console.log(err);
        }
    });
}

// Accordion
$(document).ready(function() {
    $(".expand").on("click", function () {
        $(this).next().slideToggle(200);
        $expand = $(this).find(">:first-child");

        if ($expand.text() == "+") {
            $expand.text("-");
        } else {
            $expand.text("+");
        }
    });
});

// NProgress
if (typeof NProgress != 'undefined') {
    $(document).ready(function () {
        NProgress.start();
    });

    $(window).load(function () {
        NProgress.done();
    });
}

	
	  //hover and retain popover when on popover content
        var originalLeave = $.fn.popover.Constructor.prototype.leave;
        $.fn.popover.Constructor.prototype.leave = function(obj) {
          var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type);
          var container, timeout;

          originalLeave.call(this, obj);

          if (obj.currentTarget) {
            container = $(obj.currentTarget).siblings('.popover');
            timeout = self.timeout;
            container.one('mouseenter', function() {
              //We entered the actual popover – call off the dogs
              clearTimeout(timeout);
              //Let's monitor popover content instead
              container.one('mouseleave', function() {
                $.fn.popover.Constructor.prototype.leave.call(self, self);
              });
            });
          }
        };

        $('body').popover({
          selector: '[data-popover]',
          trigger: 'click hover',
          delay: {
            show: 50,
            hide: 400
          }
        });


	function gd(year, month, day) {
		return new Date(year, month - 1, day).getTime();
	}
	  
	
	  	   
	   /* AUTOCOMPLETE */
			
		function init_autocomplete() {
			
			if( typeof (autocomplete) === 'undefined'){ return; }
			console.log('init_autocomplete');
			
			var countries = { AD:"Andorra",A2:"Andorra Test",AE:"United Arab Emirates",AF:"Afghanistan",AG:"Antigua and Barbuda",AI:"Anguilla",AL:"Albania",AM:"Armenia",AN:"Netherlands Antilles",AO:"Angola",AQ:"Antarctica",AR:"Argentina",AS:"American Samoa",AT:"Austria",AU:"Australia",AW:"Aruba",AX:"Åland Islands",AZ:"Azerbaijan",BA:"Bosnia and Herzegovina",BB:"Barbados",BD:"Bangladesh",BE:"Belgium",BF:"Burkina Faso",BG:"Bulgaria",BH:"Bahrain",BI:"Burundi",BJ:"Benin",BL:"Saint Barthélemy",BM:"Bermuda",BN:"Brunei",BO:"Bolivia",BQ:"British Antarctic Territory",BR:"Brazil",BS:"Bahamas",BT:"Bhutan",BV:"Bouvet Island",BW:"Botswana",BY:"Belarus",BZ:"Belize",CA:"Canada",CC:"Cocos [Keeling] Islands",CD:"Congo - Kinshasa",CF:"Central African Republic",CG:"Congo - Brazzaville",CH:"Switzerland",CI:"Côte d’Ivoire",CK:"Cook Islands",CL:"Chile",CM:"Cameroon",CN:"China",CO:"Colombia",CR:"Costa Rica",CS:"Serbia and Montenegro",CT:"Canton and Enderbury Islands",CU:"Cuba",CV:"Cape Verde",CX:"Christmas Island",CY:"Cyprus",CZ:"Czech Republic",DD:"East Germany",DE:"Germany",DJ:"Djibouti",DK:"Denmark",DM:"Dominica",DO:"Dominican Republic",DZ:"Algeria",EC:"Ecuador",EE:"Estonia",EG:"Egypt",EH:"Western Sahara",ER:"Eritrea",ES:"Spain",ET:"Ethiopia",FI:"Finland",FJ:"Fiji",FK:"Falkland Islands",FM:"Micronesia",FO:"Faroe Islands",FQ:"French Southern and Antarctic Territories",FR:"France",FX:"Metropolitan France",GA:"Gabon",GB:"United Kingdom",GD:"Grenada",GE:"Georgia",GF:"French Guiana",GG:"Guernsey",GH:"Ghana",GI:"Gibraltar",GL:"Greenland",GM:"Gambia",GN:"Guinea",GP:"Guadeloupe",GQ:"Equatorial Guinea",GR:"Greece",GS:"South Georgia and the South Sandwich Islands",GT:"Guatemala",GU:"Guam",GW:"Guinea-Bissau",GY:"Guyana",HK:"Hong Kong SAR China",HM:"Heard Island and McDonald Islands",HN:"Honduras",HR:"Croatia",HT:"Haiti",HU:"Hungary",ID:"Indonesia",IE:"Ireland",IL:"Israel",IM:"Isle of Man",IN:"India",IO:"British Indian Ocean Territory",IQ:"Iraq",IR:"Iran",IS:"Iceland",IT:"Italy",JE:"Jersey",JM:"Jamaica",JO:"Jordan",JP:"Japan",JT:"Johnston Island",KE:"Kenya",KG:"Kyrgyzstan",KH:"Cambodia",KI:"Kiribati",KM:"Comoros",KN:"Saint Kitts and Nevis",KP:"North Korea",KR:"South Korea",KW:"Kuwait",KY:"Cayman Islands",KZ:"Kazakhstan",LA:"Laos",LB:"Lebanon",LC:"Saint Lucia",LI:"Liechtenstein",LK:"Sri Lanka",LR:"Liberia",LS:"Lesotho",LT:"Lithuania",LU:"Luxembourg",LV:"Latvia",LY:"Libya",MA:"Morocco",MC:"Monaco",MD:"Moldova",ME:"Montenegro",MF:"Saint Martin",MG:"Madagascar",MH:"Marshall Islands",MI:"Midway Islands",MK:"Macedonia",ML:"Mali",MM:"Myanmar [Burma]",MN:"Mongolia",MO:"Macau SAR China",MP:"Northern Mariana Islands",MQ:"Martinique",MR:"Mauritania",MS:"Montserrat",MT:"Malta",MU:"Mauritius",MV:"Maldives",MW:"Malawi",MX:"Mexico",MY:"Malaysia",MZ:"Mozambique",NA:"Namibia",NC:"New Caledonia",NE:"Niger",NF:"Norfolk Island",NG:"Nigeria",NI:"Nicaragua",NL:"Netherlands",NO:"Norway",NP:"Nepal",NQ:"Dronning Maud Land",NR:"Nauru",NT:"Neutral Zone",NU:"Niue",NZ:"New Zealand",OM:"Oman",PA:"Panama",PC:"Pacific Islands Trust Territory",PE:"Peru",PF:"French Polynesia",PG:"Papua New Guinea",PH:"Philippines",PK:"Pakistan",PL:"Poland",PM:"Saint Pierre and Miquelon",PN:"Pitcairn Islands",PR:"Puerto Rico",PS:"Palestinian Territories",PT:"Portugal",PU:"U.S. Miscellaneous Pacific Islands",PW:"Palau",PY:"Paraguay",PZ:"Panama Canal Zone",QA:"Qatar",RE:"Réunion",RO:"Romania",RS:"Serbia",RU:"Russia",RW:"Rwanda",SA:"Saudi Arabia",SB:"Solomon Islands",SC:"Seychelles",SD:"Sudan",SE:"Sweden",SG:"Singapore",SH:"Saint Helena",SI:"Slovenia",SJ:"Svalbard and Jan Mayen",SK:"Slovakia",SL:"Sierra Leone",SM:"San Marino",SN:"Senegal",SO:"Somalia",SR:"Suriname",ST:"São Tomé and Príncipe",SU:"Union of Soviet Socialist Republics",SV:"El Salvador",SY:"Syria",SZ:"Swaziland",TC:"Turks and Caicos Islands",TD:"Chad",TF:"French Southern Territories",TG:"Togo",TH:"Thailand",TJ:"Tajikistan",TK:"Tokelau",TL:"Timor-Leste",TM:"Turkmenistan",TN:"Tunisia",TO:"Tonga",TR:"Turkey",TT:"Trinidad and Tobago",TV:"Tuvalu",TW:"Taiwan",TZ:"Tanzania",UA:"Ukraine",UG:"Uganda",UM:"U.S. Minor Outlying Islands",US:"United States",UY:"Uruguay",UZ:"Uzbekistan",VA:"Vatican City",VC:"Saint Vincent and the Grenadines",VD:"North Vietnam",VE:"Venezuela",VG:"British Virgin Islands",VI:"U.S. Virgin Islands",VN:"Vietnam",VU:"Vanuatu",WF:"Wallis and Futuna",WK:"Wake Island",WS:"Samoa",YD:"People's Democratic Republic of Yemen",YE:"Yemen",YT:"Mayotte",ZA:"South Africa",ZM:"Zambia",ZW:"Zimbabwe",ZZ:"Unknown or Invalid Region" };

			var countriesArray = $.map(countries, function(value, key) {
			  return {
				value: value,
				data: key
			  };
			});

			// initialize autocomplete with custom appendTo
			$('#autocomplete-custom-append').autocomplete({
			  lookup: countriesArray
			});
			
		};
	   
	 /* AUTOSIZE */
			
		function init_autosize() {
			
			if(typeof $.fn.autosize !== 'undefined'){
			
			autosize($('.resizable_textarea'));
			
			}
			
		};  

        $(document).ready(function() {
            
            init_sidebar();
            init_autosize();

        });

//历史记录查询
// $('#search-history').on('click',function(){
//     var qname = $('#qname').val();
//     $.ajax({
//         url:'/history/',
//         type:'get',
//         dataType:'json',
//         data:'qname='+qname,
//         success:function(data){
//             console.log(data);
//         },
//         fail:function(err){
//             console.log(err);
//         }
//     });
// }


function requestData(){

}

requestData.prototype.ajaxData=function(url,type,data,callback){
    $.ajax({
        url:url,
        type: type,
        dataType: 'json',
        data:data,
        traditional: true,
        headers: {
            // 'Access-Control-Allow-Origin': '*',
            // 'Content-Type': 'application/json',
            "Authorization":"Token a5411a3756d0891e19e02908626a7b6a8ca6e6dd"
        },
        success: function(data) {
           callback(data);
        },
        error:  function(err) {
            alert(err.responseText);
            $('.btn-success').attr('disabled',false);
            $('.modal').modal('hide');
        }
    });
}
function renderPool(data,pid){
    var pool_html = '';
    if(pid == null||pid == ""||pid == undefined){
        $.each(data,function(key,val){
            var id = val.id;
            var name = val.name;
            pool_html +='<option value="'+val.id+'">'+val.name+'</option>';
        });
    }else{
        $.each(data,function(key,val){
            var id = val.id;
            var name = val.name;
            if(id == pid){
                pool_html +='<option value="'+val.id+'" selected>'+val.name+'</option>';
            }else{
                pool_html +='<option value="'+val.id+'">'+val.name+'</option>';
            }  
        });
    }
    return pool_html;   
}
function renderdomain(data,pid){
    var domain_html = '';
    if(pid == null||pid == ""||pid == undefined){
        $.each(data,function(key,val){
            var id = val.id;
            var domain = val.domain;
            domain_html +='<option value="'+val.id+'">'+val.domain+'</option>';
        });
    }else{
        $.each(data,function(key,val){
            var id = val.id;
            var domain = val.domain;
            if(id == pid){
                domain_html +='<option value="'+val.id+'" selected>'+val.domain+'</option>';
            }else{
                domain_html +='<option value="'+val.id+'">'+val.domain+'</option>';
            }  
        });
    }
    return domain_html;   
}
function renderServer(data,arr){
    var pool_html = '';
    if(arr.length == 0){
        $.each(data,function(key,val){
            var id = val.id;
            var name = val.name;
            pool_html +='<option value="'+val.id+'">'+val.name+'</option>';
        });
    }else{ 
        for(var i = 0; i<arr.length; i++){
            pool_html +='<option value="'+arr[i].id+'" selected>'+arr[i].name+'</option>';
        }
        var arrdiff = array_diff(data,arr);
        if(arrdiff.length!=0){
            for(var i = 0; i<arr.length; i++){
                pool_html +='<option value="'+arrdiff[i].id+'">'+arrdiff[i].name+'</option>';
            }
        }
    }
    return pool_html;   
}
function array_diff(a, b) {  
    var array1 = [];
    var array2 = [];
    for(var i=0;i<b.length;i++)  
    {  
      array1.push(b[i].id);
    };
    for(var i=0;i<a.length;i++){
        if(array1.indexOf(a[i].id) == -1){
            array2.push(a[i]);
        }
    }
    return array2;  
}  


//验证ipv4或ipv6地址
$(document).on('change','.ipVaild',function(){
    var that = $(this);
    var data = that.val();
    var arraydata = data.split(",");
    var Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
    if(arraydata.length){
        for(var i=0; i<arraydata.length;i++){
            var ipVaild = Regex.test(arraydata[i]);
            if(ipVaild){
                console.log("地址正确");
            }else{
                alert("IPv4或IPv6地址不正确");
                that.val('');
                that.focus();
            }
        }  
    }else{
        alert("地址不能为空");
    }
});

function CheckIsValidDomain(domain) { 
    var Regex = /(^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$)|^\.$/; 
    return Regex.test(domain);
}

function CheckIsValidName(name){
    var Regex = /^[a-zA-Z]{1}\w*$/;
    return Regex.test(name);
}
//验证域名
$(document).on('change','.domainVaild',function(){
    var that = $(this);
    var data = that.val();
    if(data){
        var ipVaild = CheckIsValidDomain(data);
        if(ipVaild){
            console.log("域名正确");
        }else{
            alert("域名错误");
            that.val('');
            that.focus();
        }
    }else{
        alert("域名不能为空");
    }
});
//缓存name验证
$(document).on('change','.nameVaild',function(){
    var that = $(this);
    var data = that.val();
    if(data){
        var nameVaild = CheckIsValidName(data);
        if(nameVaild){
            console.log("名称格式正确");
        }else{
            alert("名称必须以字母开头,中间不能有特殊字符");
            that.val('');
            that.focus();
        }
    }else{
        alert("名称不能为空");
    }
});

/*function create_modal(data,pool){

    var data = {
        title:'转发域名',
        input:[
            {name:'domain',title:'转发域名'},
            {name:'server',title:'转发服务器'}
        ],
        select:[
            {name:'poolname',title:'链路',data:'pooldata'}
        ],
        status:'',
        only:''
    }
    var htmldom = '',
        input = '',  
        select = '',
        only = '',
        status = ''; 
    var header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">'+data.title+'</h4></div>'+
                '<div class="modal-body">'+
                '<div class="form-horizontal form-label-left">';
    var footer = '<div class="ln_solid"></div>'+
                '<div class="form-group">'+
                '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                    '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</a></button>'+
                    '<button type="submit" class="btn btn-success btn-add">确定</button>'+
                '</div></div></div></div>';          
    $.each(data.input,function(key,val){
        input += '<div class="form-group">'+
                '<label class="control-label col-md-3 col-sm-3 col-xs-12">'+val.title+'</label>'+
                '<div class="col-md-6 col-sm-6 col-xs-12">'+
                    '<input type="text" required="required" class="form-control col-md-7 col-xs-12" name="'+val.name+'">'+
                '</div></div>';

    });
    if(data.only){
        only = '<div class="form-group">'+
            '<label class="control-label col-md-3 col-sm-3 col-xs-12">仅转发</label>'+
            '<div class="col-md-6 col-sm-6 col-xs-12">'+
                '<div class="switch switch-blue">'+
                    '<input type="radio" class="switch-input" name="only" value="1" id="addonlyone" checked>'+
                    '<label for="addonlyone" class="switch-label switch-label-off">转发</label>'+
                    '<input type="radio" class="switch-input" name="only" value="0" id="addonlyzero">'+
                    '<label for="addonlyzero" class="switch-label switch-label-on">关闭</label>'+
                    '<span class="switch-selection"></span>'+
                '</div></div></div>';
    } 
    if(data.status){
        status = '<div class="form-group">'+
                '<label class="control-label col-md-3 col-sm-3 col-xs-12">是否启用</label>'+
                '<div class="col-md-6 col-sm-6 col-xs-12">'+
                    '<div class="switch switch-blue">'+
                        '<input type="radio" class="switch-input" name="status" value="1" id="addone" checked>'+
                        '<label for="addone" class="switch-label switch-label-off">开启</label>'+
                        '<input type="radio" class="switch-input" name="status" value="0" id="addzero">'+
                        '<label for="addzero" class="switch-label switch-label-on">关闭</label>'+
                        '<span class="switch-selection"></span>'+
                    '</div></div></div>';
    }   
    $.each(data.select,function(key,val){  
        select += '<div class="form-group">'+
                '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="type">'+val.title+'</label>'+
                '<div class="col-md-6 col-sm-6 col-xs-12">'+
                '<select class="form-control" name="'+val.name+'">'+data+
                '</select></div></div>';  

    });               
            
    htmldom = header+input+select+only+status+footer;
    return htmldom;
}*/



