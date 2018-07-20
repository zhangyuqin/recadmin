$(document).ready(function(){  
    $('div.alert').delay(3000).fadeOut('slow');
    // 获取url?后字符串,赋值给dom page
    
    var qurls = GetRequest();
    var hurls = '';
    if(qurls.q){
        hurls = '&q='+qurls.q; 
    }
    console.log(hurls);
    $('.btn-href').each(function(key,value){
        var bhref = $(this).attr('href');
        if(bhref){
            var btnhref = bhref + hurls;
            $(this).attr('href',btnhref);
        }
        //console.log($(this).attr('href')); 
    });
    $('.option-href').each(function(key,value){
        var opval = $(this).val();
        var optval = opval + hurls;
        $(this).attr('value',optval);
    });
    $("#page").on('change', function(){
        location.href=this.options[this.selectedIndex].value;
    });

    //去掉name 中的空格
    $(document).on('change','#name',function(){
        var that = $(this);
        var val = that.val();
        if(val.indexOf(" ")==-1){
            console.log('没有空格');
        }else{
            val = val.replace(/\s+/g,"");
            that.val(val);
            console.log('去掉空格，赋值给input');
        }
    });

});
function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
     if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
           theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
     }
    return theRequest;
}
//防止重复提交
function resubmit(){
    $('.btn-success').attr('disabled','disabled');
    return true;
}
