自定义背景, [/blog\.csdn\.net(\/.*)?\/article\/details./], {
    '已关闭$off': null,
    '已开启$on': () => { 
        style(`body{--background:url("${$get('csdn-background-value')}")}`)
        style(`body{--blog-content-box-background:${$get('csdn-blog-content-box-background-value','rgb(245 246 247 / 90%)')}}`)
        style(`body{--blog-content-box-opacity:${$get('csdn-blog-content-box-opacity-value','0.98')}}`)
        style(`body{--blog-header-box-background:${$get('csdn-blog-header-box-background-value','transparent')}}`)
        return $SASS(background) 
    },
}