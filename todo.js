/**
 *
 * @author: 1751358 李澎生
 *
 */
window.addEventListener('load', load);

function $(str){
    return document.querySelector(str);
}

function $All(str){
    return document.querySelectorAll(str);
}

let months = ["Jan .", "Feb .", "Mar .", "Apr .", "May .", "Jun .", "Jul .", "Aug ." ,"Sept .", "Oct .", "Nov .", "Dec ."];
let data = {};

function load() {
    updateTime();
    setInterval(updateTime, 60000);

    $("input.input-todo").addEventListener("focus", onFocus);
    $("input.input-todo").addEventListener("blur", onBlur);
    $(".input-deadline").valueAsDate = new Date();

    $All(".tool-list li a").forEach(element => {
        element.addEventListener("click", filter);
    });

    $(".clear-complete").addEventListener("click", clear);

    $(".input-todo").addEventListener("keyup", add);

    $(".toggle-all").addEventListener("change", completeAll)



}

/* Update Time */
function updateTime() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();

    $(".day").innerHTML = day < 10 ? "0" + day.toString() : day.toString();
    $(".month").innerHTML = months[month].toString();
    $(".year").innerHTML = year.toString();

    $(".clock").innerHTML = (hour < 10 ? "0" + hour.toString() : hour.toString()) +
        ":" + (minute < 10 ? "0" + minute.toString() : minute.toString());
}

/* Control Input Label */
function onFocus() {
    // console.log(this);
    this.parentElement.querySelector("label.input-label").classList.add("input-label-focused")
}

function onBlur() {
    if (this.value !== ""){

    }else{
        this.parentElement.querySelector("label.input-label").classList.remove("input-label-focused")
    }

}

/* Change Filter */
function filter() {
    $All(".tool-list li a").forEach(element => {
        element.classList.remove("selected")
    });

    this.classList.add("selected");

    update()
}

/* Add TodoItems*/
function add(event) {
    if (event.key !== "Enter") return null;

    let text = $(".input-todo").value;
    if (text === '') return null;
    $(".input-todo").value = "";

    let currentDate = $(".input-deadline").value;
    if (data[currentDate] === undefined) data[currentDate] = [];
    let old = data[currentDate];
    data[currentDate] = old.concat([text]);
    let template = document.getElementById(currentDate);
    let info;
    if (template) {
        info = template.querySelector(".item-info").cloneNode(true);

    } else {
        template = $("#template").cloneNode(true);
        template.id = currentDate;
        template.querySelector(".item-deadline").innerHTML=currentDate;
        template.classList.remove("none");

        info = $("#info-template").cloneNode(true);
    }

    info.querySelector(".todo-label").innerHTML = text;

    info.querySelector(".delete").addEventListener("click", function () {
        let parent = info .parentNode;
        parent.removeChild(info);
        if (parent.childElementCount <= 1){
            $(".item-box").removeChild(parent.parentNode.parentNode);
        }
    });

    info.querySelector(".toggle").addEventListener("change", function () {
        if (this.checked){
            info.querySelector(".todo-label").classList.add("label-completed");
            let count = parseInt($(".todo-count").innerHTML.split(' ')[1]);
            count -= 1;
            $(".todo-count").innerHTML = " " + count.toString() + "  todo";
        } else {
            info.querySelector(".todo-label").classList.remove("label-completed");
            let count = parseInt($(".todo-count").innerHTML.split(' ')[1]);
            count += 1;
            $(".todo-count").innerHTML = " " + count.toString() + "  todo";
        }
    });

    info.querySelector(".todo-label").addEventListener("dbclick", function () {

    });


    info.classList.remove("none");

    template.querySelector(".item-list").insertBefore(info, template.querySelector(".item-list").firstChild);
    $(".item-box").appendChild(template);

    let count = parseInt($(".todo-count").innerHTML.split(' ')[1]);
    count += 1;
    $(".todo-count").innerHTML = " " + count.toString() + "  todo"

}

/* Update Item List */
function update() {

}

/* Complete All*/
function completeAll() {
    let checked = this.checked;
    let infos = $All(".item-info").forEach(element =>{
        element.querySelector(".toggle").checked = checked;
        if (checked){
            element.querySelector(".todo-label").classList.add("label-completed")
        } else {
            element.querySelector(".todo-label").classList.remove("label-completed")
        }
    });

    if (checked){
        $(".todo-count").innerHTML = " 0"  + "  todo"
    } else {
        let count = $All(".item-info").length - $All(".box").length;
        console.log(count);
        $(".todo-count").innerHTML = " " + count.toString() + "  todo"
    }
}

/* Clear Completed Item */
function clear() {
    let items = $All(".item-info").forEach(element => {
        if (element.querySelector(".todo-label").classList.contains("label-completed")){
            element.parentNode.removeChild(element);
        }
    });

    let block = $All(".box").forEach(element => {
        if (element.querySelector(".item-list").childElementCount <= 1){
            if(element.id !== "template"){
                $(".item-box").removeChild(element);
            }
        }
    })
}