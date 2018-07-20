$(function(){
    //添加和更新
    $(".btn-linktype").on("click",function(){
        var domain_attr = $(this).attr("title"); 
        //添加和更新用这个title属性判断，将对应的dom放入modal中
        console.log(domain_attr);
        if(domain_attr == 'add'){
            var linktype_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">运营商</h4></div>'+
                '<div class="modal-body">'+
                '<form class="form-horizontal form-label-left" action="add" method="post" onsubmit="return resubmit()">';
            // 添加名称  modal dom
            
            var linktype_name =  '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name">'+
                        '</div></div>';
            var linktype_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-success">确定</button>'+
                        '</div></div></form></div>';
            var linktype_html = linktype_header+linktype_name+linktype_footer;     
            $('#modal-linktype').html(linktype_html);            
        }else if(domain_attr == 'update'){
            var dom = $(this).parent().siblings('.d-content');
            var content = {};
            $.each(dom,function(key,val){
                var title = $(val).attr('title');
                   var val = $(val).text();
                   content[title] = val; 
            });
            //更新   modal dom
            var linktype_header = '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span></button>'+
                '<h4 class="modal-title" id="modal-title">运营商</h4></div>'+
                '<div class="modal-body">'+
                '<form class="form-horizontal form-label-left" action="'+content.id+'/update" method="post" onsubmit="return resubmit()">';
            var linktype_name = '<div class="form-group">'+
                        '<label class="control-label col-md-3 col-sm-3 col-xs-12" for="name">名称</label>'+
                        '<div class="col-md-6 col-sm-6 col-xs-12">'+
                            '<input type="text" id="name" required="required" class="form-control col-md-7 col-xs-12" name="name" title="" value = "'+content.name+'">'+
                        '</div>'+
                    '</div>';   
            var linktype_footer = '<div class="ln_solid"></div>'+
                    '<div class="form-group">'+
                        '<div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">'+
                            '<input type="hidden" name="secdomains">'+
                            '<input type="hidden" name="csrfmiddlewaretoken" value="'+window.csrf_token+'">'+
                            '<button class="btn btn-primary" type="button" data-dismiss="modal">取消</button>'+
                            '<button type="submit" class="btn btn-success">确定</button>'+
                        '</div></div></form></div>';
            var linktype_html = linktype_header+linktype_name+linktype_footer;
                
            $('#modal-linktype').html(linktype_html);                       
        }  
    }); 
});      
       