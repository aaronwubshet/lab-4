console.log("IT’S ALIVE!");

function $$ (selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}


let pages = {
	".": "Home",
	"projects": "Projects",
    "contact": "Contact",
    "resumeCV": "Resume/CV",
	"https://github.com/aaronwubshet": "GitHub"
};

let nav = document.createElement("nav");
// document.body.prepend(nav);

// for (let url in pages) {
    
    
// 	let title = pages[url];
// 	let a = document.createElement("a");
//     a.href = url;
//     a.textContent = title;
//     nav.append(a);

//     if (a.host === location.host && a.pathname === location.pathname) {
//         a.classList.add("current");
//     }
//     else if (a.host != location.host) {
//         a.target = "_blank";
//     }
// };

// document.body.insertAdjacentHTML("afterbegin", `
// <label class="color-scheme-button">
//     Theme:
//     <select>
//         <option value="light dark">Automatic</option>
//         <option value="dark">Dark</option>
//         <option value="light">Light</option>
//     </select>
// </label>`
// );

// let select = document.querySelector("select");

// // select.addEventListener("input", function (event) {
// // 	console.log("color scheme changed to", event.target.value);
// //     document.documentElement.style.setProperty("color-scheme", event.target.value);
// //     localStorage.colorScheme = event.target.value
// // });

// if ("colorScheme" in localStorage){
//     document.documentElement.style.setProperty("color-scheme", localStorage.colorScheme);
//     select.value = localStorage.colorScheme;
// }

let form = document.forms["email-form"];
let new_url = "mailto:hello@aaronwubshet.com";
form?.addEventListener("submit", (event) => { 
    event.preventDefault();
    let data = new FormData(form);
    location.href = new_url.concat("?",'subject=',encodeURIComponent(data.get("subject")),'&','body=',encodeURIComponent(data.get("body")));
});


