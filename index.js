const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const fs = require('fs');
const remote = electron.remote
var dialog = remote.dialog
const main = remote.require('./main.js')
const ul = document.querySelector("ul");

var button = document.createElement("button")
button.textContent = "Open Window"
button.className = "w3-button w3-white w3-card w3-bar"
document.getElementById("button-place").appendChild(button)
button.addEventListener('click', ()=>{
	var CURWIN = remote.getCurrentWindow()
	main.openWin('secondWin')
	CURWIN.close()
}, false)

ipcRenderer.on('item:add',
	function (e, arr) {
		// body...
		const li = document.createElement("li");
		const div = document.createElement("div");
		const itemRemover = document.createElement("span");
		const span1 = document.createElement("span");
		const br = document.createElement('br');
		const span2 = document.createElement("span");
		const itemText = document.createTextNode(arr[0]);
		const titleText = document.createTextNode(arr[1]);
		
		div.className = 'w3-bar-item';
		span1.className = "w3-large";
		li.className = 'w3-bar';
		itemRemover.innerHTML = "&times;"
		itemRemover.onclick = function(e){
			removeItem(e, this.parentElement)
		}
		itemRemover.className = "w3-bar-item w3-button w3-xlarge w3-right"
		// li.classList.add("w3-panel");
		span1.appendChild(titleText);
		span2.appendChild(itemText);
		span1.appendChild(br);
		div.appendChild(span1);
		div.appendChild(span2);
		li.appendChild(itemRemover)
		li.appendChild(div)
		ul.appendChild(li);
	}
);

ipcRenderer.on('item:clear', function (e, item) {
	// body...
	ul.innerHTML = ''
});

ul.addEventListener('dblclick', removeItem)

function removeItem(e, el){
	console.log(el);
	if (el){
		el.remove();
	}else{
		e.target.remove()
	}
}

document.getElementById('save-btn').onclick = (e)=>{
	dialog.showSaveDialog((fileName)=>{
		if (fileName === undefined){alert('Please set name for the file');return}
		var content = document.getElementById('content').value
		console.log("Ini adalah content: "+content)
		fs.writeFile(fileName, content, (err)=>{
			if (err) console.log(err);
			alert("The file has been successfully saved")
		})
	});
}