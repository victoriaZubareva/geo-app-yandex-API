import formTemplate from './form.hbs';

ymaps.ready(init);

let myApiMap,
    myGeoObjects = [],
    clusterer,
    coords,
    clickAddress,
    location = {},
    placemarks,
    popup = document.querySelector('#popup'),
    address = document.querySelector('#address'),
    buttonClose = document.querySelector('#close'),
    buttonAdd = document.querySelector('#add');

function init() {
    myApiMap = new ymaps.Map("map", {
        center: [55.74, 37.62],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
    });

    /* создаем кластеризатор геообъектов */
    clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedDarkGreenClusterIcons',
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
    });

    clusterer.add(myGeoObjects); // добавляем массив данных в кластеризатор
    myApiMap.geoObjects.add(clusterer);
    
    placemarks = getPlacemarks();

    if (placemarks) {
        placemarks.forEach(placemark => {
            let reviews = placemark.reviews;
            let myPlacemarks = reviews.map(review => {
                let param = {
                    location: review.location,
                    coords: placemark.coords,
                    address: placemark.address,
                    date: review.date,
                    commentText: review.commentText
                };

                return createPlacemark(placemark.coords, param);
            });

            clusterer.add(myPlacemarks);
        });
    }
    function clickMap() {
        myApiMap.geoObjects.events.add('click', e => {
            let target = e.get('target')
    
            if (target.options.getName() == 'geoObject') {
                e.preventDefault();
                let coords = target.geometry.getCoordinates();
                let reviews = getPlacemarks();
    
                reviews.forEach(review => {
                    if (review.coords == coords) {
                        popupOpen(review);
                    }
                });
            }
        });
    }
    clickMap();
    clickBalloon();
    markCoords();
    addPoint();
    hidePopup();
}


function getPlacemarks() {
    if (placemarks != null) {
        return placemarks;
    }
    
    if (localStorage.placemarks) {
        placemarks = JSON.parse(localStorage.placemarks);

        return placemarks;
    }
    placemarks = [];

    return placemarks; 
}

function markCoords() {
    /* обрабатываем клик по карте */
    myApiMap.events.add('click', e => {
        coords = e.get('coords');
        

        ymaps.geocode(coords).then(result => {
            
            clickAddress = result.geoObjects.get(0).properties.get('text');
            setLocation({ 
                coords: coords,
                address: clickAddress 
            });
            popupOpen();
        });
    });
}

function  clickBalloon() {
        document.addEventListener('click', e => {
            let targetCoords = e.target.dataset.coords;

            if (targetCoords) {
                e.preventDefault();
                let reviews = getPlacemarks();
                let coordsString = targetCoords.split(',');
                let coords = coordsString.map(coord => {
                    debugger;
                    return +coord;
                });

                for (let i = 0; i < reviews.length; i++) {
                    let review = reviews[i];

                    if (review.coords.join('') == coords.join('')) {
                        showPopup(review);
                    }
                }
            }
        });
    }


function setLocation(data) {
    debugger;
    location = data;

    return location;
}

function getformInputsData(formInputs) {

    let inputData = {};

        inputData.date = getDate();

        for (let i = 0; i < formInputs.length; i++) {
            let inputAttributes = formInputs[i].dataset.key;
            let inputValue = formInputs[i].value;

            inputData[inputAttributes] = inputValue;
        }

        return inputData;
}

function getDate() {
    let date = new Date();
    let day = date.getDate();
    let customDay = day < 10 ? '0' + day : day;
    let month = date.getMonth() + 1;
    let customMonth = month < 10 ? '0' + month : month;
    let year = date.getFullYear();
    let hours = date.getHours();
    let customHours = hours < 10 ? '0' + hours : hours;
    let minutes = date.getMinutes();
    let customMinutes = minutes < 10 ? '0' + minutes : minutes;
    let seconds = date.getSeconds();
    let customSeconds = seconds < 10 ? '0' + seconds : seconds;
    let fullDate = `${customDay}/${customMonth}/${year}`;
    let fullTime = `${customHours}:${customMinutes}:${customSeconds}`;

    return `${fullTime} ${fullDate}`;
}

function createDat(param) {
    return `<a href="#" class="balloon_body__link" data-coords="${param.coords}">${param.address}</a><br>
    <p>${param.commentText}</p>`
}

function createPlacemark(coords, param) {
    const myPlacemark = new ymaps.Placemark(coords, {
        balloonContentHeader: param.location,
        balloonContentBody: createDat(param),
        balloonContentFooter: param.date
    },{
        preset: 'islands#darkGreenDotIcon'
    });

    return myPlacemark;
}

function insertLi(html, data) {
    debugger;
    return html(data)
};


function updatePlacemarks(placemark, data) {
    getPlacemarks();
    console.log(placemarks);
    if (placemarks.length) {
        let existPlacemark = false;

        placemarks.forEach(placemark => {
            if (placemark.coords.join('') == location.coords.join('')) {
                placemark.reviews.push(data);
                existPlacemark = true;
            }
        });

        if (!existPlacemark) {
            placemarks.push(placemark);
        }
    } else {
        placemarks.push(placemark);
    }
}

function addPoint () {
    buttonAdd.addEventListener('click', function (e) {
        debugger;
        e.preventDefault();

        let formInputs = document.querySelectorAll('*[data-key]');
        let inputData = getformInputsData(formInputs);
        let reviews = document.querySelector('.reviews__list');
        let location = { 
            coords: coords, 
            address: clickAddress 
        };
        let placemark = {
            coords: location.coords,
            address: location.address,
            reviews: [inputData]
        };
        let param = {
            location: inputData.location,
            coords: location.coords,
            address: location.address,
            date: inputData.date,
            commentText: inputData.commentText
        };

        let myPlacemark = createPlacemark(location.coords, param);
        let userName = document.querySelector('.form__input');
        let userLocation = document.querySelector('.location');
        let userComment = document.querySelector('.form__textarea');

        if (userName.value !=='' && userLocation.value !=='' && userComment.value !=='') {

            reviews.innerHTML += insertLi(formTemplate, inputData);
            
            clusterer.add(myPlacemark);
            

            updatePlacemarks(placemark, inputData);
            localStorage.placemarks = JSON.stringify(getPlacemarks());
            
            clearInputValue();
        }
    })
}
/* открываем popup */
 function popupOpen(reviewObj) {

    let reviews = document.querySelector('.reviews__list');

    clearInputValue();

    reviews.innerHTML = '';

    if (reviewObj) {
        let coords = reviewObj.coords;
        let addressR = reviewObj.address;

        setLocation({ coords: coords, address: address });
        address.innerText = addressR;
        reviewObj.reviews.forEach(review => {
            reviews.innerHTML += insertLi(formTemplate, review);
        })
    } else {
        address.innerText = location.address;
    }

    popup.style.display = 'flex';
};


/*Очистка полей инпутов*/
function clearInputValue () {
    debugger;
    let userName = document.querySelector('.form__input');
    let userLocaton = document.querySelector('.location');
    let userComment = document.querySelector('.form__textarea');

    userLocaton.value ='';
    userName.value ='';
    userComment.value ='';
};

/*Закрытие popup окна*/
function hidePopup() {
    buttonClose.addEventListener('click', () => {
        popup.style.display = 'none';
        clearInputValue();
    })
};
