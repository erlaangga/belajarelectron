const electron = require("electron");
const {app, BrowserWindow, Menu, ipcMain, Tray} = electron;
const url = require("url");
const path = require("path");
// const mongo = require('mongojs')
const JSONStorage = require('node-localstorage').JSONStorage;
var storageLocation = app.getPath('userData');
global.nodeStorage = new JSONStorage(storageLocation);

require('electron-reload')(__dirname, {electron: path.join(__dirname, 'node_modules', '.bin', 'electron')})

process.setMaxListeners(0)
// process.env.NODE_ENV = 'production'

const iconPath = path.join(__dirname, 'assets/icon/png/icon.png');

let win;
let addWin;
let winProp = {
	minWidth:640, 
	minHeight:480, 
	// frame:false, 
	titleBarStyle:'hidden', 
	show:false, 
	backgroundColor: '#12AA12',
	icon: iconPath,
	x: undefined,
	y: undefined,
	width: undefined,
	height: undefined,
};
var windowState = {}

try{
	windowState = global.nodeStorage.getItem('windowstate') || {};
	if (windowState){
		winProp.x = windowState.bounds && windowState.bounds.x || undefined
		winProp.y = windowState.bounds && windowState.bounds.y || undefined
		winProp.width = windowState.bounds && windowState.bounds.width || 640;
		winProp.height = windowState.bounds && windowState.bounds.height || 480;
	}
} catch(err){
	console.log(err)
}


function createWindow(){
	winProp.show = false
	win = new BrowserWindow(winProp);
	if (windowState) {
		if (windowState.isMaximized) {
			win.maximize();
		}
	}
	file = url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes:true
	})

	// win.loadFile('index.html');
	win.loadURL(file);
	console.log(file);
	// win.webContents.openDevTools();

	win.once('ready-to-show', ()=>{
		win.show()
		win.focus()
	})

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);

	['resize', 'move', 'close'].forEach(function(e) { 
		win.on(e, function() { 
			storeWindowState(); 
		}); 
	});

	var storeWindowState = function() { 
		windowState['isMaximized'] = win.isMaximized(); 

		if (!windowState.isMaximized) { 
		    // only update bounds if the window isn’t currently maximized
		    windowState.bounds = win.getBounds(); 
		}

		global.nodeStorage.setItem('windowstate', windowState);
	};

	appTray = new Tray(iconPath)
	appTray.setToolTip("This is an electron tray application")
	appTray.setContextMenu(mainMenu);
}

app.on('ready', createWindow);

exports.openWin = (filename)=>{
	winProp['show'] = true
	win = new BrowserWindow(winProp)
	win.loadFile(filename + '.html')
}

app.on('window-all-closed', ()=>{
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

app.on('activate', ()=>{
	if(win==null){
		createWindow();
	}
})

function createAddWindow(){
	addWin = new BrowserWindow({minWidth:300, minHeight:200, maxWidth:300, maxHeight:200, title: 'Add Item', icon: path.join(__dirname, 'assets/icon/png/icon.png'),
		x: 100,
		y: 200});
	file = url.format({
		pathname: path.join(__dirname, 'addWindow.html'),
		protocol: 'file:',
		slashes: true,
	})
	
	// win.loadFile('index.html');
	addWin.loadURL(file);
	addWin.on('close', ()=>{
		win.on("close", ()=>{
			console.log('close')
		})
		addWin = null;
	})
	// Garbage Collection handle
	win.on("close", ()=>{
		app.quit();
	})
}

const mainMenuTemplate = [
{
	'label':'File',
	'submenu':[
	{
		label:'Add Item',
		accelerator: 'F1',
		click(){
			createAddWindow();
		}
	},
	{
		label:'Clear Item',
		click(){
			win.webContents.send('item:clear');
		}
	},
	{
		label:'Activate Developer Mode',
		click(){
			process.env.NODE_ENV = 'debug'
		}
	},
	{
		label:'Quit',
		accelerator: 'CommandOrControl+Q',  // process.platform == 'darwin'? 'Command+Q':'Ctrl+Q', // oldschool way
		click(){
			app.quit()
		}
	}
	]
}
]

if (process.env.NODE_ENV != 'production') {
	mainMenuTemplate.push({
		'label':'Developer Tools',
		submenu:[
		{
			label:'Toggle DevTools',
			accelerator:"CommandOrControl+I",
			checked : false;
			click(item, focusedWindow){
				focusedWindow.toggleDevTools();
			}
		},
		{
			role:'reload'
		}
		]
	})
}

// Add empty object to menu
if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({})
}

ipcMain.on('item:add', function(e, arr){
	win.webContents.send('item:add', arr);
	addWin.close();
})

ipcMain.on('item:clear', function(e, item){
	win.webContents.send('item:clear', item);
})