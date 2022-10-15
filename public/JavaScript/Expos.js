$.post("/GetAllExpos", function(data) {

    data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

    for (let expo of data) {
        let html = `
        <section class="expandableMenu">
            <div class="bar">
                <h2>${expo.title}</h2>
                <span>&#x2771;</span>
            </div>
            <div class="dropdown gallery">`
                for(let file of expo.files) {
                    let ext = file.split('.')[1]
                    if (ext == "jpeg" || ext == "jpg" || ext == "png") html += `<img src="./Images/Expos/${expo.title}/${file}">`;
                    if (ext == "mp4") html += `
                    <video autoplay muted loop>
                        <source src="./Images/Expos/${expo.title}/${file}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video> 
                    `;
                    
                }
        html += `</div>
        </section>`

        $('.expowrapper').append(html);
    }
});

$(document).ready(() => {
    setTimeout(() => {
        $('section[class^=expandableMenu]').each((index, ele) => { 
            $(ele).click(() => { 
                if ($(ele).hasClass("toggle")) $(ele).removeClass('toggle');
                else $(ele).addClass('toggle');
            })
        })
    }, 1000);
})