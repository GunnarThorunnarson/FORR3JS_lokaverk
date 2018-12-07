//"use strict";

// variables
let imgGallery = document.getElementById('gallery');
let currentImgs = imgGallery.getElementsByTagName('img');
let currentImgDivs = imgGallery.getElementsByTagName('div');
let search = document.getElementById('filter-search');
let buttons = document.getElementsByClassName('filter-button');
//let dateFrom = document.getElementById('dateFrom');
//let dateTo = document.getElementById('dateTo');

let stadsetningar = {
  Hofudborgin: ['Háteigskirkja', 'Spot', 'Fríkirkjan', 'Fíladelfía', 'Lindakirkja', 'Bæjarbíó', 'Hallgrímskirkja'],
  Landsbyggdin: ['Blönduóskirkja', 'Bíóhöllin', 'Akureyrarkirkja', 'Siglufjarðarkirkja']
};

// event listeners
search.addEventListener("input", filter);

// json data
let request = new XMLHttpRequest();
request.open('GET', 'https://apis.is/concerts', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Success!

    let data = JSON.parse(request.responseText);
    //console.log(data);
    for(let i of data.results) {
      let newImg = new Image(300, 150);
      let imgDiv = document.createElement('div');
      imgDiv.className = 'imgDiv';
      let tonlNafn = document.createElement('p');
      let tonlStad = document.createElement('p');

      newImg.src = i.imageSource;
      newImg.dataset.tags = i.eventHallName.toLowerCase();
      newImg.alt = i.eventDateName.toLowerCase();

      tonlNafn.innerHTML = i.eventDateName;
      tonlStad.innerHTML = i.eventHallName;

      imgGallery.appendChild(imgDiv);
      imgDiv.appendChild(newImg);
      imgDiv.appendChild(tonlNafn);
      imgDiv.appendChild(tonlStad);

      // til ad baeta adeins vid filterana, getur verid vitlaust ef margir stadir med sama nafn i gaganasafninu theirra
      let splitGroupName = i.userGroupName.split(' ');
      let grequest = new XMLHttpRequest();
      for(let sgn of splitGroupName) {
        if (sgn !== 'ehf'){
          grequest.open('GET', 'https://apis.is/company?name=' + sgn, true);
          //console.log('sgn:',sgn);
        } else {
          grequest.open('GET', 'http://apis.is/company?name=' + i.userGroupName, true);
          //console.log('var med ehf:', i.userGroupName);
        }
      }

      grequest.onload = function() {
        if (grequest.status >= 200 && grequest.status < 400) {
          let compData = JSON.parse(grequest.responseText);
          //console.log('allt compdata: ', compData);
          for(let company of compData.results){
            let splitAddress = company.address.split(' ');
            //console.log('splitAddress:',splitAddress);
            if (splitAddress.includes('Reykjavík') === true && stadsetningar.Hofudborgin.includes(i.eventHallName) === false && stadsetningar.Landsbyggdin.includes(i.eventHallName) === false) {
              stadsetningar.Hofudborgin.push(i.eventHallName);
              //console.log('sett inn i Hofudborgin:', i.eventHallName);
            } else if (splitAddress.includes('Reykjavík') === false && stadsetningar.Landsbyggdin.includes(i.eventHallName) === false && stadsetningar.Hofudborgin.includes(i.eventHallName) === false) {
              stadsetningar.Landsbyggdin.push(i.eventHallName);
              //console.log('sett inn i Landsbyggdin:', i.eventHallName);
              //console.log('thetta er address:', company.address);
            }
          }
        }
      }

      grequest.send();
      }

  } else {
    // We reached our target server, but it returned an error

  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();

// buttons
Vue.component('todo-item', {
  template: '\
    <li>\
      <button class="filter-button" v-on:click="$emit(\'button-filter\')">{{ title }}</button>\
    </li>\
  ',
  props: ['title']
})

let buttonsVue = new Vue({
  el: '#todo-list-buttons',
  data: {
    newTodoText: '',
    todos: [
      {
        id: 1,
        title: 'Hofudborgin',
      },
      {
        id: 2,
        title: 'Allt landid',
      },
      {
        id: 3,
        title: 'Landsbyggdin'
      }
    ],
    nextTodoId: 4
  },
  methods: {
    buttonFilter: function buttonFilter(title) {
      buttonActive(title);
      if(title === 'Allt landid') {
        for (oneImg of currentImgs) {
          oneImg.parentNode.style.display = '';
        }

      } else {

        let confirmedStad = [];

        for(let oneImg of currentImgs) {
          let splitTags = oneImg.dataset.tags.split(' ');
          for(let stad of stadsetningar[title]) {
            if (splitTags.includes(stad.toLowerCase()) === true) {
              confirmedStad.push(oneImg);
            } else {
              //ekkert
            }
          }
        }

        for(let confImg of currentImgs) {
          if(confirmedStad.includes(confImg) === true) {
            confImg.parentNode.style.display = '';
          } else {
            confImg.parentNode.style.display = 'none';
          }
        }
      }
    }
  }
})

// functions
function filter() {
  let query = this.value.trim().toLowerCase();

  for(let oneImgDiv of currentImgDivs) {
    if (oneImgDiv.childNodes[0].alt.includes(query) === true){
      oneImgDiv.hidden = false;
      for(let test of oneImgDiv.childNodes) {
        test.hidden = false;
      }

    } else {
      oneImgDiv.hidden = true;
      oneImgDiv.style.margin = '0px';
      for(let test of oneImgDiv.childNodes) {
        test.hidden = true;
      }
    }
  }
}

function buttonActive(innihald) {
  for (bttns of buttons) {
    if (bttns.textContent !== innihald) {
      bttns.classList.remove('active');
    } else {
      bttns.classList.add('active');
    }
  }
}

buttonActive('Allt landid');

//
