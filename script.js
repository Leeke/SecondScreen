$(document).bind("mobileinit", function(){
    $.mobile.defaultPageTransition = 'flip';
    loadTimeline();
});    


if ( (navigator.userAgent.indexOf('iPad') != -1) ) {
//document.location = "http://www.fallback.com";   
}

var updateLayout = function(){
    window.scrollTo(0, 1);
}

setInterval(updateLayout, 500);


document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);





