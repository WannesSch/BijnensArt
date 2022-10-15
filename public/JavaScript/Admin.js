var mouseX = null;
var mouseY = null;
    
document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);
    
function onMouseUpdate(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
}
class Year {
    constructor(year) {
        this.year = year;
        this.monthsArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0];
    }
}
class Controls {
    constructor() {
        this.selectedPage = "dashboard";
        this.cards = {
            kunstwerken : "preview",
            customers: "map"
        }
        this.visitorArr = [];
        this.paintingArr = [];
        this.visits = {
            vlaamsBrabant: 0,
            westVlaanderen: 0,
            oostVlaanderen: 0,
            brussel: 0,
            antwerpen: 0,
            limburg: 0,
            henegouwen: 0,
            luik: 0,
            luxemburg: 0,
            namen: 0,
            waalsBrabant: 0,
        }
        this.totalVisits = 0;
        this.yearArr = []
        this.TempFiles = [];
        this.currentSelected = null;
        this.currentOpenedPainting = {};
        this.editMode = false;
        this.chart = null;

        this.currentYear = 0;
    }
    FindPaintingById(id) {
        var painting = null;

        for (let i = 0; i<this.paintingArr.length; i++)
            if (this.paintingArr[i].id == id) painting = this.paintingArr[i];

        return painting;
    }
    InitData() {
        this.currentYear = new Date().getFullYear();
        $.post("/RESET", function(dataArr) {});
        $.post("/GETPaintings", function(dataArr) {
            dataArr.forEach(i => {controls.paintingArr.push(i);});
            controls.HandlePaintingTable();
            controls.HandlePreviews();
        });
        $.post("/GETVisits", function(dataArr) {
            dataArr.forEach(i => {controls.visitorArr.push(i);});
            controls.HandleMap();
            controls.HandleChart();
            controls.HandleVisitTable();
        });
        $.post("/GETAccounts", function(dataArr) {});
    }
    ToggleNavbar() {
        if ($('header').hasClass("toggle")) $('header').removeClass('toggle');
        else $('header').addClass('toggle'); 
    }
    SelectPage(button) {
        var id = button.getAttribute("id");

        $('#' + this.selectedPage + "Menu").css('display', 'none');
        $('#' + this.selectedPage).removeClass("selected");
        $('#' + id).addClass("selected");
        $('main .bar h1').html(capitalizeFirstLetter(id));
        this.selectedPage = id;
        $('#' + this.selectedPage + "Menu").css('display', 'flex');
    }
    SelectCard(button) {
        var id = button.getAttribute("id");
        var title = button.getAttribute("title");
        switch(title) {
            case "kunstwerken": {
                $('#' + this.cards.kunstwerken).removeClass("selected");
                this.OpenWindow(this.cards.kunstwerken, id);
                this.cards.kunstwerken = id;
                $('#' + this.cards.kunstwerken).addClass("selected");
            } break;
            case "bezoekers": {
                $('#' + this.cards.customers).removeClass("selected");
                this.OpenWindow(this.cards.customers, id);
                this.cards.customers = id;
                $('#' + this.cards.customers).addClass("selected");
            } break;
            
        }
    }
    OpenWindow(_old, _new) {
        $('.' + capitalizeFirstLetter(_old)).css('display', 'none');
        $('.' + capitalizeFirstLetter(_new)).css('display', 'flex');
    }
    OpenSubWindow(button) {
        var id = button.getAttribute('id').split("-")[1];
        var subWindow = button.getAttribute('id').split("-")[2];
        $('.card').css('cursor', 'progress');
        setTimeout(() => {
            $('#' + this.selectedPage + "Menu").css('display', 'none');
            $('#' + this.selectedPage).removeClass("selected");
            $('main .bar h1').html(capitalizeFirstLetter(id));
            this.selectedPage = id;
            $('#' + this.selectedPage + "Menu").css('display', 'flex'); 
            $('.card').css('cursor', 'pointer');
        }, 500);
        
        switch (subWindow) {
            case "preview": {
                $('.Preview').css('display', 'flex');
                $('.Add').css('display', 'none');
                $('.Table').css('display', 'none');
                $('#' + this.cards.kunstwerken).removeClass("selected");
                this.cards.kunstwerken = "preview";
                $('#' + this.cards.kunstwerken).addClass("selected");
            } break;
            case "table": {
                $('.Preview').css('display', 'none');
                $('.Add').css('display', 'none');
                $('.Table').css('display', 'flex');
                $('#' + this.cards.kunstwerken).removeClass("selected");
                this.cards.kunstwerken = "table";
                $('#' + this.cards.kunstwerken).addClass("selected");
            } break;
            case "chart": {
                $('.Map').css('display', 'none');
                $('.Chart').css('display', 'flex');
                $('#' + this.cards.customers).removeClass("selected");
                this.cards.customers = "chart";
                $('#' + this.cards.customers).addClass("selected");
            } break;
            case "null": break;
            case "add": {
                $('.Preview').css('display', 'none');
                $('.Add').css('display', 'flex');
                $('#' + this.cards.kunstwerken).removeClass("selected");
                this.cards.kunstwerken = "add";
                $('#' + this.cards.kunstwerken).addClass("selected");
            } break;
        }
    }
    OpenMenu(button, type) {
        var id = button.getAttribute("for").split("-")[1];
        var painting = this.FindPaintingById(id);
        $('.darkOverlay').css('display', 'flex');
        var fileDir = "../Images/Gallery/" + painting.title.replace(/ /g,'') + "-" + painting.id + "/"
        this.currentOpenedPainting = painting;
        if (type) {
            this.editMode = true;
            $('.editMenu').css('display', 'flex');
            $('.removeMenu').css('display', 'none');
            
            $('#EDIT_original img').attr("src", fileDir + "0.jpg");
            $('#EDIT_original .art-data h1').html(painting.title);
            $('#EDIT_original .art-data h2').html(painting.buystate);
            $('#EDIT_original .art-data h3').html(painting.description);

            $('.editMenu .imageWrapper').empty();
            for (let i = 0; i<painting.paintingamount; i++) {
                    var sb = "";
                    if (i != 0) {
                        sb += '<div class="Image" id="EDIT-' + i + '">';
                        sb += '<div class="removeImageBtn" parent="' + i + '" onclick="controls.RemoveEditImage(this)"></div>'
                    }
                    else sb += '<div class="Image selected" id="EDIT-' + i + '">';
                    sb += '</div>';   
        
                    $('.editMenu .imageWrapper').append(sb);
                    setTimeout(() => {
                        var url = "url(" + fileDir  + i + ".jpg)";
                        $('#EDIT-' + i).css('background-image', url);
                    }, 1000);
            }
            var sb = "";
            sb += '<label for="fileInput" class="ImageInput"></label>';
            sb += '<form id="ImageUploadForm" method="POST" action="/" enctype="multipart/form-data">';
            sb += '<input type="file" id="fileInput" name="Image" onchange="controls.HandleUpload(this)">';
            sb += '</form>';
            $('.editMenu .imageWrapper').prepend(sb);


            $('#EDIT_new img').attr("src", fileDir + "/0.jpg");
            $('#EDIT_new .art-data h1').html(painting.title);
            $('#EDIT_new .art-data h2').html(painting.buystate);
            $('#EDIT_new .art-data h3').html(painting.description);


            $('input[type=radio]').prop( "checked", false );
            $('.EDIT_' + painting.type).prop( "checked", true );
            
        }
        else if (!type) {
            $('.removeMenu').css('display', 'flex');
            $('.editMenu').css('display', 'none');
            $('.removeMenu .imageWrapper').empty();
            var date = new Date(painting.uploadDate);
            $('#REMOVE_Original img').attr("src", fileDir + "0.jpg");
            $('#REMOVE_Original .art-data h1').html(painting.title);
            $('#REMOVE_Original .art-data h2').html(painting.buystate);
            $('#REMOVE_Original .art-data h3').html(painting.description);

            $('#REMOVE_id').html(painting.id);
            $('#REMOVE_type').html(painting.type);
            $('#REMOVE_price').html(painting.price);
            $('#REMOVE_views').html(painting.views);
            $('#REMOVE_date').html(("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear());

            for (let i = 0; i<painting.paintingamount; i++) {
                    var sb = "";
                    if (i == 0) sb += '<div class="Image selected" id="REMOVE-' + i + '"></div>';
                    else sb += '<div class="Image" id="REMOVE-' + i + '"></div>';   
                    
        
                    $('.removeMenu .imageWrapper').append(sb);
                    setTimeout(() => {
                        var url = "url(" + fileDir + "/" + i + ".jpg)";
                        $('#REMOVE-' + i).css('background-image', url);
                    }, 1000);
            }
            

        }
    }
    CloseMenu() {
        $('.darkOverlay').css('display', 'none');
        $('.editMenu').css('display', 'none');
        $('.removeMenu').css('display', 'none');
        this.currentOpenedPainting = {};
        this.editMode = false;
        this.TempFiles = [];
        $.post("/RESET", function(dataArr) {});
        this.RefreshPaintings();
    }
    HandlePaintingTable() {
        var sortedArr = this.paintingArr.sort((a, b) => a.id - b.id);
        $('#artTable').empty();
        
        var sb = "";

        sb += "<tr><th>ID</th><th>Titel</th><th>Beschrijving</th><th>Type</th><th>Prijs</th>" +
        "<th>Buystate</th><th>views</th><th>Datum</th><th>Settings</th></tr>";

        for (let i = 0; i<sortedArr.length; i++) {
            
            var date = new Date(sortedArr[i].uploadDate);

            sb += '<tr id="Art-' + sortedArr[i].id + '">';
            sb += '<td>' + sortedArr[i].id + '</td>';
            sb += '<td>' + sortedArr[i].title + '</td>';
            sb += '<td>' + sortedArr[i].description + '</td>';
            sb += '<td>' + sortedArr[i].type + '</td>';
            sb += '<td>' + sortedArr[i].price + '</td>';
            sb += '<td>' + sortedArr[i].buystate + '</td>';
            sb += '<td>' + sortedArr[i].views + '</td>';
            sb += '<td>' + ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear() + '</td>';
            sb += '<td>';
            sb += '<img src="Images/Main/editIcon.png" alt="Kunstwerk Bewerken" for="art-' + sortedArr[i].id + '" onclick="controls.OpenMenu(this, true)">';
            sb += '<img src="Images/Main/removeIcon.png" alt="Kunstwerk verwijderen" for="art-' + sortedArr[i].id + '" onclick="controls.OpenMenu(this, false)">';
            sb += '</td>';
            sb += '</tr>';
            
            
        }         
        $('#artTable').append(sb);

        $('#table .data strong').html(this.paintingArr.length);
        $('#dashboard-kunstwerken-preview .data strong').html(this.paintingArr.length);

        var _sortedArr = this.paintingArr.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        $('#dashboardMenu .Window .paintingList .tableWrapper table').empty();

        var _sb = "";

        _sb += "<tr><th>Titel</th><th>Type</th><th>Prijs</th><th>Buystate</th><th>views</th><th>Datum</th></tr>"

        for (let i = 0; i<10; i++) {
            var date = new Date(_sortedArr[i].uploadDate);

            _sb += '<tr id="dashboard-' + _sortedArr[i].id  + '">';
            _sb += '<td>' + _sortedArr[i].title + '</td>';
            _sb += '<td>' + _sortedArr[i].type + '</td>';
            _sb += '<td>' + _sortedArr[i].price + '</td>';
            _sb += '<td>' + _sortedArr[i].buystate + '</td>';
            _sb += '<td>' + _sortedArr[i].views + '</td>';
            _sb += '<td>' + ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear() + '</td>';
            _sb += '</tr>';
            
        }  
        $('#dashboardMenu .Window .paintingList .tableWrapper table').append(_sb);

    }
    SearchArtTable() {
        $('#searchbar-table').on('input', function() {
            var currText = $('#searchbar-table').val();

            var table = document.getElementById('artTable');

            var foundIDS = [];
            currText = currText.toLowerCase();
            if (currText.includes(":")) {
                var searchKeyword = currText.split(":")[0];
                var searchString = currText.split(":")[1];
                var cellIndex = 0;
                for(var i=0; i<table.rows[0].cells.length; i++) {
                    if (table.rows[0].cells[i].innerHTML.toLowerCase().indexOf(searchKeyword) != -1) {cellIndex = i; break;}
                }
                for(var i=1; i<table.rows.length; i++) {
                    var row = table.rows[i];
                    var rowID = row.getAttribute("id");
                    if (row.cells[cellIndex].innerHTML.toLowerCase().indexOf(searchString) != -1) foundIDS.push(rowID);
                    else $('#' + rowID).hide();
                }
            }
            else {
                for(var i=1; i<table.rows.length; i++) {
                    var row = table.rows[i];
                    var rowID = row.getAttribute("id");
                    for(var y=0; y<row.cells.length; y++) {
                        var cell = row.cells[y];
    
                        if (cell.innerHTML.toLowerCase().indexOf(currText) != -1) foundIDS.push(rowID);
                        else $('#' + rowID).hide();
                    }
                }
            }

            for (let i = 0; i<foundIDS.length; i++) {
                $('#' + foundIDS[i]).show();
            }
        })
    }
    Logout(button) {
        var id = button.getAttribute("id");
        $('#' + id).addClass("selected");
        setTimeout(() => {window.location.href = "index.html";}, 1000); 
    }
    HandleUpload(button) {
        var files = button.files;
        const formData = new FormData();
        for(let i =0; i < files.length; i++) {
                formData.append("files", files[i]);
        }
        fetch("/UPLOADImage", {
            method: 'post',
            body: formData
        })
        .then((res) => {
            controls.RetrieveTempFiles().then(res => {controls.HandleTempFiles(res)});
        })
        .catch((err) => ("Error occured", err));
    }
    RetrieveTempFiles() {
        return new Promise((resolve, reject) => {
            $.post("/GETTempFiles",  (dataArr) => {
                resolve(dataArr)
            })
        })
    }
    HandleTempFiles(arr) {
        if (!this.editMode) {
            this.TempFiles = arr;
            this.currentSelected = null;
            this.TempFiles.forEach(file => {
                if (document.getElementById('IMG-' + file.id) != null) return;
                var sb = "";
                sb += '<div class="Image" id="IMG-' + file.id + '" onclick="controls.SelectFile(this)">';
                sb += '<div class="removeImageBtn" parent="' + file.id + '" onclick="controls.RemoveImage(this)"></div>'
                sb += '</div>';   
    
                $('.paintingWrapper').append(sb);
                setTimeout(() => {
                    var url = "url(../Images/TempFiles/" + file.Filename + ")";
                    $('#IMG-' + file.id).css('background-image', url);
                }, 1000);
                
            });
        }
        else {
            this.currentSelected = null;
            this.TempFiles = arr;
            this.TempFiles.forEach(file => {
                if (document.getElementById('EDIT-' + file.id) != null) return;
                var sb = "";
                sb += '<div class="Image" id="EDIT-' + file.id + '">';
                sb += '<div class="removeImageBtn" parent="' + file.id + '" onclick="controls.RemoveEditImage(this)"></div>'
                sb += '</div>';   
    
                $('.editMenu .imageWrapper').append(sb);
                setTimeout(() => {
                    var url = "url(../Images/TempFiles/" + file.Filename + ")";
                    $('#EDIT-' + file.id).css('background-image', url);
                }, 1000);
                
            });
        }
        
    }
    RemoveImage(button) {
        var id = button.getAttribute('parent');

        $.post("/REMOVEImage", {id: id}, function(data) {
            if (data == "ERROR") {controls.Message("Error! Interne server fout.", "#db4237"); return;}
            $('#IMG-' + id).remove();
            controls.TempFiles.splice(controls.TempFiles.indexOf(controls.FindTempFileById(id)), 1);
        });
    }
    Message(msg, color) {
        $('.Message').css('display', 'flex');
        $('.Message').css('background', color);
        $('.Message').html(msg);
        setTimeout(() => {
            $('.Message').css('display', 'none');
        }, 1000);
    }
    SaveImage() {
        var title = $('#titleInput').val();
        var desc = $('#descInput').val();
        var buystate = $('#buystateInput').val();
        var price = $('#priceInput').val();
        var type = $("input[type=radio]:checked").attr("class");  
        switch (type) {
            case "None": type = "Geen"; break;
            case "Painting": type = "Schilderij"; break;
            case "Sculpture": type = "Sculptuur"; break;
        }

        if (title == "") {this.Message('Error! geef een titel in.', "#db4237"); return;}
        if (desc == "") {this.Message('Error! geef een Beschrijving in.', "#db4237"); return;}
        if (buystate == "") {this.Message('Error! geef een verkoop status in.', "#db4237"); return;}
        if (price == "") {this.Message('Error! geef een prijs in.', "#db4237"); return;}
        if (type == "Geen") {this.Message('Error! Kies het type.', "#db4237"); return;}
        if ($('.paintingWrapper > div').length == 0) {this.Message('Error! Upload eerst (een) schilderij(en).', "#db4237"); return;}
        if (this.currentSelected == null) {this.Message('Error! Selecteer een hoofd-kunstwerk.', "#db4237"); return;}

        this.EmptyAddInput();

        var actualId = 1;
        for (let i = 0; i<this.TempFiles.length; i++)
            if (this.TempFiles[i].actualID != 0) {this.TempFiles[i].actualID = actualId; actualId++}


        $.post("/ADDPainting", {dataArr: [title, desc, type, price, buystate, controls.TempFiles]}, function(data) {
            if (data == "ERROR") {controls.Message("Error! Interne server fout.", "#db4237"); return;}
            if (data == "SUCCES") {controls.Message("Success! Kunstwerk werd geüpload.", "#29962a"); controls.RefreshPaintings(); return;}
        });
    }
    EmptyAddInput() {
        $('#titleInput').val("");
        $('#descInput').val("");
        $('#buystateInput').val("");
        $('#priceInput').val("");
        $(".None").prop('checked', true);
        $(".Paintings").prop('checked', false);
        $(".Sculptures").prop('checked', false);

        $('.paintingWrapper').empty();

        var sb = "";
        sb += '<label for="fileInput" class="ImageInput"></label>';
        sb += '<form id="ImageUploadForm" method="POST" action="/UPLOADImage" enctype="multipart/form-data">';
        sb += '<input type="file" id="fileInput" name="Image" onchange="controls.HandleUpload(this)">';
        sb += '</form>';

        $('.paintingWrapper').append(sb);
    }
    FindTempFileById(id) {
        var file = null;

        for (let i = 0; i<this.TempFiles.length; i++)
            if (this.TempFiles[i].id == id) file = this.TempFiles[i]

        return file;
    }
    SelectFile(button) {
        var id = button.getAttribute('id').split("-")[1];
        if(this.currentSelected != null) {
            this.currentSelected.style.border = "2px solid var(--mainColor)";

            for (let i = 0; i<this.TempFiles.length; i++)
                if (this.TempFiles[i].actualID == 0) this.TempFiles[i].actualID = null;
        }
        this.currentSelected = button;
        this.currentSelected.style.border = "2px solid var(--accentColor)";
        this.FindTempFileById(id).actualID = 0;
    }
    EditInputChange(button) {
        var id = button.getAttribute("id");

        switch (id) {
            case "EdittitleInput": {
                $('#EDIT_new .art-data h1').html(button.value);
                if (!button.value) $('#EDIT_new .art-data h1').html(this.currentOpenedPainting.title);
            } break;
            case "EditdescInput":{
                $('#EDIT_new .art-data h3').html(button.value);
                if (!button.value) $('#EDIT_new .art-data h2').html(this.currentOpenedPainting.buystate);
            } break;
            case "EdittypeInput": {
                $('#EDIT_new .art-data h2').html(button.value);
                if (!button.value) $('#EDIT_new .art-data h3').html(this.currentOpenedPainting.description);
            } break;
        }
    }
    HandlePreviews() {
        var sortedArr = this.paintingArr.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        for (let i = 0; i<3; i++) {
            $('#preview-' + i + " .art-data h1").html(sortedArr[i].title);
            $('#preview-' + i + " .art-data h2").html(sortedArr[i].buystate);
            $('#preview-' + i + " .art-data h3").html(sortedArr[i].description);
            setTimeout(() => {
                var path = "../Images/Gallery/" + sortedArr[i].title.replace(/ /g,'') + "-" + sortedArr[i].id + "/0.jpg"
                $('#preview-' + i + " img").attr("src", path);
            }, 1000);
        }
        var path = "../Images/Gallery/" + sortedArr[0].title.replace(/ /g,'') + "-" + sortedArr[0].id + "/0.jpg"
        $('.lastPainting .art-item img').attr("src", path);
        $('.lastPainting .art-item h1').html(sortedArr[0].title);
        $('.lastPainting .art-item h2').html(sortedArr[0].buystate);
        $('.lastPainting .art-item h3').html(sortedArr[0].description);
    }
    SearchPreview() {
        $("#searchbar-preview").on('keyup', function (e) {
            var sortedArr = controls.paintingArr.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            if (e.key === 'Enter' || e.keyCode === 13) {
                var currText = $('#searchbar-preview').val();
                var foundPaintings = [];

                for (let i = 0; i<sortedArr.length; i++) {
                    if (sortedArr[i].title.toLowerCase().indexOf(currText) >= 0) foundPaintings.push(sortedArr[i])
                }

                var cutArr = [], i = 0, n = foundPaintings.length;
                while (i < n) {
                    cutArr.push(foundPaintings.slice(i, i += 3));
                }

                if (cutArr[0].length < 3) {
                    var _foundPaintings = [];

                    for (let i = 0; i<sortedArr.length; i++) {
                        for (let j = 0; j<cutArr[0].length; j++) {
                            if (sortedArr[i].title != cutArr[0][j].title) _foundPaintings.push(sortedArr[i]);
                        }
                    }
                }

                for (let i = 0; i<cutArr[0].length; i++) {
                    $('#preview-' + i + " .art-data h1").html(cutArr[0][i].title);
                    $('#preview-' + i + " .art-data h2").html(cutArr[0][i].buystate);
                    $('#preview-' + i + " .art-data h3").html(cutArr[0][i].description);
                    var path = "../Images/Gallery/" + cutArr[0][i].title.replace(/ /g,'') + "-" + cutArr[0][i].id + "/0.jpg"
                    $('#preview-' + i + " img").attr("src", path);
                }
            }
        });
    }
    RemovePainting() {
        $.post('/REMOVEPainting', {id: this.currentOpenedPainting.id}, (res) => {
            if (res == "SUCCESS") {
                controls.Message("Kunstwerk werd succesvol verwijderd.", "GREEN");
                controls.CloseMenu();
                controls.RefreshPaintings();
            }
        })
    }
    RefreshPaintings() {
        $.post('/REFRESHPaintings', (dataArr) => {
            controls.paintingArr = [];
            dataArr.forEach(item => {controls.paintingArr.push(item);})
            setTimeout(() => {
                controls.HandlePaintingTable();
                controls.HandlePreviews();
            }, 500);
            
        })
    }
    EditImage() {
        var title = $('#EdittitleInput').val();
        var desc = $('#EditdescInput').val();
        var buystate = $('#EdittypeInput').val();
        var price = $('#EditpriceInput').val();
        var type = $("input[type=radio]:checked").attr("class");  

        type = type.split("_")[1];

        if (title != "") this.currentOpenedPainting.title = title;
        if (desc != "") this.currentOpenedPainting.description = desc;
        if (buystate != "") this.currentOpenedPainting.buystate = buystate;
        if (price != "") this.currentOpenedPainting.price = price;
        if (type == "None") {this.Message('Error! Kies het type.', "#db4237"); return;}
        if ($('.editMenu .imageWrapper > div').length == 0) {this.Message('Error! Upload eerst (een) schilderij(en).', "#db4237"); return;}
        this.currentOpenedPainting.type = type;

        $.post('/EDITPainting', {painting: controls.currentOpenedPainting}, (data) => {
                if (data == "SUCCESS") {
                    controls.TempFiles = [];
                    $('#EdittitleInput').val("");
                    $('#EditdescInput').val("");
                    $('#EdittypeInput').val("");
                    $('#EditpriceInput').val("");
                    controls.Message('Dit kunstwerk is succesvol aangepast.', 'GREEN');
                    controls.CloseMenu();
                    controls.RefreshPaintings();
                }
        })
    }
    RemoveEditImage(button) {
        var id = button.getAttribute("parent");
        
        if (isNaN(id)) {
            $.post("/REMOVEImage", {id: id}, function(data) {
                if (data == "ERROR") {controls.Message("Error! Interne server fout.", "#db4237"); return;}
                $('#EDIT-' + id).remove();
                controls.TempFiles.splice(controls.TempFiles.indexOf(controls.FindTempFileById(id)), 1);
            });
        }
        else {
            $.post('/REMOVEEditImage', {painting: controls.currentOpenedPainting, imageId: id}, (data) => {
                if (data == "ERROR") {controls.Message("Error! Interne server fout.", "#db4237"); return;}
                if (data == "SUCCES") {
                    $('#EDIT-' + id).remove(); 
                    controls.RefreshPaintings()
                }
            })
        }
    }
    HandleVisitTable() {
        let id = 0;
        for (let visit of this.visitorArr) {
            var sb = `
                <tr id="${id}">
                <td>${visit.country}</td>
                <td>${visit.city}</td>
                <td>${visit.visitDate}</td>
                <td>${visit.ip}</td>
                </tr>
            `;

            $('#ipTable').append(sb);
            id++;
        }         
        
        $('#ips .data strong').html(this.visitorArr.length);
    }
    InitMap() {
        var countries = document.querySelectorAll('.Map__BE');
        countries.forEach(country => {
            var id = country.getAttribute("id");
            id = id.replace("_", " ");
            

            country.addEventListener("mouseover", function () {
                $(this).css({
                    "fill" :　"#2e284f",
                    "cursor" : "pointer"
                });

                var visits = controls.GetVisitorsOfProvinceName(id);
                console.log(id)
                setTimeout(() => {
                    $('.infobox h1').html(id);
                    $('.infobox #visists').html(visits);
                    $('.infobox #totalvisists').html(controls.totalVisits);

                    $('.infobox').css({
                        'display': 'flex',
                        'top': mouseY + 'px',
                        'left': mouseX + 'px'
                    });
                }, 1);
                
            });
            country.addEventListener("mouseleave", function () {
                $(this).css({
                    "fill" :　"#17161d",
                });
                $('.infobox').css('display', 'none');
            });

            
        });
    }
    SearchIPTable() {
        $('#searchbar-ip').on('input', function() {
            var currText = $('#searchbar-ip').val();

            var table = document.getElementById('ipTable');

            var foundIDS = [];
            currText = currText.toLowerCase();
            if (currText == "belgi" || currText == "belgie") currText = "belgië";

            for(var i=1; i<table.rows.length; i++) {
                var row = table.rows[i];
                var rowID = row.getAttribute("id");
                for(var y=0; y<row.cells.length; y++) {
                    var cell = row.cells[y];

                    if (cell.innerHTML.toLowerCase().indexOf(currText) != -1) foundIDS.push(rowID);
                    else $('#' + rowID).hide();
                }
            }

            for (let i = 0; i<foundIDS.length; i++) {
                $('#' + foundIDS[i]).show();
            }
        })
    }
    GetVisitorsOfProvinceName(name) {
        var visits = [];
        switch(name) {
            case "Vlaams Brabant": visits = this.visits.vlaamsBrabant; break;
            case "West Vlaanderen": visits = this.visits.westVlaanderen; break;
            case "Oost Vlaanderen": visits = this.visits.oostVlaanderen; break;
            case "Antwerpen": visits = this.visits.antwerpen; break;
            case "Limburg": visits = this.visits.limburg; break;
            case "Henegouwen": visits = this.visits.henegouwen; break;
            case "Luik": visits = this.visits.luik; break;
            case "Luxemburg": visits = this.visits.luxemburg; break;
            case "Namen": visits = this.visits.namen; break;
            case "Waals Brabant": visits = this.visits.waalsBrabant; break;
        }  
        return visits;
    }
    HandleRegions() {
        var regions = 0;

        if (this.visits.vlaamsBrabant > 0) regions++;
        if (this.visits.westVlaanderen > 0) regions++;
        if (this.visits.oostVlaanderen > 0) regions++;
        if (this.visits.brussel > 0) regions++;
        if (this.visits.antwerpen > 0) regions++;
        if (this.visits.limburg > 0) regions++;
        if (this.visits.henegouwen > 0) regions++;
        if (this.visits.luik > 0) regions++;
        if (this.visits.luxemburg > 0) regions++;
        if (this.visits.namen > 0) regions++;
        if (this.visits.waalsBrabant > 0) regions++;

        return regions;
    }
    HandleMap() {
        for (let visit of this.visitorArr) {
            if (visit.country != "België" && visit.country != "Belgium") continue;
            this.totalVisits++;

            switch(visit.state) {
                case "Vlaams-Brabant": this.visits.vlaamsBrabant++; break;
                case "West-Vlaanderen": this.visits.westVlaanderen++; break;    
                case "Oost-Vlaanderen": this.visits.oostVlaanderen++; break;
                case "Brussel": this.visits.vlaamsBrabant++; break;
                case "Antwerpen": this.visits.antwerpen++; break;
                case "Limburg": this.visits.limburg++; break;
                case "Henegouwen": this.visits.henegouwen++; break;
                case "Luik": this.visits.luik++; break;
                case "Luxemburg": this.visits.luxemburg++; break;
                case "Namen": this.visits.namen++; break;
                case "Waals-Brabant": this.visits.waalsBrabant++; break;
            }
        }
        
        $('#map .data strong').html(this.HandleRegions())
    }   
    HandleChart() {
        let year = new Year(this.currentYear);

        for (let visit of this.visitorArr) {
            let date = visit.visitDate.split("-");
            if (date[1] != year.year) continue;
            year.monthsArr[date[0]-=1]++;
        }
        this.DrawChart(year.monthsArr, year.year);
        $('#chart .data strong').html(this.totalVisits);
        $('#dashboard-bezoekers-chart .data strong').html(this.totalVisits);
    }
    GetYear(year) {
        var _year = null;
        for (let i = 0; i<this.yearArr.length; i++)
            if (this.yearArr[i].year == year) _year = this.yearArr[i];

        if (_year == null) {_year = new Year(year); this.yearArr.push(_year); return _year;}

        return _year;
    }
    DrawChart(arr, year) {
        var canvas = document.getElementById("chartCanvas")
        $(canvas).empty();
        var ctx = canvas.getContext('2d');
        if (this.chart != null) this.chart.destroy();
		this.chart = new Chart(ctx, {
			type: 'bar',
			data: {
			    labels: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"],
			    datasets: [{
			        label: 'Aantal Bezoeken per maand in ' + year,
			        backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(217, 0, 195, 0.2)',
                        'rgba(13, 2, 61, 0.2)',
                        'rgba(0, 0, 0, 0.2)',
                        'rgba(70, 191, 0, 0.2)',
                        'rgba(87, 63, 35, 0.3)',
                        'rgba(59, 3, 3, 0.3)'
                    ],
			        borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(274, 0, 66, 1)',
                        'rgba(13, 2, 61, 1)',
                        'rgba(0, 0, 0, 1)',
                        'rgba(70, 191, 0, 1)',
                        'rgba(87, 63, 35, 1)',
                        'rgba(59, 3, 3, 1)'
                    ],
                    borderWidth: 1,
                    barPercentage: 0.5,
                    barThickness: 6,
                    maxBarThickness: 8,
                    minBarLength: 2,
			        data: [arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6],arr[7],arr[8],arr[9],arr[10],arr[11]]
			    }]
			},
            options: {
                scales: {
                    xAxes: [{
                        gridLines: {
                            offsetGridLines: true
                        }
                    }],
                    yAxes: [{
                        ticks: {
                        beginAtZero: true
                        }
                    }]
                }
            }
		});
    }
    ChangeYear(amount) { 
        this.currentYear += amount; 
        this.HandleChart();
    }
}

var controls = new Controls();

$(document).ready(() => {
    controls.InitMap();      

    controls.SearchIPTable();
    controls.SearchArtTable();
    controls.SearchPreview();

    var username = null;
    var key = null;
    try {
        username = window.location.href.split("?")[1].split("=")[1];
        key = window.location.href.split("?")[2].split("=")[1];

    } catch {window.location.href = "../index.html?Login=Failed";}

    if (username != null && key != null) {
        $.post("/CheckAdmin", {dataArr: [username, key]}, function(data) {
            if (data == "SUCCESS") {controls.InitData(); return;}
            if (data == "ERROR") window.location.href = "../index.html?Login=Failed";
        });
    }

})

function capitalizeFirstLetter(string) {return string.charAt(0).toUpperCase() + string.slice(1);}