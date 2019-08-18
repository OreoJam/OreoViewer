const electron = require ('electron');

const fs = require('fs');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;

process.env.NODE_ENV = 'development';

/* Start */
app.on('ready', () => {
  /* make new window */
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/mainwindow.html`);

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed', () =>{
    app.quit();
  });
});

// Create menu template
const mainMenuTemplate = [
  {
      label:''
  },
  {
      label:'Menu',
      submenu: [
          {
              label: 'Quit',
              accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
              click(){
                  app.quit();
              }
          }
      ]
  }
];

/* main function <- submit */
ipcMain.on('message:send', (event, message) => {
  /* test */
  //console.log("TEST: " + message);
  mainProc(message);
});

function mainProc(message) {
  
  /* make json file name */
  const json_file = getFileName(message);

  /* current position of message */
  let curPosition = 0;
  /* result string */
  let resultString = '';
  /* object for values in json file */
  let valueObj;

  /* read JSON file */
  let data;
  try {
    data = fs.readFileSync(json_file);
  } catch (err) {
    /* send error message to main window */
    mainWindow.webContents.send('message:print', 'Not found JSON file');
    return;
  }
  data = JSON.parse(data);

  for (let i in data) {
    
    resultString = '';

    if (data[i].values === undefined) {
      resultString = resultString.concat(data[i].kname + ' | ');
      resultString = resultString.concat(message.substr(curPosition, data[i].length));     
    } else {
      resultString = resultString.concat(data[i].kname + ' | ');
      
      valueObj = data[i].values;
      for (let j in valueObj) {
        // console.log('valueJ: ' + j);
        if (j === message.substr(curPosition, data[i].length)) {
          resultString = resultString.concat(message.substr(curPosition, data[i].length));
          resultString = resultString.concat(' | ');
          resultString = resultString.concat(valueObj[j]);
          break;
        }
      } // end of for
    }
    
    /* send to main window */
    mainWindow.webContents.send('message:print', resultString);

    /* move to next item */
    curPosition += data[i].length;

    /* check end of message */
    if (curPosition >= message.length) {
      break;
    }    
  }
} // end of mainProc

/* make file name to find json file */
function getFileName(message) {
  /* find KRX tr_code */
  let tr_code = message.substr(11, 11);

  /* some tr_codes use one file structure */
  if (tr_code === 'TCHODR10001' || tr_code === 'TCHODR10002' || 
  tr_code === 'TCHODR10003' || tr_code === 'TCHAOR10001' || 
  tr_code === 'TCHAOR10003') {
    tr_code = 'TCHODR10001';
  }
  if (tr_code === 'TTRODP11301' || tr_code === 'TTRODP11321' || 
  tr_code === 'TTRODP11303' || tr_code === 'TTRODP11305' || 
  tr_code === 'TTRODP11322' || tr_code === 'TTRODP11306' ||
  tr_code === 'TTRODP11308' || tr_code === 'TTRODP11310' ||
  tr_code === 'TTRODP11311' || tr_code === 'TTRODP11312') {
    tr_code = 'TTRODP11301';
  }
  if (tr_code === 'TTRTDP21301' || tr_code === 'TTRTDP21302' || 
  tr_code === 'TTRTDP21303') {
    tr_code = 'TTRTDP21301';
  }

  /* filename */
  /* let fileName = './data/' + tr_code + '.json'; */
  let fileName = `${__dirname}/data/` + tr_code + '.json';

  /* send to main window */
  mainWindow.webContents.send('message:print', fileName);
  
  return fileName;
}