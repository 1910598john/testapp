var hidden = false;
var db;
var currentPerson;
if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
} else {
    // Open (or create) the database
    let request = indexedDB.open("database", 1);
    request.onerror = function(event) {
        console.log("Error opening/creating database:", event);
    };

    request.onsuccess = function(event) {
        console.log("Database opened successfully");
        db = event.target.result;

        let peopleContainer = document.getElementById("people-container");

        let transaction = db.transaction(["people"], "readonly");
        let objectStore = transaction.objectStore("people");

        let request = objectStore.getAll();
        request.onsuccess = function(event) {
            console.log("Data retrieved successfully:", event.target.result);
            let content = "";
            let people = event.target.result;
            // Do something with the retrieved data
            people.forEach(person => {
                let p = JSON.stringify(person);
                content += `
                <div data-person="${person.id}" data-name="${person.name}" data-src="${person.src}" data-age="${person.age}" data-address="${person.address}" data-p='${p}'>
                    <img src="${person.src}" style="width:100%;height:100%;object-fit:cover;"/>
                </div>`;
            });
            peopleContainer.insertAdjacentHTML("afterbegin", `${content}`);
            $(".people-container > div").click(function(event){
                event.stopImmediatePropagation();
                $("#chat").html("");
                currentPerson = $(this).data("p");
                let name = $(this).data("name");
                let src = $(this).data("src");
                $("#someone-name").html(name);
                $("#someone-img img").attr("src", src);

                $(".side-bar").animate({
                    "left" : "-80%"
                }, 500);
                $(".open-side-bar").html(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>`);
                $(".open-side-bar").css("right", "-40px");
                hidden = true;

                let transaction = db.transaction(["chat"], "readonly");
                let objectStore = transaction.objectStore("chat");
                let chatContainer = document.getElementById("chat");
                    
                let request = objectStore.getAll();
                request.onsuccess = function(event) {
                    let chats = event.target.result;
                    chats.forEach(chat => {
                        if (chat.person == currentPerson.id) {
                            //console.log(chat.id + " " + chat.chat);
                            if (chat.type == 'text' && chat.sent == 0) {
                                if (chat.chat != '') {
                                    chatContainer.insertAdjacentHTML("beforeend", `
                                    <div style="display:flex;justify-content:end;width:100%;padding:1px 10px 2px;">
                                        <div style="padding:5px 10px;border-radius:15px;background:#0084ff;color:#fff;max-width:50%;word-wrap:break-word;">${chat.chat}</div>
                                    </div>`);
                                }
                            }

                            if (chat.type == 'text' && chat.sent == 1) {
                                if (chat.chat != '') {
                                    chatContainer.insertAdjacentHTML("beforeend", `
                                    <div style="display:flex;justify-content:start;width:100%;padding:1px 10px 2px;">
                                        <div style="padding:10px;border-radius:15px;background:#f0f2f5;color:#000;max-width:60%;word-wrap:break-word;">
                                            ${chat.chat}
                                        </div>
                                    </div>`);
                                }
                            }
                            
                            if (chat.type == 'file' && chat.sent == 1) {
                                let file = "";
                                if (chat.file_type == 'video') {
                                    file += `
                                    <video style="width:100%;height:100%;object-fit:cover;">
                                        <source src="${chat.chat}" type="video/mp4">
                                    </video>`;

                                    chatContainer.insertAdjacentHTML("beforeend", `
                                    <div style="display:flex;justify-content:start;width:100%;padding:1px 10px 2px;">
                                        <div style="border-radius:15px;max-width:60%;overflow:hidden;position:relative">
                                            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="#fff" class="bi bi-play-circle-fill" viewBox="0 0 16 16">
                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>
                                                </svg>
                                            </div>
                                            ${file}
                                        </div>
                                    </div>`);
                                } else if (chat.file_type == 'image') {
                                    file += `
                                    <img src="${chat.chat}" style="width:100%;height:100%;object-fit:cover;"/>`;

                                    chatContainer.insertAdjacentHTML("beforeend", `
                                    <div style="display:flex;justify-content:start;width:100%;padding:1px 10px 2px;">
                                        <div style="border-radius:15px;max-width:60%;overflow:hidden;position:relative">
                                            ${file}
                                        </div>
                                    </div>`);
                                }
                            }
                        }
                    })

                    const container = document.getElementById('chat'); // Replace with your container's ID or selector
                    container.scrollTop = container.scrollHeight;

                    $(".chat video").click(function(event){
                        event.stopImmediatePropagation();
                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="file-viewer" id="fv">
                            
                        </div>
                        `);

                        $(this).clone().appendTo("#fv");
                        $("#fv video").css({
                            "width" : "100vw",
                            "object-fit" : "contain",
                            "z-index" : "-1"
                        })

                        $("#fv video").attr("autoplay", true);
                        $("#fv video").attr("controls", true);

                        $(window).on("hashchange", function(event){
                            $("#fv").remove();
                        })
                    })

                    $(".chat img").click(function(event){
                        event.stopImmediatePropagation();
                        document.body.insertAdjacentHTML("afterbegin", `
                        <div class="file-viewer" id="fv"></div>`);

                        $(this).clone().appendTo("#fv");
                        $("#fv img").css({
                            "width" : "100vw",
                            "object-fit" : "contain",
                            "z-index" : "-1"
                        })

                     

                        $(window).on("hashchange", function(event){
                            $("#fv").remove();
                        })

                        
                    })
                }

            })
        };
    };

    request.onupgradeneeded = function(event) {
        let db = event.target.result;
        // Create an object store if it doesn't already exist
        if (!db.objectStoreNames.contains("people")) {
            let objectStore = db.createObjectStore("people", { keyPath: "id", autoIncrement: true });
            // Optional: Create an index to search customers by name
            //objectStore.createIndex("name", "name", { unique: false });
        }
        if (!db.objectStoreNames.contains("photos")) {
            let objectStore = db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("personIndex", "person", { unique: false });
            // Optional: Create an index to search customers by name
            //objectStore.createIndex("name", "name", { unique: false });
        }
        if (!db.objectStoreNames.contains("videos")) {
            let objectStore = db.createObjectStore("videos", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("personIndex", "person", { unique: false });
            // Optional: Create an index to search customers by name
            //objectStore.createIndex("name", "name", { unique: false });
        }
        if (!db.objectStoreNames.contains("scripts")) {
            let objectStore = db.createObjectStore("scripts", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("personIndex", "person", { unique: false });
            // Optional: Create an index to search customers by name
            //objectStore.createIndex("name", "name", { unique: false });
        }
        if (!db.objectStoreNames.contains("chat")) {
            let objectStore = db.createObjectStore("chat", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("personIndex", "person", { unique: false });
            // Optional: Create an index to search customers by name
            //objectStore.createIndex("name", "name", { unique: false });
        }
    };
}

$(".visit-profile").click(function(event){
    event.stopImmediatePropagation();
    try {
        viewProfile(currentPerson.id, currentPerson.src);
    } catch (err) {
        notif("You haven't selected anyone yet.");
    }
})

function addScript(id, userInput, textReply, fileSrc, fileType, sec) {
  
    let transaction = db.transaction(["scripts"], "readwrite");
    let objectStore = transaction.objectStore("scripts");

    let obj = {person: id, input: userInput, text_reply: textReply, file_reply: fileSrc, file_type: fileType, typing: sec};
    let request = objectStore.add(obj);
    
    request.onsuccess = function(event) {
        console.log("Data added successfully:", obj);
        notif("Script added!");
    };

    request.onerror = function(event) {
        console.log("Error adding data:", event);
    };
}

$(".user-input button").click(function(event){
    event.stopImmediatePropagation();
    let userInput = $("input#user-input").val();
    try {
        if (currentPerson.id) {
            let chatContainer = document.getElementById("chat");

            if (userInput != '') {
                $("input#user-input").val("");
                chatContainer.insertAdjacentHTML("beforeend", `
                <div style="display:flex;justify-content:end;width:100%;padding:1px 10px 2px;">
                    <div style="padding:5px 10px;border-radius:15px;background:#0084ff;color:#fff;max-width:50%;word-wrap:break-word;">${userInput}</div>
                </div>`);

                let transaction = db.transaction(["chat"], "readwrite");
                let objectStore2 = transaction.objectStore("chat");


                let obj = {person: currentPerson.id, sent: 0, chat: userInput, type: 'text'};
                
                let request = objectStore2.add(obj);
            
                request.onsuccess = function(event) {
                    console.log("Data added successfully:", obj);
                };

                const container = document.getElementById('chat'); // Replace with your container's ID or selector
                container.scrollTop = container.scrollHeight;
               
            }

            let transaction = db.transaction(["scripts"], "readonly");
            let objectStore = transaction.objectStore("scripts");
            let request = objectStore.getAll();
            request.onsuccess = function(event) {
                let scripts = event.target.result;
                scripts.forEach(script => {
                    if (script.person == currentPerson.id && userInput.includes(script.input)) {
                        let sec = 0;
                        if (script.typing != '') {
                            sec = parseInt(script.typing) * 1000;
                        } else {
                            sec = 1000;
                        }

                        setTimeout(() => {
                            chatContainer.insertAdjacentHTML("beforeend", `
                            <div id="typing" style="display:flex;justify-content:start;width:100%;padding:1px 10px 2px;">
                                <div style="padding:13px;border-radius:15px;background:#f0f2f5;color:#000;max-width:60%;word-wrap:break-word;display:flex;">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>`);

                            const container = document.getElementById('chat'); // Replace with your container's ID or selector
                            container.scrollTop = container.scrollHeight;

                            setTimeout(() => {
                                $("#typing").remove();
                                if (script.text_reply != "") {
                                    chatContainer.insertAdjacentHTML("beforeend", `
                                    <div style="display:flex;justify-content:start;width:100%;padding:1px 10px 2px;">
                                        <div style="padding:10px;border-radius:15px;background:#f0f2f5;color:#000;max-width:60%;word-wrap:break-word;">
                                            ${script.text_reply}
                                        </div>
                                    </div>`);

                                    const container = document.getElementById('chat'); // Replace with your container's ID or selector
                                    container.scrollTop = container.scrollHeight;
                                }

                                let transaction = db.transaction(["chat"], "readwrite");
                                let objectStore2 = transaction.objectStore("chat");

                                let obj = {person: currentPerson.id, sent: 1, chat: script.text_reply, type: 'text'};
                                
                                
                                let request = objectStore2.add(obj);
                            
                                request.onsuccess = function(event) {
                                    console.log("Data added successfully:", obj);
                                };
                                
                                let file = "";
                                if (script.file_reply != '') {
                                    let type = script.file_type;
                                    if (type == 'image') {
                                        file += `
                                        <img src="${script.file_reply}" style="width:100%;height:100%;object-fit:cover;"/>`;

                                        chatContainer.insertAdjacentHTML("beforeend", `
                                        <div style="display:flex;justify-content:start;width:100%;padding:1px 10px 2px;">
                                            <div style="border-radius:15px;max-width:60%;overflow:hidden;position:relative">
                                                
                                                ${file}
                                            </div>
                                        </div>`);

                                        const container = document.getElementById('chat'); // Replace with your container's ID or selector
                                        container.scrollTop = container.scrollHeight;

                                        $(".chat img").click(function(event){
                                            event.stopImmediatePropagation();
                                            document.body.insertAdjacentHTML("afterbegin", `
                                            <div class="file-viewer" id="fv">
                                                
                                            </div>
                                            `);

                                            $(this).clone().appendTo("#fv");
                                            $("#fv img").css({
                                                "width" : "100vw",
                                                "object-fit" : "contain",
                                                "z-index" : "-1"
                                            })

                                            $(window).on("hashchange", function(event){
                                                $("#fv").remove();
                                            })

                                 
                                        })

                                    } else if (type == 'video') {
                                        file += `
                                        <video style="width:100%;height:100%;object-fit:cover;">
                                            <source src="${script.file_reply}" type="video/mp4">
                                        </video>`;

                                        chatContainer.insertAdjacentHTML("beforeend", `
                                        <div style="display:flex;justify-content:start;width:100%;padding:1px 10px 2px;">
                                            <div style="border-radius:15px;max-width:60%;overflow:hidden;position:relative">
                                                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="#fff" class="bi bi-play-circle-fill" viewBox="0 0 16 16">
                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>
                                                    </svg>
                                                </div>
                                                ${file}
                                            </div>
                                        </div>`);

                                        const container = document.getElementById('chat'); // Replace with your container's ID or selector
                                        container.scrollTop = container.scrollHeight;

                                        $(".chat video").click(function(event){
                                            event.stopImmediatePropagation();
                                            document.body.insertAdjacentHTML("afterbegin", `
                                            <div class="file-viewer" id="fv">
                                            </div>`);

                                            $(this).clone().appendTo("#fv");
                                            $("#fv video").css({
                                                "width" : "100vw",
                                                "object-fit" : "contain",
                                                "z-index" : "-1"
                                            })

                                            $("#fv video").attr("autoplay", true);
                                            $("#fv video").attr("controls", true);

                                            $(window).on("hashchange", function(event){
                                                $("#fv").remove();
                                            })

                                        })
                                    }
                                    

                                    let obj = {person: currentPerson.id, sent: 1, chat: script.file_reply, type: 'file', file_type: type};
                                    let request = objectStore2.add(obj);
                                    
                                    request.onsuccess = function(event) {
                                        console.log("Data added successfully:", obj);
                                    };
                                }

                            }, sec)

                           

                        }, 1000);

                        
                        
                    }
                })
            }
        }
        
    } catch(err) {
        console.log(err);
    }
})



function notif(msg) {
    document.body.insertAdjacentHTML("afterbegin", `
    <div class="notification">
        <div>
            <p>${msg}</p>
            <button>OK</button>
        </div>
        
    </div>`);

    $("button").click(function(event){
        event.stopImmediatePropagation();
        $(".notification").remove();
    })
}

function addScripts(id) {
  
    let fileSrc;
    let fileType;
    document.body.insertAdjacentHTML("afterbegin", `
    <div class="script-window">
        <button class="cancel" style="position:absolute;left:5px;top:5px;">Back</button>
        <div class="form">
            <div style="border-bottom:1px solid rgba(0,0,0,0.1);margin-bottom:20px;padding:20px;font-size:20px;text-align:center;display:flex;flex-direction:column;">
                Add Script
                <a style="color:blue;font-size:15px;">View scripts</a>
            </div>
            Your message includes:
            <input type="text" placeholder="Enter input" id="user-input"/>
            ${currentPerson.name} text reply:
            <input type="text" placeholder="Enter reply" id="person-reply"/>
            ${currentPerson.name} image/video reply:
            <input type="file"/>
            ${currentPerson.name} typing delay:
            <input type="number" placeholder="Enter seconds" id="sec"/>
        </div>
        <button class="add-script" style="width:90%;position:absolute;left:50%;bottom:10px;transform:translateX(-50%);">Add Script</button>
    </div>`);

    $("input[type='file']").on('change', function(event) {
        let file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                let imageSrc = e.target.result;
                fileSrc = imageSrc;

                if (file.type.startsWith('image/')) {
                    fileType = 'image';
                } else if (file.type.startsWith('video/')) {
                    fileType = 'video';
                }
            };

            reader.readAsDataURL(file);
        }
    });

    $(".add-script").click(function(event){
        event.stopImmediatePropagation();
        let userInput = $("#user-input").val();
        let textReply = $("#person-reply").val();
        let sec = $("#sec").val();
        addScript(id, userInput, textReply, fileSrc, fileType, sec);
    })

    $(".cancel").click(function(event){
        event.stopImmediatePropagation();
        $(".script-window").remove();
    })
}

$(".add-scripts").click(function(event){
    try {
        if (currentPerson.id != 'undefined' || currentPerson.id != null) {
            
            addScripts(currentPerson.id);
        }
        else {
            notif("You haven't selected anyone yet.");
        }
    } catch (err) {
        console.log(err);
    }
})

$(".open-side-bar").click(function(event){
    event.stopImmediatePropagation();
    if (!hidden) {
        $(".side-bar").animate({
            "left" : "-80%"
        }, 500);
        $(this).html(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
        <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
      </svg>`);
      $(".open-side-bar").css("right", "-40px");
        hidden = true;
    } else {
        $(".side-bar").animate({
            "left" : "0%"
        }, 500);
        $(this).html(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-box-arrow-left" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
        <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
    </svg>`);
        $(".open-side-bar").css("right", "20px");
        hidden = false;
    }
})

$(".chat-header svg").click(function(event){
    event.stopImmediatePropagation();
})

function viewProfile(id, src) {

    if (id == 'undefined' || id == null) {
        notif("You haven't selected anyone yet.");
    } else {
        document.body.insertAdjacentHTML("afterbegin", `
            <div class="profile-window">
                <button class="go-back" style="position:absolute;left:5px;top:5px;">Back</button>
                
                <div style="border-bottom:3px solid rgba(0,0,0,0.1);padding:20px;font-size:15px;font-weight:bold;text-align:center;display:flex;flex-direction:column;align-items:center;">
                    <div style="width: 70px;height: 70px;border-radius: 50%;box-shadow: 0 0 2px #000;margin-right: 5px;overflow:hidden;margin-bottom:10px;">
                        <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
                    </div>
                    ${currentPerson.name}
                </div>
                <div class="profile-buttons">
                    <div class="photos active">Photos</div>
                    <div class="videos">Videos</div>
                </div>
                <div class="profile-content" id="profile-content">
                    
                </div>
            </div>`);
        
            let container = document.getElementById("profile-content");
            let transaction = db.transaction(["photos"], "readonly");
            let objectStore = transaction.objectStore("photos");
        
            let request = objectStore.getAll();
            
            request.onsuccess = function(event) {
                let photos = event.target.result;
                let content = "";
                photos.forEach(photo => {
                    if (photo.person == id) {
                        content += `
                        <div data-person="${photo.person}" data-id="${photo.id}">
                            <img src="${photo.src}" style="width:100%;height:100%;object-fit:cover;"/>
                        </div>`;
                    }
                })
                
                container.innerHTML = "";
                container.insertAdjacentHTML("afterbegin", `${content}`);
                
                $(".profile-content > div").click(function(event){
                    event.stopImmediatePropagation();
                    alert($(this).children());
                })
            };
        
            $(".profile-buttons > div").click(function(event){
                event.stopImmediatePropagation();
                $(".profile-buttons > div").removeClass("active");
                $(this).addClass("active");
                let container = document.getElementById("profile-content");
        
                if ($(this).hasClass("photos")) {
                    let transaction = db.transaction(["photos"], "readonly");
                    let objectStore = transaction.objectStore("photos");
                
                    let request = objectStore.getAll();
                
                    request.onsuccess = function(event) {
                        let photos = event.target.result;
                        let content = "";
                        photos.forEach(photo => {
                            if (photo.person == id) {
                                content += `
                                <div data-person="${photo.person}" data-id="${photo.id}">
                                    <img src="${photo.src}" style="width:100%;height:100%;object-fit:cover;"/>
                                </div>`;
                            }
                        })
                        container.innerHTML = "";
                        container.insertAdjacentHTML("afterbegin", `${content}`);

                        $(".profile-content > div").click(function(event){
                            event.stopImmediatePropagation();
                            alert($(this).children());
                        })
                    };
                    
                } else if ($(this).hasClass("videos")) {
                    let transaction = db.transaction(["videos"], "readonly");
                    let objectStore = transaction.objectStore("videos");
                
                    let request = objectStore.getAll();
                 
                    request.onsuccess = function(event) {
                        let videos = event.target.result;
                        let content = "";
                        videos.forEach(video => {
                            if (video.person == id) {
                                content += `
                                <div data-person="${video.person}" data-id="${video.id}">
                                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="#fff" class="bi bi-play-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>
                                        </svg>
                                    </div>
                                    <video autoplay controls style="width:100%;height:100%;object-fit:cover;">
                                        <source src="${video.src}" type="video/mp4">
                                    </video>
                                </div>`;
                            }
                        })
                        container.innerHTML = "";
                        container.insertAdjacentHTML("afterbegin", `${content}`);

                        $(".profile-content > div").click(function(event){
                            event.stopImmediatePropagation();
                            alert($(this).children());
                        })
                    };
                }
                
            })
        
            $(".go-back").click(function(event){
                event.stopImmediatePropagation();
                $(".profile-window").remove();
            })
    }
}


function addSomeone(src, name, age, addr, cback) {
    let transaction = db.transaction(["people"], "readwrite");
    let objectStore = transaction.objectStore("people");

    let personData = {
        name: name, 
        src : src, 
        age : age, 
        address: addr
    }

    currentPerson = personData;
    
    let request = objectStore.add(personData);

    request.onsuccess = function(event) {
        console.log("Data added successfully:", personData);

        if (cback) {
            cback(event.target.result)
        }
    };

    request.onerror = function(event) {
        console.log("Error adding data:", event);
    };
}

function addPhotos(src, id) {
    let transaction = db.transaction(["photos"], "readwrite");
    let objectStore = transaction.objectStore("photos");

    let request = objectStore.add({person: id, src: src});
    
    request.onsuccess = function(event) {
        console.log("Data added successfully:", {person: id, src: src});
    };

    request.onerror = function(event) {
        console.log("Error adding data:", event);
    };
}

function addVideos(src, id) {
    let transaction = db.transaction(["videos"], "readwrite");
    let objectStore = transaction.objectStore("videos");

    let request = objectStore.add({person: id, src: src});
    
    request.onsuccess = function(event) {
        console.log("Data added successfully:", {person: id, src: src});
    };

    request.onerror = function(event) {
        console.log("Error adding data:", event);
    };
}


$(".add-someone").click(function(event){
    event.stopImmediatePropagation();
    let dpSrc;

    document.body.insertAdjacentHTML("afterbegin", `
    <div class="pop-up-window">
        <button class="cancel" style="position:absolute;left:5px;top:5px;">Cancel</button>
        <div class="form">
            <div style="border-bottom:1px solid rgba(0,0,0,0.1);margin-bottom:20px;padding:20px;font-size:17px;text-align:center;">Add a new person</div>
            Person profile picture: (required)
            <input type="file"/>
            Person name: (required)
            <input type="text" placeholder="Name" id="name"/>
            Person age: (optional)
            <input type="number" placeholder="Age" id="age"/>
            Person address: (optional)
            <input type="text" placeholder="Address" id="address"/>
        </div>
        <button class="add" style="width:90%;position:absolute;left:50%;bottom:15px;transform:translateX(-50%);">Add</button>
    </div>`);

    $(".cancel").click(function(event){
        event.stopImmediatePropagation();
        $(".pop-up-window").remove();
    })

    $("input[type='file']").change(function(event){
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageSrc = e.target.result;
                dpSrc = imageSrc;
            };
            reader.readAsDataURL(file);
        }
    })

    $(".add").click(function(event){
        event.stopImmediatePropagation();
        let name = $("#name").val();
        let age = $("#age").val();
        let addr = $("#address").val();

        addSomeone(dpSrc, name, age, addr, function(id) {
            let obj = {
                id: id,
                name: name,
                src: dpSrc,
                age: age,
                address: address
            }

            currentPerson = obj;

            let peopleContainer = document.getElementById("people-container");
            let content = "";
            content += `
            <div data-person="${currentPerson.id}" data-name="${currentPerson.name}" data-src="${currentPerson.src}" data-age="${currentPerson.age}" data-address="${currentPerson.address}" data-p='${currentPerson}'>
                <img src="${currentPerson.src}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>`;

            peopleContainer.insertAdjacentHTML("afterbegin", `${content}`);

            $(".pop-up-window").remove();
            document.body.insertAdjacentHTML("afterbegin", `
            <div class="pop-up-window">
                <button class="add-later" style="position:absolute;left:5px;top:5px;">Add later</button>
                <div class="form" style="margin-top: 20px !important;">
                    <div style="border-bottom:1px solid rgba(0,0,0,0.1);margin-bottom:20px;padding:20px;font-size:15px;font-weight:bold;text-align:center;display:flex;flex-direction:column;align-items:center;">
                        <div style="width: 70px;height: 70px;border-radius: 50%;box-shadow: 0 0 2px #000;margin-right: 5px;overflow:hidden;margin-bottom:10px;">
                            <img src="${dpSrc}" style="width:100%;height:100%;object-fit:cover;">
                        </div>
                        ${name}
                        <a style="color:blue">
                            Visit profile
                        </a>
                    </div>
                    <div class="content">
                        <input type="file" id="photos" style="display:none;" accept="image/*" multiple/>
                        <input type="file" id="videos" style="display:none;" accept="video/*" multiple/>
                        <div class="add-photos">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                            </svg>
                            Add photos
                        </div>
                        <div class="add-videos">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                            </svg>
                            Add videos
                        </div>
                        <div class="add-scripts">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                            </svg>
                            Add scripts
                        </div>
                    </div>
                </div>
                <button class="send-message" style="width:90%;position:absolute;left:50%;bottom:10px;transform:translateX(-50%);">Send a message</button>
            </div>`);

            $(".send-message").click(function(event){
                event.stopImmediatePropagation();
                $("#chat").html("");
                $(".pop-up-window").remove();

                $("#someone-name").html(currentPerson.name);
                $("#someone-img img").attr("src", currentPerson.src);

                $(".side-bar").animate({
                    "left" : "-80%"
                }, 500);
                $(".open-side-bar").html(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>`);
                $(".open-side-bar").css("right", "-40px");
                hidden = true;
            })

            $(".add-later").click(function(event){
                event.stopImmediatePropagation();
                location.reload();
            })

            $(".add-photos").click(function(event){
                event.stopImmediatePropagation();
                $("input#photos").click();
            })

            $("a").click(function(event){
                event.stopImmediatePropagation();
                viewProfile(id, dpSrc);
            })

            $("input#photos").on('change', function(event) {
                const files = event.target.files;
                $('#previewContainer').empty();  // Clear previous previews

                if (files.length > 0) {
                    Array.from(files).forEach(file => {
                        const reader = new FileReader();

                        reader.onload = function(e) {
                            let imageSrc = e.target.result;
                            addPhotos(imageSrc, id);
                        };

                        reader.readAsDataURL(file);
                    });
                    notif("Photos added!");
                }
                
            });

            $(".add-videos").click(function(event){
                event.stopImmediatePropagation();
                $("input#videos").click();
            })

            $(".add-scripts").click(function(event){
                event.stopImmediatePropagation();
                addScripts(id);
            })

            $("input#videos").on('change', function(event) {
                const files = event.target.files;

                if (files.length > 0) {
                    Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            let videoSrc = e.target.result;
                            addVideos(videoSrc, id);
                        };
                        reader.readAsDataURL(file);
                    });

                    notif("Videos added!");
                    
                }
            });
        });
    })
})
