class Controls {
    constructor() {
        this.sortType = "newestFirst"
        this.paintingSelected = "preview-0"
        this.openedPainting = null;
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
    Update() {
        $.post("/GETPaintings", function(dataArr) {dataArr.forEach(data => {controls.paintingArr.push(data);});});
        setTimeout(() => {
            controls.ChangeSortType(controls.sortType); 
        }, 500);
    }
    SelectPainting(button) {
        var id = button.getAttribute("id");

        $('#' + this.paintingSelected).removeClass("selected");
        this.paintingSelected = id;
        $('#' + this.paintingSelected).addClass("selected");
            id = parseInt(id.replace("preview-", ""));

        var name = this.openedPainting.title.replace(/ /g,'');
            name = name + "-" + this.openedPainting.id;

        $('.painting').css('background-image', 'url(../Images/Gallery/' + name + '/' + id + '.jpg)')
    }
    CyclePaintings(direction) {
        var id = parseInt(this.paintingSelected.split("-")[1]);
        $('#' + this.paintingSelected).removeClass("selected");
        if (direction == "Left") {
            id--;
            if (id < 0) id = this.openedPainting.paintingamount -1;
            this.paintingSelected = "preview-" + id;
            $('#' + this.paintingSelected).addClass("selected");
        }
        if (direction == "Right") {
            id++;
            if (this.openedPainting.paintingamount <= id) id = 0;
            this.paintingSelected = "preview-" + id;
            $('#' + this.paintingSelected).addClass("selected");
        }
        var name = this.openedPainting.title.replace(/ /g,'');
            name = name + "-" + this.openedPainting.id;

        $('.painting').css('background-image', 'url(../Images/Gallery/' + name + '/' + id + '.jpg)')
    }
    ClosePaintingMenu() {$('.darkOverlay').css('display', 'none');}
    LoadPaintings(array) {
        $('.paintings').empty();
        array.forEach(painting => {
            var name = painting.title.replace(/ /g,'');
            name = name + "-" + painting.id;

            var dataSb = "";
            dataSb += '<div class="art-data">';
            dataSb += '<h1>' + painting.title + '</h1>';
            //dataSb += '<h2>' + painting.buystate + '</h2>';
            dataSb += '<h3>' + painting.description + '</h3>';
            dataSb += '</div>';

            $('.paintings').append(
                $('<div>').prop({
                    className: 'art-item',
                    id: 'Painting-' + painting.id
                })
                .append('<img src="Images/Gallery/' + name + '/0.jpg"  alt="' + painting.alt + '">')
                .append(dataSb)
                .attr('onClick', 'controls.OpenPainting(this)')
            );
    
        })
    }
    OpenPainting(button) {
        var id = button.getAttribute("id");
        id = parseInt(id.replace("Painting-", ""));
        this.openedPainting = this.FindPaintingByID(id);
        this.AddView(id);

        var name = this.openedPainting.title.replace(/ /g,'');
            name = name + "-" + this.openedPainting.id;

        $('.previewWrapper').empty();
        for (let i = 0; i<this.openedPainting.paintingamount; i++) {
            if (i == 0) {
                $('.previewWrapper').append(
                    $('<div>').prop({id: 'preview-' + i})
                        .addClass("selected")
                        .attr('onClick', 'controls.SelectPainting(this)')
                        .css('background-image', 'url(../Images/Gallery/' + name + '/' + i + '.jpg)')
                    );
            }
            else {
                $('.previewWrapper').append(
                    $('<div>').prop({id: 'preview-' + i})
                        .attr('onClick', 'controls.SelectPainting(this)')
                        .css('background-image', 'url(../Images/Gallery/' + name + '/' + i + '.jpg)')
                    );
            }
        }
        $('.painting').css('background-image', 'url(../Images/Gallery/' + name + '/0.jpg)')

        $('.darkOverlay').css('display', 'flex');
    }
    FindPaintingByID(id) {
        var painting = null;
        for (let i = 0; i<this.paintingArr.length; i++) 
            if (this.paintingArr[i].id == id) painting = this.paintingArr[i];
        
        return painting;
    }
    ChangeSortType(type) {
        $('#' + this.sortType).removeClass("selected");
        this.sortType = type;
        $('#' + this.sortType).addClass("selected");

        var sortedArr = [];

        switch(type) {
            case "newestFirst": {sortedArr = this.paintingArr.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));} break;
            case "oldestFirst": {sortedArr = this.paintingArr.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).reverse();} break;
            case "paintings": {
                for (let i = 0; i<this.paintingArr.length; i++) 
                    if(this.paintingArr[i].type == "Schilderij") sortedArr.push(this.paintingArr[i]);
            } break;
            case "sculptures": {
                for (let i = 0; i<this.paintingArr.length; i++) 
                    if(this.paintingArr[i].type == "Sculptuur") sortedArr.push(this.paintingArr[i]);
            } break;
            case "mostviewed": {sortedArr = this.paintingArr.sort((a, b) => b.views - a.views);} break;
            case "alphabetic": {
                sortedArr = this.paintingArr.sort(function(a,b){
                    return a.title.localeCompare(b.title);
                })
            } break;

        }
        this.LoadPaintings(sortedArr);
    }
    AddView(paintingID) {$.post("/EDITViews", {id: paintingID}, function(dataArr) {});}
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
    controls.Update(); 
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