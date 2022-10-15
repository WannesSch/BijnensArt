class Controls {
    constructor() {
        this.paintingArr = [];
    }
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
    LoadPaintings() {
        this.paintingArr = this.paintingArr.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        var newestArr = [this.paintingArr[0], this.paintingArr[1], this.paintingArr[2]];
        $('.Index-Main-Div').empty();
        newestArr.forEach(painting => {
            var name = painting.title.replace(/ /g,'');
            name = name + "-" + painting.id;

            var dataSb = "";
            dataSb += '<div class="art-data">';
            dataSb += '<h1>' + painting.title + '</h1>';
            //dataSb += '<h2>' + painting.buystate + '</h2>';
            dataSb += '<h3>' + painting.description + '</h3>';
            dataSb += '</div>';

            $('.Index-Main-Div').append(
                $('<div>').prop({
                    className: 'art-item',
                    id: 'Painting-' + painting.id
                })
                .append('<img src="Images/Gallery/' + name + '/0.jpg"  alt="' + painting.alt + '">')
                .append(dataSb)
                .attr('onClick', 'controls.Redirect(this)')
            );
        })
    }
    Redirect(button) {
        var id = button.getAttribute("id");
        
        window.location.href = "../Art.html#" + id;
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

$(document).ready(() => {
    $.post("/GETPaintings", function(dataArr) {dataArr.forEach(data => {controls.paintingArr.push(data);});});
    setTimeout(() => {
        controls.LoadPaintings();
    }, 500);
    controls.CreateSession();
})

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