$(function(){
    //添加和更新
    $(".btn-sysconfig").on("click",function(){
        var domain_attr = $(this).attr("title"); 
        //添加和更新用这个title属性判断，将对应的dom放入modal中
        console.log(domain_attr);
        if(domain_attr == 'add'){

            // 添加名称  modal dom
            var group_form = '<form class="form-horizontal form-label-left" action="add" method="post" onsubmit="return evalua()">';
            
            var group_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" title="">'+
                        '</div></div>';
            var group_submit = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<input type="hidden" name="secdomains">'+
                            '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-success">确定</button>'+
                        '</div></div></form>';
            var group_html = group_form+group_name+group_submit;
                
            $('#sysconfigform').html(group_html);            
        }else if(domain_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            var content = {};
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                   var val = $(val).text();
                   content[title] = val; 
            });
            //更新   modal dom
            var group_form = '<form class="form-horizontal form-label-left" action="'+content.id+'/update" method="post" onsubmit="return evalua()">' 
            var group_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" title="" value = "'+content.name+'">'+
                        '</div>'+
                    '</div>';   
            var group_submit ='<div class="ln_solid"></div>'+
                            '<div class="form-group">'+
                                '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                                    '<input type="hidden" name="secdomains">'+
                                    '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                                    '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                                    '<button type="submit" class="btn btn-success">确定</button>'+
                                '</div>'+
                            '</div>'+
                        '</form>';  
            var group_html = group_form+group_name+group_submit;
                
            $('#sysconfigform').html(group_html);                       
        }  
    }); 
});      

function evalua(){
    $('.btn-success').attr('disabled','disabled');
    return true;
}       