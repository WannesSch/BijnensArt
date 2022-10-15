class Controls {
    constructor() {
    }
    Redirect(account) {
        if (!account.isAdmin) {$('.message').css('background', 'rgb(224, 121, 54)'); controls.Message("Je hebt geen toegang tot het admin menu."); return}
        
        window.location.href = "../admin.html?Username=" + account.userName + "?Key=" + account.currentPrivateCode;
    }
    ShowPassword(button, isVisible) {
        var _class = button.getAttribute('class');

        if (_class == "login-password") {
            if (isVisible) {
                $('#login-showPassword').css('display', 'flex');
                $('#login-hidePassword').css('display', 'none');
                $('#login-password').get(0).type = "password"
            }
            else {
                $('#login-showPassword').css('display', 'none');
                $('#login-hidePassword').css('display', 'flex');
                $('#login-password').get(0).type = "text"
            }
        }
        else if (_class == "register-password") {
            if (isVisible) {
                $('#register-showPassword').css('display', 'flex');
                $('#register-hidePassword').css('display', 'none');
                $('#register-password').get(0).type = "password"
            }
            else {
                $('#register-showPassword').css('display', 'none');
                $('#register-hidePassword').css('display', 'flex');
                $('#register-password').get(0).type = "text"
            }
        }
        else if (_class == "register-confirmPassword") {
            if (isVisible) {
                $('#register-showconfirmPassword').css('display', 'flex');
                $('#register-hideconfirmPassword').css('display', 'none');
                $('#register-confirmPassword').get(0).type = "password"
            }
            else {
                $('#register-showconfirmPassword').css('display', 'none');
                $('#register-hideconfirmPassword').css('display', 'flex');
                $('#register-confirmPassword').get(0).type = "text"
            }
        }
    }
    OpenRegisterForm() {
        this.Message("Deze functie is nog niet in gebruik.")
        return;
        $('.loginWrapper').css('display', 'none');
        $('.registerWrapper').css('display', 'flex');
    }
    ReturnToLogin() {
        $('.loginWrapper').css('display', 'flex');
        $('.registerWrapper').css('display', 'none');
    }
    Login() {
        var username = $('#login-username').val();
        var password = $('#login-password').val();
        if (username == "") { this.Message("Gebruikersnaam mag niet leeg zijn."); return; }
        if (password == "") { this.Message("Wachtwoord mag niet leeg zijn."); return; }

        $.post("/CheckLogin", {dataArr: [username, password]}, function(dataArr) {
            if (dataArr[0] == "SUCCESS") {
                $('.message').css('background-color', '#208214');
                controls.Message("Login succesvol, doorverwijzen...");
                controls.Redirect(JSON.parse(dataArr[1]));
            }
            if (dataArr[0] == "ERROR") {$('.message').css('background', 'rgb(224, 121, 54)'); controls.Message(dataArr[1]);}
        });
    }
    Message(msg) {
        $('.message').css('display', 'flex');
        $('.message').html(msg)
        setTimeout(() => {
            $('.message').css('display', 'none');
        }, 1500);
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


function Login(username, password) {
    $.post("/Login", {username: username, password: password}, (data) => {
        var _data = data.split('=');
        switch (_data[0]) {
            case "SUCCESS": {
                setCookie("LOGGEDIN", _data[1]);
                setCookie("LOGGEDINSTATE", "TRUE");
                $('#loginusername').css('border-color', 'rgb(24, 163, 20)');
                $('#loginpassword').css('border-color', 'rgb(24, 163, 20)');
                Message(_data[0], "Login succesvol");
                setTimeout(() => {
                    load_newurl("index.html", "loggedin", _data[1]);
                }, 1000);
                break;
            }
            case "ERROR": {
                $('#loginusername').css('border-color', 'rgb(191, 45, 29)');
                $('#loginpassword').css('border-color', 'rgb(191, 45, 29)');
                Message(_data[0], _data[1]);
                setTimeout(() => {
                    $('#loginusername').css('border-color', 'rgb(23, 22, 29)');
                    $('#loginpassword').css('border-color', 'rgb(23, 22, 29)');
                }, 3000);
                break;
            }
        }
    });
}
function Register(arr) {
    $.post("/Register", {dataArr: arr}, (data) => {
        var _data = data.split('=');
        switch (_data[0]) {
            case "SUCCESS": {
                Login(_data[2].info.username, arr[5]);
                Message(_data[0], _data[1]);
                break;
            }
            case "ERROR":  Message(_data[0], _data[1]); break;
        }
    });
}

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
function Message(type, msg) {
    switch (type) {
        case "ERROR": $('.message').css('background', 'rgb(191, 45, 29)'); break;
        case "SUCCESS": $('.message').css('background', 'rgb(24, 163, 20)'); break;
    }
    $('.message').html(msg);
    $('.message').css('display', 'flex');
    setTimeout(() => {
        $('.message').css('display', 'none');
    }, 1500);
}
function load_newurl(location, param, value) {
    var url = location;
    var index = url.indexOf("?" + param + "=");
    if (index>=0) {  
        url = url.substring(0, index);
    }
    url = url + "?" + param +"=" + value;
    window.location.href = url;
}