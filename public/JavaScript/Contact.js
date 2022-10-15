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
        
        if (getCookie("SESSION") != null) return;
        var rnd = (Math.random() + 1).toString(36).substring(7);
        setCookie("SESSION", rnd);
    }
    SendEmail() {
        var name = $('#mailname').val();
        var prename = $('#mailprename').val();
        var email = $('#emailinput').val();
        var phone = $('#phoneinput').val();
        var subject =  $('#mailsubject').val();
        var message =  $('#messageinput').val();

        if (!name) {this.Message("Geef u naam in.", '#db4237'); return;}
        if (!prename) {this.Message("Geef u voornaam in.", '#db4237'); return;}
        if (!email) {this.Message("Geef u email in.", '#db4237'); return;}
        if (!subject) {this.Message("Geef een onderwerp in.", '#db4237'); return;}
        if (!message) {this.Message("Uw bericht is leeg.", '#db4237'); return;}

        var mailObject = {name: name, prename: prename, email: email, phone: phone, subject:subject, message: message}

        $.post('/SENDEmail', {mailObject: mailObject}, (data) => {
            if (data == "SUCCESS") {
                this.Message("Uw bericht is succesvol verzonden.", '#29962a');
                $('#mailname').val("");
                $('#mailprename').val("");
                $('#emailinput').val("");
                $('#phoneinput').val("");
                $('#mailsubject').val("");
                $('#messageinput').val("");
            }
        })
        
    }
    Message(msg, color) {
        $('.Message').css('display', 'flex');
        $('.Message').css('background', color);
        $('.Message').html(msg);
        setTimeout(() => {
            $('.Message').css('display', 'none');
        }, 1000);
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