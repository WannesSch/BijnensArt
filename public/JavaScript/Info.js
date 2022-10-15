class Controls {
    constructor() {}
    OpenNavbar() {
        if($('#Phone').hasClass('toggle')) {
            $('#Phone').removeClass('toggle');
            $('body').css('overflow', 'scroll');
            $('.hamburger').removeClass('toggle');
        }
        else {
            $('body').css('overflow', 'hidden');
            $('#Phone').addClass('toggle');
            $('.hamburger').addClass('toggle');
        }
    }
    CreateSession() {
        var ispArr = ["Telenet BVBA", "Proximus NV", "Scarlet Belgium NV", "KPN N.V.", "AS47377 Network - BRAS"];
        if (getCookie("SESSION") != null) return;
        var rnd = (Math.random() + 1).toString(36).substring(7);
        setCookie("SESSION", rnd);

        $.get("http://www.geoplugin.net/json.gp", function(response) {
            $.get("https://geo.ipify.org/api/v2/country,city,vpn?apiKey=at_ep0AaWm4Q7YCAYiWdfQIIoEvuFsZK&ipAddress=" + response.geoplugin_request, function(res) {
                for (let i = 0; i<ispArr.length; i++) {
                    if (ispArr[i] == res.isp) $.post("/ADDvisit", {dataArr: [res.ip, res.location.country, response.geoplugin_regionName, response.geoplugin_city]}, function(data){});
                }
            }, "json")
        }, "json") 
    }
}

var controls = new Controls();

$(document).ready(() => {controls.CreateSession();});

function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (30*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}